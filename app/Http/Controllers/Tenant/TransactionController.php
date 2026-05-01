<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant\WifiVoucher;
use App\Services\TenantService;
use App\Services\CampayService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function __construct(
        protected TenantService $tenantService,
        protected CampayService $campayService
    ) {}

    public function index(Request $request, $tenant_slug)
    {
        $status = $request->input('status');
        $dateStart = $request->input('date_start');
        $dateEnd = $request->input('date_end');
        $search = $request->input('search');

        $tenant = $this->tenantService->getCurrentTenant();
        $query = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($dateStart) {
            $query->whereDate('created_at', '>=', $dateStart);
        }

        if ($dateEnd) {
            $query->whereDate('created_at', '<=', $dateEnd);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('campay_reference', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('campay_transaction_id', 'like', "%{$search}%");
            });
        }

        $transactions = $query->latest()->paginate(20)->withQueryString();
        
        // Transform to include reseller net amount
        $transactions->getCollection()->transform(function ($tx) {
            $tx->reseller_net_amount = (int) $tx->reseller_amount_fcfa;
            if ($tx->platform_commission_fcfa == 0) {
                // Business Plan: Reseller pays 3% fee
                $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                $tx->reseller_net_amount -= $aggregatorFee;
            }
            return $tx;
        });

        return Inertia::render('tenant/transactions/index', [
            'transactions' => $transactions,
            'filters' => [
                'status' => $status ?? 'all',
                'date_start' => $dateStart,
                'date_end' => $dateEnd,
                'search' => $search,
            ]
        ]);
    }

    public function show($tenant_slug, $id)
    {
        $transaction = Payment::findOrFail($id);
        
        // Get associated voucher if exists
        $voucher = null;
        $package = null;
        $zone = null;
        
        if ($transaction->campay_reference) {
            $voucher = WifiVoucher::where('campay_reference', $transaction->campay_reference)
                ->with(['package.router'])
                ->first();
            
            if ($voucher && $voucher->package) {
                $package = $voucher->package;
                $zone = $voucher->package->router;
            }
        }
        
        // If no voucher found but we have meta data, try to get package info
        if (!$package && isset($transaction->meta['package_id'])) {
            $package = \App\Models\Tenant\WifiPackage::with('router')
                ->find($transaction->meta['package_id']);
            if ($package) {
                $zone = $package->router;
            }
        }

        // Calculate net amount for frontend
        $transaction->reseller_net_amount = (int) $transaction->reseller_amount_fcfa;
        if ($transaction->platform_commission_fcfa == 0) {
            $aggregatorFee = (int) round($transaction->amount_fcfa * 0.03);
            $transaction->reseller_net_amount -= $aggregatorFee;
        }

        return response()->json([
            'transaction' => $transaction,
            'voucher' => $voucher,
            'package' => $package,
            'zone' => $zone
        ]);
    }

    public function sync($tenant_slug, $id)
    {
        $transaction = Payment::findOrFail($id);
        
        if ($transaction->status !== 'pending' && $transaction->status !== 'processing') {
            return response()->json(['message' => 'Cette transaction a déjà un statut final.'], 400);
        }

        if (!$transaction->campay_reference) {
            return response()->json(['message' => 'Référence de paiement manquante.'], 400);
        }

        $statusResp = $this->campayService->checkTransactionStatus($transaction->campay_reference);

        if (!$statusResp) {
            return response()->json(['message' => 'Impossible de contacter le service de paiement.'], 500);
        }

        if ($statusResp['status'] === 'SUCCESSFUL') {
            // Update payment to success
            $transaction->update([
                'status' => 'completed',
                'campay_status' => 'SUCCESSFUL',
                'campay_transaction_id' => $statusResp['operator_reference'] ?? $transaction->campay_transaction_id,
                'campay_code' => $statusResp['code'] ?? $transaction->campay_code,
                'paid_at' => now(),
            ]);

            // Finalize voucher sale if it's a ticket payment
            if ($transaction->payment_type === 'ticket') {
                $voucherId = $transaction->ticket_id ?? $transaction->meta['voucher_id'] ?? null;
                $voucher = WifiVoucher::find($voucherId);
                
                if ($voucher && $voucher->status === 'available') {
                    $voucher->update([
                        'status' => 'sold',
                        'purchased_at' => now(),
                        'purchase_amount_fcfa' => $transaction->amount_fcfa,
                        'campay_reference' => $transaction->campay_reference,
                        'campay_code' => $statusResp['code'] ?? null,
                        'operator_reference' => $statusResp['operator_reference'] ?? null,
                    ]);
                }
            }

            return response()->json(['message' => 'Transaction validée avec succès !', 'status' => 'completed']);
        } elseif (in_array($statusResp['status'], ['FAILED', 'CANCELLED'])) {
            $transaction->update([
                'status' => 'failed',
                'campay_status' => $statusResp['status'],
            ]);
            return response()->json(['message' => 'Le paiement a échoué ou a été annulé.', 'status' => 'failed']);
        }

        return response()->json(['message' => 'Le paiement est toujours en attente.', 'status' => 'pending']);
    }
}

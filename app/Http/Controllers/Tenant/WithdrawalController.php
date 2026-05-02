<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Withdrawal;
use App\Models\Tenant\WithdrawalMethod;
use App\Models\Payment;
use App\Services\CampayService;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function __construct(
        protected CampayService $campayService,
        protected TenantService $tenantService
    ) {}

    public function index()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        $methods = WithdrawalMethod::all();
        $history = Withdrawal::with('method')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate current balance efficiently
        $totalNetSales = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->selectRaw('SUM(CASE WHEN platform_commission_fcfa = 0 THEN reseller_amount_fcfa - ROUND(amount_fcfa * 0.03) ELSE reseller_amount_fcfa END) as net_sales')
            ->value('net_sales') ?? 0;
            
        $totalWithdrawn = Withdrawal::where('status', 'completed')->sum('amount');
        
        $balance = (int)$totalNetSales - (int)$totalWithdrawn;

        return Inertia::render('tenant/withdrawals/index', [
            'methods' => $methods,
            'history' => $history,
            'balance' => $balance,
        ]);
    }

    public function addMethod(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string|regex:/^\+?237\d{9}$/',
            'label' => 'nullable|string|max:50',
        ]);

        $count = WithdrawalMethod::count();
        if ($count >= 2) {
            return back()->withErrors(['methods' => 'Vous pouvez avoir au plus 02 numéros de retrait.']);
        }

        WithdrawalMethod::create([
            'phone_number' => $request->phone_number,
            'label' => $request->label,
            'is_default' => $count === 0,
        ]);

        return back()->with('success', 'Numéro de retrait ajouté.');
    }

    public function deleteMethod($tenant_slug, $id)
    {
        $method = WithdrawalMethod::findOrFail($id);
        $method->delete();

        return back()->with('success', 'Numéro de retrait supprimé.');
    }

    public function initiate(Request $request)
    {
        $request->validate([
            'method_id' => 'required|exists:tenant.withdrawal_methods,id',
            'amount' => 'required|integer|min:100', // Example min amount
        ]);

        $tenant = $this->tenantService->getCurrentTenant();
        $method = WithdrawalMethod::findOrFail($request->method_id);

        // Check balance again
        $payments = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->get();
            
        $totalNetSales = 0;
        foreach ($payments as $payment) {
            $resellerAmount = (int) $payment->reseller_amount_fcfa;
            if ($payment->platform_commission_fcfa == 0) {
                // Business Plan: Reseller pays 3% fee
                $aggregatorFee = (int) round($payment->amount_fcfa * 0.03);
                $totalNetSales += ($resellerAmount - $aggregatorFee);
            } else {
                // Free Plan: Admin pays fee, Reseller gets full reseller_amount
                $totalNetSales += $resellerAmount;
            }
        }
        $totalWithdrawn = Withdrawal::where('status', 'completed')->sum('amount');
        $balance = $totalNetSales - $totalWithdrawn;

        if ($request->amount > $balance) {
            return back()->withErrors(['amount' => 'Solde insuffisant.']);
        }

        $ref = strtoupper(Str::random(10));
        $reference = 'WDR_' . $tenant->id . '_' . $ref;

        $withdrawal = Withdrawal::create([
            'method_id' => $method->id,
            'amount' => $request->amount,
            'status' => 'pending',
            'reference' => $reference,
        ]);

        // Call Campay
        $response = $this->campayService->withdraw([
            'amount' => $request->amount,
            'phone_number' => str_replace('+', '', $method->phone_number),
            'description' => "Retrait " . $tenant->name,
            'external_reference' => $reference,
        ]);

        if ($response && isset($response['reference'])) {
            $withdrawal->update([
                'external_reference' => $response['reference'],
                'status' => 'processing',
            ]);
            return back()->with('success', 'Demande de retrait initiée.');
        } else {
            $withdrawal->update([
                'status' => 'failed',
                'error_message' => $response['message'] ?? 'Erreur inconnue API Campay',
            ]);
            return back()->withErrors(['api' => 'Impossible de contacter le service de paiement.']);
        }
    }

    public function checkStatus($tenant_slug, $id)
    {
        $withdrawal = Withdrawal::findOrFail($id);

        if ($withdrawal->status !== 'processing' && $withdrawal->status !== 'pending') {
            return response()->json(['message' => 'Ce retrait a déjà un statut final.'], 400);
        }

        if (!$withdrawal->external_reference) {
            return response()->json(['message' => 'Référence externe manquante.'], 400);
        }

        $statusResp = $this->campayService->checkTransactionStatus($withdrawal->external_reference);

        if (!$statusResp) {
            return response()->json(['message' => 'Impossible de contacter le service de paiement.'], 500);
        }

        if ($statusResp['status'] === 'SUCCESSFUL') {
            $withdrawal->update([
                'status' => 'completed',
                'processed_at' => now(),
            ]);
            return response()->json(['message' => 'Retrait confirmé avec succès !', 'status' => 'completed']);
        } elseif (in_array($statusResp['status'], ['FAILED', 'CANCELLED'])) {
            $withdrawal->update([
                'status' => 'failed',
                'error_message' => $statusResp['message'] ?? 'Échec du retrait chez l\'opérateur.',
            ]);
            return response()->json(['message' => 'Le retrait a échoué ou a été annulé.', 'status' => 'failed']);
        }

        return response()->json(['message' => 'Le retrait est toujours en cours de traitement.', 'status' => 'processing']);
    }
}

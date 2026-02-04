<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant\WifiVoucher;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
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
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('campay_transaction_id', 'like', "%{$search}%");
            });
        }

        $transactions = $query->latest()->paginate(20)->withQueryString();

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

        return response()->json([
            'transaction' => $transaction,
            'voucher' => $voucher,
            'package' => $package,
            'zone' => $zone
        ]);
    }
}

<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Withdrawal;
use App\Models\Tenant\WithdrawalMethod;
use App\Models\Tenant\WifiVoucher;
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

        // Calculate current balance (voucher sales - withdrawals)
        $totalSales = WifiVoucher::whereNotNull('purchased_at')
            ->sum('purchase_amount_fcfa');
            
        $totalWithdrawn = Withdrawal::where('status', 'completed')->sum('amount');
        
        $balance = $totalSales - $totalWithdrawn;

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

    public function deleteMethod($id)
    {
        $method = WithdrawalMethod::findOrFail($id);
        $method->delete();

        return back()->with('success', 'Numéro de retrait supprimé.');
    }

    public function initiate(Request $request)
    {
        $request->validate([
            'method_id' => 'required|exists:withdrawal_methods,id',
            'amount' => 'required|integer|min:100', // Example min amount
        ]);

        $tenant = $this->tenantService->getCurrentTenant();
        $method = WithdrawalMethod::findOrFail($request->method_id);

        // Check balance again
        $totalSales = WifiVoucher::whereNotNull('purchased_at')
            ->sum('purchase_amount_fcfa');
        $totalWithdrawn = Withdrawal::where('status', 'completed')->sum('amount');
        $balance = $totalSales - $totalWithdrawn;

        if ($request->amount > $balance) {
            return back()->withErrors(['amount' => 'Solde insuffisant.']);
        }

        $reference = 'WDR-' . strtoupper(Str::random(10));

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
}

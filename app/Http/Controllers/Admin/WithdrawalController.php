<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformWithdrawal;
use App\Models\PlatformWithdrawalMethod;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class WithdrawalController extends Controller
{
    public function index()
    {
        $grossTotalVolume = Payment::where('status', 'completed')->sum('amount_fcfa');
        $payments = Payment::where('status', 'completed')->get();
        $totalPlatformNetRevenue = 0;

        foreach ($payments as $payment) {
            $commission = (int) $payment->platform_commission_fcfa;
            if ($commission > 0) {
                // Free Plan: Admin pays fee from commission
                $aggregatorFee = (int) round($payment->amount_fcfa * 0.03);
                $totalPlatformNetRevenue += ($commission - $aggregatorFee);
            }
        }
        
        $totalWithdrawnFcfa = PlatformWithdrawal::where('status', 'completed')->sum('amount_fcfa');
        $availableBalanceFcfa = $totalPlatformNetRevenue - $totalWithdrawnFcfa;

        $withdrawals = PlatformWithdrawal::with('method')->latest()->paginate(10);
        $methods = PlatformWithdrawalMethod::all();

        return Inertia::render('admin/withdrawals/index', [
            'withdrawals' => $withdrawals,
            'methods' => $methods,
            'stats' => [
                'grossTotalVolume' => $grossTotalVolume,
                'availableBalanceFcfa' => $availableBalanceFcfa,
                'totalWithdrawnFcfa' => $totalWithdrawnFcfa,
                'totalPlatformNetRevenue' => $totalPlatformNetRevenue,
            ]
        ]);
    }

    public function storeMethod(Request $request)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string',
            'label' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            PlatformWithdrawalMethod::where('is_default', true)->update(['is_default' => false]);
        }

        PlatformWithdrawalMethod::create($validated);

        return back()->with('success', 'Méthode de retrait ajoutée.');
    }

    public function requestWithdrawal(Request $request)
    {
        $validated = $request->validate([
            'amount_fcfa' => 'required|integer|min:500',
            'method_id' => 'required|exists:platform_withdrawal_methods,id',
        ]);

        PlatformWithdrawal::create([
            'method_id' => $validated['method_id'],
            'amount_fcfa' => $validated['amount_fcfa'],
            'reference' => 'PLAT-' . strtoupper(Str::random(10)),
            'status' => 'pending',
        ]);

        return back()->with('success', 'Demande de retrait enregistrée.');
    }
}

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
        // Platform Revenue is in EUR but typically withdrawals might be in FCFA if using local providers
        // For simplicity, let's assume we track total completed EUR revenue
        $totalRevenueEur = Payment::where('status', 'completed')->sum('amount_eur');
        $totalWithdrawnFcfa = PlatformWithdrawal::where('status', 'completed')->sum('amount_fcfa');
        
        // Estimated balance in FCFA (assuming 1 EUR = 655 FCFA for simplicity in display)
        $availableBalanceFcfa = ($totalRevenueEur * 655) - $totalWithdrawnFcfa;

        $withdrawals = PlatformWithdrawal::with('method')->latest()->paginate(10);
        $methods = PlatformWithdrawalMethod::all();

        return Inertia::render('admin/withdrawals/index', [
            'withdrawals' => $withdrawals,
            'methods' => $methods,
            'stats' => [
                'totalRevenueEur' => $totalRevenueEur,
                'availableBalanceFcfa' => $availableBalanceFcfa,
                'totalWithdrawnFcfa' => $totalWithdrawnFcfa,
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

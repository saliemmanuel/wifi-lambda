<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RevenueController extends Controller
{
    public function index()
    {
        $payments = Payment::where('status', 'completed')
            ->where('paid_at', '>=', now()->subDays(30))
            ->with(['tenant.plan'])
            ->get();

        // 1. Trend: Daily Net Gain (Last 30 days)
        $dailyRevenue = $payments->groupBy(function($tx) {
            return \Carbon\Carbon::parse($tx->paid_at)->toDateString();
        })->map(function($dayPayments, $date) {
            $dayGain = 0;
            foreach ($dayPayments as $tx) {
                $commission = (int) $tx->platform_commission_fcfa;
                if ($commission > 0) {
                    $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                    $dayGain += ($commission - $aggregatorFee);
                }
            }
            return [
                'total' => $dayGain,
                'date' => $date
            ];
        })->values();

        // 2. Aggregate: Current Month Total Gain
        $currentMonthPayments = Payment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->get();
        
        $currentMonthTotalGain = 0;
        foreach ($currentMonthPayments as $tx) {
            $commission = (int) $tx->platform_commission_fcfa;
            if ($commission > 0) {
                $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                $currentMonthTotalGain += ($commission - $aggregatorFee);
            }
        }

        // 3. Total 30 Days Gain
        $total30DaysGain = 0;
        foreach ($payments as $tx) {
            $commission = (int) $tx->platform_commission_fcfa;
            if ($commission > 0) {
                $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                $total30DaysGain += ($commission - $aggregatorFee);
            }
        }

        // 4. Distribution: Gain by Plan
        $revenueByPlan = $payments->groupBy(function($tx) {
            return $tx->tenant->plan->name ?? 'Aucun';
        })->map(function($planPayments, $name) {
            $planGain = 0;
            foreach ($planPayments as $tx) {
                $commission = (int) $tx->platform_commission_fcfa;
                if ($commission > 0) {
                    $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                    $planGain += ($commission - $aggregatorFee);
                }
            }
            return [
                'total' => $planGain,
                'name' => $name
            ];
        })->values();

        // 5. Distribution: Gain by Zone (Tenant)
        $revenueByTenant = $payments->groupBy(function($tx) {
            return $tx->tenant->name ?? 'Inconnu';
        })->map(function($tenantPayments, $name) {
            $tenantGain = 0;
            foreach ($tenantPayments as $tx) {
                $commission = (int) $tx->platform_commission_fcfa;
                if ($commission > 0) {
                    $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                    $tenantGain += ($commission - $aggregatorFee);
                }
            }
            return [
                'total' => $tenantGain,
                'name' => $name
            ];
        })->values();

        return Inertia::render('admin/revenue/index', [
            'dailyRevenue' => $dailyRevenue,
            'currentMonthTotal' => (int) $currentMonthTotalGain,
            'total30DaysGain' => (int) $total30DaysGain,
            'revenueByPlan' => $revenueByPlan,
            'revenueByTenant' => $revenueByTenant,
            'gross30DaysVolume' => (int) $payments->sum('amount_fcfa'),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Tenant;
use App\Models\Subscription;
use App\Models\Payment;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $grossTotalVolume = Payment::where('status', 'completed')->sum('amount_fcfa');
        
        // Detailed revenue calculation based on plan responsibility
        $payments = Payment::where('status', 'completed')->get();
        
        $netPlatformRevenue = 0;
        $totalResellerRevenue = 0;

        foreach ($payments as $payment) {
            $amount = (int) $payment->amount_fcfa;
            $commission = (int) $payment->platform_commission_fcfa;
            $resellerAmount = (int) $payment->reseller_amount_fcfa;
            $aggregatorFee = (int) round($amount * 0.03);

            if ($commission > 0) {
                // Free Plan: Admin pays fee from commission
                $netPlatformRevenue += ($commission - $aggregatorFee);
                $totalResellerRevenue += $resellerAmount;
            } else {
                // Business Plan: Reseller pays fee from their share
                $netPlatformRevenue += 0;
                $totalResellerRevenue += ($resellerAmount - $aggregatorFee);
            }
        }

        $totalResellerWithdrawals = 0;
        $tenantService = app(\App\Services\TenantService::class);
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            try {
                $tenantService->switchTo($tenant);
                $totalResellerWithdrawals += \App\Models\Tenant\Withdrawal::where('status', 'completed')->sum('amount');
            } catch (\Exception $e) {
                // Skip if DB doesn't exist or other error
                continue;
            }
        }

        $stats = [
            'totalTenants' => $tenants->count(),
            'activeSubscriptions' => Subscription::where('status', 'active')->count(),
            'totalRevenue' => $grossTotalVolume,
            'platformRevenue' => $netPlatformRevenue,
            'resellerRevenue' => $totalResellerRevenue - $totalResellerWithdrawals,
            'totalWithdrawnByResellers' => $totalResellerWithdrawals,
            'newTenantsThisMonth' => Tenant::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        $recentTenants = Tenant::with('plan')
            ->latest()
            ->limit(5)
            ->get();

        // Stats for chart (last 7 days - Net Platform Revenue)
        $labels = [];
        $revenueData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::now()->subDays($i);
            $labels[] = $date->format('d M');

            $dayPayments = Payment::where('status', 'completed')
                ->whereDate('created_at', $date)
                ->get();

            $dayNetRevenue = 0;
            foreach ($dayPayments as $payment) {
                $commission = (int) $payment->platform_commission_fcfa;
                if ($commission > 0) {
                    $aggregatorFee = (int) round($payment->amount_fcfa * 0.03);
                    $dayNetRevenue += ($commission - $aggregatorFee);
                }
            }
            
            $revenueData[] = $dayNetRevenue;
        }

        // 4. Recent Withdrawals from ALL tenants
        $tenants = Tenant::all();
        $recentWithdrawals = [];
        foreach ($tenants as $tenant) {
            try {
                app(\App\Services\TenantService::class)->switchTo($tenant);
                $tenantWithdrawals = \App\Models\Tenant\Withdrawal::with('method')
                    ->latest()
                    ->limit(3)
                    ->get()
                    ->map(function($w) use ($tenant) {
                        $w->tenant_name = $tenant->name;
                        return $w;
                    });
                foreach ($tenantWithdrawals as $w) {
                    $recentWithdrawals[] = $w;
                }
            } catch (\Exception $e) {
                // Skip if tenant DB not ready
                continue;
            }
        }
        
        // Sort by date and limit to 5
        usort($recentWithdrawals, function($a, $b) {
            return $b->created_at <=> $a->created_at;
        });
        $recentWithdrawals = array_slice($recentWithdrawals, 0, 5);

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'charts' => [
                'revenue' => [
                    'labels' => $labels,
                    'data' => $revenueData,
                ],
                'plans' => Tenant::selectRaw('plan_id, count(*) as count')
                    ->whereNotNull('plan_id')
                    ->groupBy('plan_id')
                    ->with('plan')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'name' => $item->plan->name ?? 'Unknown',
                            'value' => $item->count
                        ];
                    }),
            ],
            'recentTransactions' => Payment::with(['tenant', 'subscription'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($tx) {
                    $commission = (int) $tx->platform_commission_fcfa;
                    $tx->platform_net_amount = 0;
                    if ($commission > 0) {
                        $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                        $tx->platform_net_amount = $commission - $aggregatorFee;
                    }
                    return $tx;
                }),
            'recentWithdrawals' => $recentWithdrawals,
        ]);
    }
}

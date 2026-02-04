<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\WifiVoucher;
use App\Models\Tenant\WifiSession;
use App\Models\Tenant\User;
use App\Services\TenantService;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function index($tenant_slug)
    {
        $vouchersCount = WifiVoucher::where('status', 'available')->count();
        $soldThisMonth = WifiVoucher::where('status', 'sold')
            ->whereMonth('purchased_at', Carbon::now()->month)
            ->count();
        
        $revenueThisMonth = WifiVoucher::where('status', 'sold')
            ->whereMonth('purchased_at', Carbon::now()->month)
            ->sum('purchase_amount_fcfa');

        $activeSessions = WifiSession::where('status', 'active')->count();

        // Recent vouchers
        $recentVouchers = WifiVoucher::with('package')
            ->latest()
            ->take(5)
            ->get();

        // Stats for chart (last 7 days)
        $labels = [];
        $salesData = [];
        $revenueData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $labels[] = $date->format('d M');
            
            // Sales & Revenue query optimized
            $dayStats = WifiVoucher::where('status', 'sold')
                ->whereDate('purchased_at', $date)
                ->selectRaw('count(*) as count, sum(purchase_amount_fcfa) as total')
                ->first();

            $salesData[] = $dayStats->count ?? 0;
            $revenueData[] = (int)($dayStats->total ?? 0);
        }

        return Inertia::render('tenant/dashboard', [
            'stats' => [
                'vouchers_available' => $vouchersCount,
                'sold_this_month' => $soldThisMonth,
                'revenue_this_month' => (int)$revenueThisMonth,
                'active_sessions' => $activeSessions,
            ],
            'charts' => [
                'sales' => [
                    'labels' => $labels,
                    'data' => $salesData,
                ],
                'revenue' => [
                    'labels' => $labels,
                    'data' => $revenueData,
                ]
            ],
            'recent_vouchers' => $recentVouchers,
        ]);
    }
}

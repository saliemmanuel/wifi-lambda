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
        $stats = [
            'totalTenants' => Tenant::count(),
            'activeSubscriptions' => Subscription::where('status', 'active')->count(),
            'totalRevenue' => Payment::where('status', 'completed')->sum('amount_eur'),
            'newTenantsThisMonth' => Tenant::whereMonth('created_at', now()->month)->count(),
        ];

        $recentTenants = Tenant::with('plan')
            ->latest()
            ->limit(5)
            ->get();

        // Stats for chart (last 7 days - Platform Revenue)
        $labels = [];
        $revenueData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::now()->subDays($i);
            $labels[] = $date->format('d M');
            
            $revenueData[] = (int) Payment::where('status', 'completed')
                ->whereDate('created_at', $date)
                ->sum('amount_eur');
        }

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
                ->get(),
        ]);
    }
}

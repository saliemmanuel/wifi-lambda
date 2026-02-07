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
        // 1. Trend: Daily Revenue (Last 30 days)
        $dailyRevenue = Payment::where('status', 'completed')
            ->where('paid_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('SUM(amount_fcfa) as total'),
                DB::raw('DATE(paid_at) as date')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => [
                'total' => (int) $item->total,
                'date' => $item->date
            ]);

        // 2. Aggregate: Current Month Total
        $currentMonthTotal = Payment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount_fcfa');

        // 3. Distribution: Revenue by Plan
        $revenueByPlan = Payment::where('payments.status', 'completed')
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->join('plans', 'tenants.plan_id', '=', 'plans.id')
            ->select('plans.name', DB::raw('SUM(payments.amount_fcfa) as total'))
            ->groupBy('plans.name')
            ->get()
            ->map(fn($item) => [
                'total' => (int) $item->total,
                'name' => $item->name
            ]);

        // 4. Distribution: Revenue by Zone (Tenant)
        $revenueByTenant = Payment::where('payments.status', 'completed')
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->select('tenants.name', DB::raw('SUM(payments.amount_fcfa) as total'))
            ->groupBy('tenants.name')
            ->get()
            ->map(fn($item) => [
                'total' => (int) $item->total,
                'name' => $item->name
            ]);

        return Inertia::render('admin/revenue/index', [
            'dailyRevenue' => $dailyRevenue,
            'currentMonthTotal' => (int) $currentMonthTotal,
            'revenueByPlan' => $revenueByPlan,
            'revenueByTenant' => $revenueByTenant
        ]);
    }
}

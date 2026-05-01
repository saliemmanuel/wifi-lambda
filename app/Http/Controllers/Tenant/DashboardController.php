<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\WifiVoucher;
use App\Models\Tenant\WifiSession;
use App\Models\Tenant\User;
use App\Models\Tenant\Withdrawal;
use App\Models\Payment;
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
        $tenant = $this->tenantService->getCurrentTenant();

        // --- Financial Stats (Central DB - Payment Model) ---



        $payments = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->get();

        $totalRevenue = 0;
        foreach ($payments as $payment) {
            $resellerAmount = (int) $payment->reseller_amount_fcfa;
            if ($payment->platform_commission_fcfa == 0) {
                // Business Plan: Reseller pays 3% fee
                $aggregatorFee = (int) round($payment->amount_fcfa * 0.03);
                $totalRevenue += ($resellerAmount - $aggregatorFee);
            } else {
                // Free Plan: Admin pays fee, Reseller gets full reseller_amount
                $totalRevenue += $resellerAmount;
            }
        }

        $totalWithdrawals = Withdrawal::where('status', 'completed')->sum('amount');

        // 3. Total Tickets Sold
        $totalTicketsSold = $payments->count();

        // 5. Commission Totale prélevée par la plateforme
        $totalCommission = $payments->sum('platform_commission_fcfa');

        // Today's revenue calculation
        $revenueToday = 0;
        $ticketsSoldToday = 0;
        foreach ($payments as $payment) {
            if ($payment->created_at->isToday()) {
                $ticketsSoldToday++;
                $resellerAmount = (int) $payment->reseller_amount_fcfa;
                if ($payment->platform_commission_fcfa == 0) {
                    $aggregatorFee = (int) round($payment->amount_fcfa * 0.03);
                    $revenueToday += ($resellerAmount - $aggregatorFee);
                } else {
                    $revenueToday += $resellerAmount;
                }
            }
        }


        // --- Operational Stats (Tenant DB) ---
        $vouchersCount = WifiVoucher::where('status', 'available')->count();
        $activeSessions = WifiSession::where('status', 'active')->count();

        // Recent vouchers
        $recentVouchers = WifiVoucher::with('package')
            ->latest()
            ->take(5)
            ->get();

        // Stats for chart (last 7 days)
        // Keep existing logic or update to Payment? 
        // Existing logic uses WifiVoucher 'purchased_at'. 
        // For consistency with the cards, we might want to use Payment 'created_at'. 
        // But for now, let's leave the charts as is to avoid scope creep, 
        // unless the user explicitly said "preserve charts" which they did ("et en concervant les graphique").
        // So I will NOT touch the chart logic.

        $labels = [];
        $salesData = [];
        $revenueData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $labels[] = $date->format('d M');

            // Sales Count (still from vouchers for operational accuracy)
            $salesCount = WifiVoucher::where('status', 'sold')
                ->whereDate('purchased_at', $date)
                ->count();

            // Net Revenue (from Payment model for financial accuracy)
            $dayPayments = Payment::where('tenant_id', $tenant->id)
                ->where('payment_type', 'ticket')
                ->whereIn('status', ['paid', 'completed', 'success'])
                ->whereDate('created_at', $date)
                ->get();

            $dayNetRevenue = 0;
            foreach ($dayPayments as $payment) {
                $resellerAmount = (int) $payment->reseller_amount_fcfa;
                if ($payment->platform_commission_fcfa == 0) {
                    $aggregatorFee = (int) round($payment->amount_fcfa * 0.03);
                    $dayNetRevenue += ($resellerAmount - $aggregatorFee);
                } else {
                    $dayNetRevenue += $resellerAmount;
                }
            }
 
            $salesData[] = $salesCount;
            $revenueData[] = (int) $dayNetRevenue;
        }

        return Inertia::render('tenant/dashboard', [
            'stats' => [
                'vouchers_available' => $vouchersCount, // Keep as it's useful
                'active_sessions' => $activeSessions,   // Keep as it's useful

                // New UI specific stats
                'revenue_total' => (int) $totalRevenue,
                'revenue_available' => (int) ($totalRevenue - $totalWithdrawals),
                'commission_total' => (int) $totalCommission,
                'tickets_sold_total' => (int) $totalTicketsSold,
                'withdrawals_total' => (int) $totalWithdrawals,
                'revenue_today' => (int) $revenueToday,
                'tickets_sold_today' => (int) $ticketsSoldToday,
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

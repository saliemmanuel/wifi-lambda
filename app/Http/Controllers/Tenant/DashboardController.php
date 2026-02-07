<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\WifiVoucher;
use App\Models\Tenant\WifiSession;
use App\Models\Tenant\User;
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
        
        // 1. Balance: (Ticket Income (Reseller Share)) - (Withdrawals)
        $ticketIncome = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success']) // robust status check
            ->sum('reseller_amount_fcfa');
            
        $totalWithdrawals = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'withdrawal')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->sum('amount_fcfa');
            
        $balance = $ticketIncome - $totalWithdrawals;

        // 2. Chiffre d'Affaires Total (Gross Revenue from Tickets)
        $totalRevenue = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->sum('amount_fcfa');

        // 3. Total Tickets Sold
        $totalTicketsSold = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->count();

        // 4. Montant Total des Retraits ($totalWithdrawals already calculated)

        // 5. Recette du Jour (Today's Revenue)
        $revenueToday = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->whereDate('created_at', Carbon::today())
            ->sum('amount_fcfa');

        // 6. Tickets Vendus Aujourd'hui
        $ticketsSoldToday = Payment::where('tenant_id', $tenant->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->whereDate('created_at', Carbon::today())
            ->count();


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
                'vouchers_available' => $vouchersCount, // Keep as it's useful
                'active_sessions' => $activeSessions,   // Keep as it's useful
                
                // New UI specific stats
                'balance' => (int)$balance,
                'revenue_total' => (int)$totalRevenue,
                'tickets_sold_total' => (int)$totalTicketsSold,
                'withdrawals_total' => (int)$totalWithdrawals,
                'revenue_today' => (int)$revenueToday,
                'tickets_sold_today' => (int)$ticketsSoldToday,
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

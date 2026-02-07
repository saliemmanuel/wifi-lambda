<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\MikrotikRouter;
use App\Models\Tenant\WifiVoucher;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function index(Request $request, $tenant_slug)
    {
        // 1. Get Zones for Filter
        $zones = MikrotikRouter::select('id', 'name')->orderBy('name')->get();

        // 2. Determine Filter Values
        $zoneId = $request->input('zone_id'); // can be specific ID or null/all
        $year = $request->input('year', Carbon::now()->year);
        
        $paymentMode = $request->input('payment_mode', 'daily'); // 'daily' or 'monthly'
        $paymentMonth = $request->input('payment_month', Carbon::now()->month); // Used if mode is daily

        $ticketMode = $request->input('ticket_mode', 'daily'); // 'daily' or 'monthly'
        $ticketMonth = $request->input('ticket_month', Carbon::now()->month); // Used if mode is daily

        // 3. Get Available Years (from WifiVoucher purchased_at)
        $years = WifiVoucher::whereNotNull('purchased_at')
            ->selectRaw('YEAR(purchased_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();
            
        if (empty($years)) {
            $years = [Carbon::now()->year];
        }

        // --- Helper Function to Build Query ---
        $buildQuery = function ($query) use ($zoneId, $year) {
            $query->whereNotNull('purchased_at')
                  ->whereYear('purchased_at', $year);
            
            if ($zoneId && $zoneId !== 'all') {
                $query->where('hotspot_id', $zoneId);
            }
            return $query;
        };

        // --- Payment Stats (Revenue) ---
        $paymentQuery = WifiVoucher::query(); 
        $buildQuery($paymentQuery);
        
        if ($paymentMode === 'daily') {
            $paymentQuery->whereMonth('purchased_at', $paymentMonth);
            $paymentStats = $paymentQuery->selectRaw('DAY(purchased_at) as label, SUM(purchase_amount_fcfa) as total')
                ->groupBy('label')
                ->orderBy('label')
                ->get()
                ->map(fn($item) => ['label' => (string)$item->label, 'value' => (float)$item->total]);
        } else {
            // Monthly
            $paymentStats = $paymentQuery->selectRaw('MONTH(purchased_at) as label, SUM(purchase_amount_fcfa) as total')
                ->groupBy('label')
                ->orderBy('label')
                ->get()
                ->map(fn($item) => ['label' => Carbon::create()->month($item->label)->locale('fr')->monthName, 'value' => (float)$item->total]);
        }

        // --- Ticket Stats (Count) ---
        $ticketQuery = WifiVoucher::query();
        $buildQuery($ticketQuery);

        if ($ticketMode === 'daily') {
            $ticketQuery->whereMonth('purchased_at', $ticketMonth);
            $ticketStats = $ticketQuery->selectRaw('DAY(purchased_at) as label, COUNT(*) as total')
                ->groupBy('label')
                ->orderBy('label')
                ->get()
                ->map(fn($item) => ['label' => (string)$item->label, 'value' => (int)$item->total]);
        } else {
             // Monthly
            $ticketStats = $ticketQuery->selectRaw('MONTH(purchased_at) as label, COUNT(*) as total')
                ->groupBy('label')
                ->orderBy('label')
                ->get()
                ->map(fn($item) => ['label' => Carbon::create()->month($item->label)->locale('fr')->monthName, 'value' => (int)$item->total]);
        }


        // Fill gaps for charts to look nice (Optional but good UX)
        // ... (Skipping complex gap filling for brevity, can rely on frontend or add simple logic if requested)

        return Inertia::render('tenant/wifi/statistics/index', [
            'zones' => $zones,
            'years' => $years,
            'stats' => [
                'payments' => $paymentStats,
                'tickets' => $ticketStats,
            ],
            'filters' => [
                'zone_id' => $zoneId,
                'year' => (int)$year,
                'payment_mode' => $paymentMode,
                'payment_month' => (int)$paymentMonth,
                'ticket_mode' => $ticketMode,
                'ticket_month' => (int)$ticketMonth,
            ]
        ]);
    }
}

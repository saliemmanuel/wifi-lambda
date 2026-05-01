<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\MikrotikRouter;
use App\Models\Payment;
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

        // 3. Get Available Years (from Payment created_at)
        $years = Payment::where('tenant_id', $this->tenantService->getCurrentTenant()->id)
            ->where('payment_type', 'ticket')
            ->selectRaw('YEAR(created_at) as year')
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
        $paymentsQuery = Payment::where('tenant_id', $this->tenantService->getCurrentTenant()->id)
            ->where('payment_type', 'ticket')
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->whereYear('created_at', $year);

        if ($zoneId && $zoneId !== 'all') {
            $paymentsQuery->where('meta->router_id', $zoneId);
        }

        if ($paymentMode === 'daily') {
            $paymentsQuery->whereMonth('created_at', $paymentMonth);
        }

        $payments = $paymentsQuery->get();

        if ($paymentMode === 'daily') {
            $paymentStats = $payments->groupBy(function($tx) {
                return $tx->created_at->day;
            })->map(function($dayPayments, $day) {
                $dayNet = 0;
                foreach ($dayPayments as $tx) {
                    $resellerAmount = (int) $tx->reseller_amount_fcfa;
                    if ($tx->platform_commission_fcfa == 0) {
                        $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                        $dayNet += ($resellerAmount - $aggregatorFee);
                    } else {
                        $dayNet += $resellerAmount;
                    }
                }
                return ['label' => (string)$day, 'value' => (float)$dayNet];
            })->values()->sortBy('label');
        } else {
            // Monthly
            $paymentStats = $payments->groupBy(function($tx) {
                return $tx->created_at->month;
            })->map(function($monthPayments, $month) {
                $monthNet = 0;
                foreach ($monthPayments as $tx) {
                    $resellerAmount = (int) $tx->reseller_amount_fcfa;
                    if ($tx->platform_commission_fcfa == 0) {
                        $aggregatorFee = (int) round($tx->amount_fcfa * 0.03);
                        $monthNet += ($resellerAmount - $aggregatorFee);
                    } else {
                        $monthNet += $resellerAmount;
                    }
                }
                return ['label' => Carbon::create()->month($month)->locale('fr')->monthName, 'value' => (float)$monthNet];
            })->values()->sortBy(function($item) {
                return Carbon::parse($item['label'])->month;
            });
        }

        // --- Ticket Stats (Count) ---
        if ($ticketMode === 'daily') {
            $ticketStats = $payments->whereBetween('created_at', [
                Carbon::create($year, $ticketMonth, 1)->startOfMonth(),
                Carbon::create($year, $ticketMonth, 1)->endOfMonth()
            ])->groupBy(function($tx) {
                return $tx->created_at->day;
            })->map(function($dayPayments, $day) {
                return ['label' => (string)$day, 'value' => $dayPayments->count()];
            })->values()->sortBy('label');
        } else {
            // Monthly
            $ticketStats = $payments->groupBy(function($tx) {
                return $tx->created_at->month;
            })->map(function($monthPayments, $month) {
                return ['label' => Carbon::create()->month($month)->locale('fr')->monthName, 'value' => $monthPayments->count()];
            })->values()->sortBy(function($item) {
                return Carbon::parse($item['label'])->month;
            });
        }

        return Inertia::render('tenant/wifi/statistics/index', [
            'zones' => $zones,
            'years' => $years,
            'stats' => [
                'payments' => $paymentStats->values()->toArray(),
                'tickets' => $ticketStats->values()->toArray(),
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

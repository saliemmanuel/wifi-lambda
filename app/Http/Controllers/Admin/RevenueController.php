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
        $monthlyRevenue = Payment::where('status', 'completed')
            ->select(DB::raw('SUM(amount_eur) as total'), DB::raw("DATE_FORMAT(paid_at, '%Y-%m') as month"))
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        return Inertia::render('admin/revenue/index', [
            'monthlyRevenue' => $monthlyRevenue
        ]);
    }
}

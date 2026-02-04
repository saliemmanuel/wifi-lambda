<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\WifiPackage;
use App\Models\Tenant\WifiVoucher;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class WifiVoucherController extends Controller
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function index(Request $request, $tenant_slug)
    {
        $query = WifiVoucher::with('package');

        // Search Filter (Username, Comment, Profile)
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('comment', 'like', "%{$search}%")
                  ->orWhere('profile_name', 'like', "%{$search}%");
            });
        }

        // Status Filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $vouchers = $query->latest()->paginate(15)->withQueryString();
        $packages = WifiPackage::all();

        return Inertia::render('tenant/wifi/vouchers/index', [
            'vouchers' => $vouchers,
            'packages' => $packages,
            'filters' => $request->only(['search', 'status']),
            'stats_summary' => [
                'total' => WifiVoucher::count(),
                'available' => WifiVoucher::where('status', 'available')->count(),
                'expired' => WifiVoucher::where('status', 'expired')->count(),
                'sold' => WifiVoucher::where('status', 'sold')->count(),
            ]
        ]);
    }

    public function import(Request $request, $tenant_slug)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx',
            'package_id' => 'required|exists:tenant.wifi_packages,id',
        ]);

        $file = $request->file('file');
        $packageId = $request->input('package_id');
        $path = $file->getRealPath();
        
        $csvData = array_map(function($line) {
            return str_getcsv($line, ",");
        }, file($path));
        
        if (count($csvData) < 2) {
            return back()->withErrors(['error' => 'Le fichier est vide ou invalide.']);
        }

        // Header check
        $header = array_shift($csvData);
        
        $importedCount = 0;
        $duplicatesCount = 0;
        $expiredCount = 0;

        foreach ($csvData as $row) {
            if (count($row) < 2) continue;

            $username = trim($row[0] ?? '');
            $password = trim($row[1] ?? '');
            $profile = trim($row[2] ?? '');
            $timeLimit = trim($row[3] ?? '');
            $dataLimit = trim($row[4] ?? '');
            $comment = trim($row[5] ?? '');

            if (!$username || !$password) continue;

            // Check duplicates
            $exists = WifiVoucher::where('username', $username)->exists();
            if ($exists) {
                $duplicatesCount++;
                continue;
            }

            // Status Logic
            $status = 'available';
            
            if (!empty($comment)) {
                try {
                    if (preg_match('/^\d{4}-\d{2}-\d{2}/', $comment)) {
                        $date = Carbon::parse($comment);
                        if ($date->isPast()) {
                            $status = 'expired';
                            $expiredCount++;
                        }
                    }
                } catch (\Exception $e) { }
            }

            WifiVoucher::create([
                'package_id' => $packageId,
                'username' => $username,
                'password' => $password,
                'profile_name' => $profile,
                'time_limit' => $timeLimit,
                'data_limit_mb' => is_numeric($dataLimit) ? (int)$dataLimit : null,
                'comment' => $comment,
                'status' => $status,
                'import_status' => 'imported',
            ]);

            $importedCount++;
        }

        return back()->with('success', "Importation réussie : {$importedCount} ajoutés.");
    }

    public function destroy($tenant_slug, $id)
    {
        WifiVoucher::findOrFail($id)->delete();
        return back()->with('success', 'Ticket supprimé avec succès.');
    }

    public function bulkDestroy(Request $request, $tenant_slug)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:tenant.wifi_vouchers,id'
        ]);

        $count = WifiVoucher::whereIn('id', $request->ids)->delete();

        return back()->with('success', "{$count} tickets supprimés avec succès.");
    }
}

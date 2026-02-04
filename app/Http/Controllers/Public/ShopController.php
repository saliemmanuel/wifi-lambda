<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Tenant\WifiPackage;
use App\Models\Tenant\WifiVoucher;
use App\Models\Tenant\PaymentAttempt;
use App\Services\CampayService;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ShopController extends Controller
{
    public function __construct(
        protected TenantService $tenantService,
        protected CampayService $campayService
    ) {}

    public function index($tenant_slug)
    {
        // Safety check: Ensure tenant connection is set
        $tenant = $this->tenantService->getCurrentTenant();
        if (!$tenant || $tenant->slug !== $tenant_slug) {
            $tenant = \App\Models\Tenant::where('slug', $tenant_slug)->firstOrFail();
            $this->tenantService->switchTo($tenant);
        }

        // Optimized query: Get packages with available voucher count
        $packages = WifiPackage::withCount(['vouchers as available_count' => function($query) {
            $query->where('status', 'available');
        }])->get();

        return Inertia::render('tenant/shop/index', [
            'packages' => $packages,
            'tenant_slug' => $tenant_slug
        ]);
    }

    public function initiate(Request $request, $tenant_slug)
    {
        $request->validate([
            'package_id' => 'required|exists:tenant.wifi_packages,id',
            'phone_number' => 'required|string|min:9',
        ]);

        $package = WifiPackage::findOrFail($request->package_id);
        
        // Pick first available voucher for this package
        $voucher = WifiVoucher::where('package_id', $package->id)
            ->where('status', 'available')
            ->first();

        if (!$voucher) {
            return response()->json(['error' => 'Désolé, plus de tickets disponibles pour ce forfait.'], 400);
        }

        //$amount = $package->price_fcfa;
        $amount = 5; // TESTING: Hardcoded to 5 FCFA
        $description = "Achat Ticket Wi-Fi: {$package->name}";

        try {
            $response = $this->campayService->collect([
                'amount' => $amount,
                'phone_number' => $request->phone_number,
                'description' => $description,
                'external_reference' => 'TENANT_' . $tenant->id . '_VOUCHER_' . $voucher->id . '_' . time(),
                'notify_url' => rtrim(config('app.url'), '/') . '/webhook/campay',
            ]);

            if ($response && isset($response['reference'])) {
                // Success - Pending
                PaymentAttempt::create([
                    'reference' => $response['reference'],
                    'amount' => $amount,
                    'amount_fcfa' => $amount,
                    'phone_number' => $request->phone_number,
                    'campay_transaction_id' => $response['reference'],
                    'payment_method' => $this->detectPaymentMethod($request->phone_number),
                    'status' => 'pending',
                    'attempted_at' => now(),
                    'meta' => [
                        'package_id' => $package->id,
                        'package_name' => $package->name,
                        'voucher_id' => $voucher->id,
                        'type' => 'voucher_sale',
                        'description' => $description,
                        'external_reference' => $response['external_reference'] ?? null,
                    ]
                ]);

                Log::info("Payment initiated", [
                    'reference' => $response['reference'],
                    'amount' => $amount
                ]);

                return response()->json([
                    'campay_reference' => $response['reference']
                ]);
            }

            // API Call Failed (returned null or no reference)
            PaymentAttempt::create([
                'reference' => 'FAIL_' . time() . '_' . rand(1000, 9999), 
                'amount' => $amount,
                'amount_fcfa' => $amount,
                'phone_number' => $request->phone_number,
                'payment_method' => $this->detectPaymentMethod($request->phone_number),
                'status' => 'failed',
                'failure_reason' => 'Payment initialization failed (No reference returned)',
                'attempted_at' => now(),
                'meta' => [
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                    'voucher_id' => $voucher->id,
                    'type' => 'voucher_sale',
                    'description' => $description,
                    'api_response' => $response ?? null
                ]
            ]);

            return response()->json(['error' => 'Échec de l\'initialisation du paiement.'], 400);

        } catch (\Exception $e) {
            // Exception Occurred
            Log::error("Payment initiation exception", [
                'error' => $e->getMessage(),
                'phone' => $request->phone_number
            ]);

            PaymentAttempt::create([
                'reference' => 'ERR_' . time() . '_' . rand(1000, 9999),
                'amount' => $amount,
                'amount_fcfa' => $amount,
                'phone_number' => $request->phone_number,
                'payment_method' => $this->detectPaymentMethod($request->phone_number),
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
                'attempted_at' => now(),
                'meta' => [
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                    'voucher_id' => $voucher->id,
                    'type' => 'voucher_sale',
                    'description' => $description
                ]
            ]);

            return response()->json(['error' => 'Erreur lors de l\'initialisation du paiement.'], 500);
        }
    }

    private function detectPaymentMethod($phoneNumber)
    {
        $phone = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        // Cameroon mobile money detection
        if (str_starts_with($phone, '237')) {
            $phone = substr($phone, 3);
        }
        
        if (str_starts_with($phone, '69') || str_starts_with($phone, '655') || str_starts_with($phone, '656') || str_starts_with($phone, '657') || str_starts_with($phone, '658') || str_starts_with($phone, '659')) {
            return 'orange_money';
        }
        
        // Moov check just in case
        if (str_starts_with($phone, '62')) {
            return 'moov_money';
        }

        // Default to MTN if unsure, to avoid null
        return 'mtn_mobile_money';
    }

    public function checkStatus($tenant_slug, $reference)
    {
        $statusResp = $this->campayService->checkTransactionStatus($reference);
        
        if ($statusResp && $statusResp['status'] === 'SUCCESSFUL') {
            $attempt = PaymentAttempt::where('reference', $reference)->first();
            
            if ($attempt && $attempt->status !== 'success') {
                // Update payment attempt to success
                $attempt->update([
                    'status' => 'success',
                    'completed_at' => now(),
                    'meta' => array_merge($attempt->meta ?? [], [
                        'campay_status' => $statusResp,
                        'completed_by' => 'system',
                    ])
                ]);

                Log::info("Payment successful", [
                    'reference' => $reference,
                    'amount' => $attempt->amount_fcfa,
                    'phone' => $attempt->phone_number
                ]);
                
                // Finalize voucher sale
                $voucherId = $attempt->meta['voucher_id'] ?? null;
                $voucher = WifiVoucher::find($voucherId);
                
                if ($voucher && $voucher->status === 'available') {
                    $voucher->update([
                        'status' => 'sold',
                        'purchased_at' => now(),
                        'purchase_amount_fcfa' => $attempt->amount_fcfa,
                        'campay_reference' => $reference,
                        'comment' => "Vendu via Boutique - Ref: {$reference}"
                    ]);

                    Log::info("Voucher sold", [
                        'voucher_id' => $voucher->id,
                        'username' => $voucher->username,
                        'reference' => $reference
                    ]);
                    
                    return response()->json([
                        'status' => 'success',
                        'voucher' => [
                            'username' => $voucher->username,
                            'password' => $voucher->password,
                        ]
                    ]);
                }
            }

            // If already successful, still return the voucher if found
            $voucher = WifiVoucher::where('campay_reference', $reference)->first();
            if ($voucher) {
                return response()->json([
                    'status' => 'success',
                    'voucher' => [
                        'username' => $voucher->username,
                        'password' => $voucher->password,
                    ]
                ]);
            }
        } elseif ($statusResp && in_array($statusResp['status'], ['FAILED', 'CANCELLED'])) {
            // Update failed/cancelled attempts
            $attempt = PaymentAttempt::where('reference', $reference)->first();
            if ($attempt && $attempt->status === 'pending') {
                $attempt->update([
                    'status' => strtolower($statusResp['status']),
                    'completed_at' => now(),
                    'failure_reason' => $statusResp['reason'] ?? 'Transaction failed',
                    'meta' => array_merge($attempt->meta ?? [], [
                        'campay_status' => $statusResp,
                    ])
                ]);

                Log::warning("Payment failed/cancelled", [
                    'reference' => $reference,
                    'status' => $statusResp['status'],
                    'reason' => $statusResp['reason'] ?? 'Unknown'
                ]);
            }
        }

        return response()->json(['status' => $statusResp['status'] ?? 'pending']);
    }

    public function retrieveVoucher(Request $request, $tenant_slug)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        $reference = $request->reference;

        // Try to find a successful payment attempt with this reference
        $attempt = PaymentAttempt::where('reference', $reference)
            ->where('status', 'success')
            ->first();

        if (!$attempt) {
            // Also check Campay just in case it's successful there but not updated here
            $statusResp = $this->campayService->checkTransactionStatus($reference);
            if ($statusResp && $statusResp['status'] === 'SUCCESSFUL') {
                // If successful in Campay, try to find voucher by campay_reference
                $voucher = WifiVoucher::where('campay_reference', $reference)->first();
                if ($voucher) {
                    return response()->json([
                        'status' => 'success',
                        'voucher' => [
                            'username' => $voucher->username,
                            'password' => $voucher->password,
                        ]
                    ]);
                }
            }
            
            return response()->json(['error' => 'Référence introuvable ou paiement non validé.'], 404);
        }

        $voucherId = $attempt->meta['voucher_id'] ?? null;
        $voucher = WifiVoucher::find($voucherId);

        if (!$voucher) {
            return response()->json(['error' => 'Ticket introuvable pour cette référence.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'voucher' => [
                'username' => $voucher->username,
                'password' => $voucher->password,
            ]
        ]);
    }
}

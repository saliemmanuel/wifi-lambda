<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Tenant\WifiPackage;
use App\Models\Tenant\WifiVoucher;
use App\Models\Payment;
use App\Services\CampayService;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

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

        // Fix: Retrieve tenant for reference generation
        $tenant = $this->tenantService->getCurrentTenant();

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
                // Success - Create Pending Payment Record in Central DB (inspired by BillingController)
                Payment::create([
                    'tenant_id' => $tenant->id,
                    'payment_type' => 'ticket',
                    'ticket_id' => $voucher->id,
                    'amount_fcfa' => $amount,
                    'status' => 'pending',
                    'campay_reference' => $response['reference'],
                    'campay_transaction_id' => ($response['external_reference'] ?? 'VOUCH_' . time()) . '_' . time(),
                    'campay_status' => 'PENDING',
                    'payment_method' => $this->detectPaymentMethod($request->phone_number),
                    'phone_number' => $request->phone_number,
                    'meta' => [
                        'package_id' => $package->id,
                        'package_name' => $package->name,
                        'voucher_id' => $voucher->id,
                        'type' => 'voucher_sale',
                        'description' => $description,
                        'campay_response' => $response
                    ]
                ]);

                Log::info("Payment initiated for voucher", [
                    'reference' => $response['reference'],
                    'amount' => $amount,
                    'tenant_id' => $tenant->id
                ]);

                return response()->json([
                    'campay_reference' => $response['reference']
                ]);
            }

            // API Call Failed - Prepare error message like in BillingController
            $errorMessage = 'Échec de l\'initialisation du paiement avec Campay.';
            if (isset($response['message'])) {
                $errorMessage .= ' ' . $response['message'];
            } elseif (isset($response['detail'])) {
                $errorMessage .= ' ' . $response['detail'];
            }

            return response()->json(['error' => $errorMessage], 400);

        } catch (\Exception $e) {
            Log::error("Payment initiation exception", [
                'error' => $e->getMessage(),
                'phone' => $request->phone_number
            ]);

            return response()->json(['error' => 'Erreur technique lors de l\'initialisation : ' . $e->getMessage()], 500);
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
        $payment = Payment::where('campay_reference', $reference)->first();

        if (!$payment) {
            return response()->json(['status' => 'error', 'message' => 'Transaction introuvable']);
        }

        if ($payment->status === 'completed') {
            // If already successful, return the voucher if found
            $voucher = WifiVoucher::where('campay_reference', $reference)->first();
            if (!$voucher && isset($payment->ticket_id)) {
                $voucher = WifiVoucher::find($payment->ticket_id);
            }

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
        
        if ($statusResp && $statusResp['status'] === 'SUCCESSFUL') {
            // Update payment to success
            $payment->update([
                'status' => 'completed',
                'campay_status' => 'SUCCESSFUL',
                'campay_transaction_id' => $statusResp['operator_reference'] ?? $payment->campay_transaction_id,
                'paid_at' => now(),
            ]);

            Log::info("Voucher Payment successful", [
                'reference' => $reference,
                'amount' => $payment->amount_fcfa,
                'phone' => $payment->phone_number
            ]);
            
            // Finalize voucher sale
            $voucherId = $payment->ticket_id ?? $payment->meta['voucher_id'] ?? null;
            $voucher = WifiVoucher::find($voucherId);
            
            if ($voucher && $voucher->status === 'available') {
                $voucher->update([
                    'status' => 'sold',
                    'purchased_at' => now(),
                    'purchase_amount_fcfa' => $payment->amount_fcfa,
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
        } elseif ($statusResp && in_array($statusResp['status'], ['FAILED', 'CANCELLED'])) {
            // Update failed/cancelled attempts
            if ($payment->status === 'pending') {
                $payment->update([
                    'status' => 'failed',
                    'campay_status' => $statusResp['status'],
                ]);

                Log::warning("Voucher Payment failed/cancelled", [
                    'reference' => $reference,
                    'status' => $statusResp['status'],
                ]);
            }
            return response()->json(['status' => 'failed', 'message' => 'Paiement échoué']);
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
        $payment = Payment::where(function($query) use ($reference) {
                $query->where('campay_reference', $reference)
                      ->orWhere('campay_transaction_id', $reference);
            })
            ->where('status', 'completed')
            ->first();

        if (!$payment) {
            // Also check by searching inside the webhook data in meta if needed, but the above should cover it
            // if we correctly updated the campay_transaction_id.
            
            // Fast check for voucher directly by reference
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

            // Fallback: Also check Campay just in case it's successful there but not updated here
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

        $voucherId = $payment->ticket_id ?? $payment->meta['voucher_id'] ?? null;
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

    public function downloadPdf($tenant_slug, $reference)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        // Find successful payment
        $payment = Payment::where(function($query) use ($reference) {
                $query->where('campay_reference', $reference)
                      ->orWhere('campay_transaction_id', $reference);
            })
            ->where('status', 'completed')
            ->firstOrFail();

        $voucherId = $payment->ticket_id ?? $payment->meta['voucher_id'] ?? null;
        $voucher = WifiVoucher::findOrFail($voucherId);

        $data = [
            'tenant_name' => $tenant->name,
            'username' => $voucher->username,
            'password' => $voucher->password,
            'reference' => $reference,
            'date' => $payment->paid_at ?? $payment->created_at,
        ];

        $pdf = Pdf::loadView('pdf.voucher', $data);
        
        return $pdf->download("Ticket_WiFi_{$reference}.pdf");
    }
}

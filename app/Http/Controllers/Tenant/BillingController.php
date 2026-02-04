<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\TenantService;
use App\Services\CampayService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    public function __construct(
        protected TenantService $tenantService,
        protected CampayService $campayService
    ) {}

    public function index($tenant_slug)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $plans = Plan::where('is_active', true)->get();

        return Inertia::render('tenant/billing/index', [
            'tenant' => $tenant->load('plan'),
            'plans' => $plans,
        ]);
    }

    public function initiatePayment(Request $request, $tenant_slug)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'phone_number' => 'required|string|min:9',
        ]);

        $tenant = $this->tenantService->getCurrentTenant();
        $newPlan = Plan::findOrFail($request->plan_id);

        $description = "Paiement Abonnement {$newPlan->name} pour {$tenant->name}";
        $externalReference = "SUB-{$tenant->id}-" . time();
        
        // 1. Initiate Campay Payment
        $response = $this->campayService->collect([
            //'amount' => $newPlan->price_fcfa,
            'amount' => '5', // TESTING: Hardcoded to 5 FCFA
            'phone_number' => $request->phone_number,
            'description' => $description,
            'external_reference' => $externalReference,
            'notify_url' => route('webhook.campay'),
        ]);

        if ($response && isset($response['reference'])) {
            // ... (success logic) ...
            // 2. Create Incomplete/Suspended Subscription
            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $newPlan->id,
                'status' => 'suspended', // Suspended until paid
                'amount_eur' => $newPlan->price_eur,
                'auto_renew' => true,
            ]);

            // 3. Create Pending Payment Record
            Payment::create([
                'tenant_id' => $tenant->id,
                'subscription_id' => $subscription->id,
                'amount_fcfa' => '5', // TESTING
                'amount_eur' => $newPlan->price_eur,
                'payment_type' => 'subscription',
                'status' => 'pending',
                'campay_reference' => $response['reference'],
                'campay_transaction_id' => $externalReference,
                'campay_status' => 'PENDING',
                'payment_method' => $this->detectPaymentMethod($request->phone_number),
                'phone_number' => $request->phone_number,
                'meta' => [
                    'plan_id' => $newPlan->id,
                    'campay_response' => $response
                ]
            ]);

            return back()->with('campay_reference', $response['reference'])
                         ->with('message', 'Veuillez confirmer le paiement sur votre téléphone.');
        }

        $errorMessage = 'Échec de l\'initialisation du paiement avec Campay.';
        if (isset($response['message'])) {
            $errorMessage .= ' ' . $response['message'];
        } elseif (isset($response['detail'])) {
            $errorMessage .= ' ' . $response['detail'];
        }

        return back()->withErrors(['error' => $errorMessage]);
    }

    private function detectPaymentMethod($phoneNumber)
    {
        $phone = preg_replace('/[^0-9]/', '', $phoneNumber);
        if (str_starts_with($phone, '237')) {
            $phone = substr($phone, 3);
        }
        
        if (str_starts_with($phone, '69') || str_starts_with($phone, '655') || str_starts_with($phone, '656') || str_starts_with($phone, '657') || str_starts_with($phone, '658') || str_starts_with($phone, '659')) {
            return 'orange_money';
        } 
        
        return 'mtn_mobile_money'; // Default for other 67, 68, 650-654
    }

    public function checkStatus($tenant_slug, $reference)
    {
        $payment = Payment::where('campay_reference', $reference)->first();

        if (!$payment) {
            return response()->json(['status' => 'error', 'message' => 'Transaction introuvable']);
        }

        if ($payment->status === 'completed') {
             return response()->json(['status' => 'success', 'message' => 'Paiement déjà validé']);
        }

        $response = $this->campayService->checkTransactionStatus($reference);
        //$tenant = $this->tenantService->getCurrentTenant(); // Not strictly needed if we trust payment record, but good for context

        if ($response && $response['status'] === 'SUCCESSFUL') {
            
            // Update Payment
            $payment->update([
                'status' => 'completed',
                'campay_status' => 'SUCCESSFUL',
                'paid_at' => now(),
            ]);

            // Update Subscription
            if ($payment->subscription_id) {
                $subscription = Subscription::find($payment->subscription_id);
                if ($subscription) {
                    $subscription->update([
                        'status' => 'active',
                        'current_period_start' => now(),
                        'current_period_end' => now()->addMonth(),
                        'next_payment_date' => now()->addMonth(),
                    ]);

                     // Update Tenant Plan
                    $tenant = Tenant::find($payment->tenant_id);
                    if ($tenant) {
                        $tenant->update([
                            'plan_id' => $subscription->plan_id,
                            'status' => 'active',
                        ]);
                    }
                }
            }

            return response()->json(['status' => 'success', 'message' => 'Paiement réussi !']);
        } 
        elseif ($response && $response['status'] === 'FAILED') {
             $payment->update([
                'status' => 'failed',
                'campay_status' => 'FAILED',
            ]);
             return response()->json(['status' => 'failed', 'message' => 'Paiement échoué']);
        }

        return response()->json(['status' => 'pending']);
    }

    // Legacy manual upgrade for dev
    public function upgrade(Request $request, $tenant_slug)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $newPlan = Plan::findOrFail($request->plan_id);
        $tenant->update(['plan_id' => $newPlan->id]);
        return back();
    }
}

<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CampayController extends Controller
{
    public function handle(Request $request)
    {
        // 1. Verify Signature (Optional but recommended, Campay sends a signature header 'X-Campay-Signature')
        // For simplicity we might skip complex validation unless keys are available, 
        // but normally we check standard HMAC or specific Campay verification method.
        // Assuming we rely on the unique Reference check for now.

        $data = $request->all();

        \Illuminate\Support\Facades\Log::info('Campay Webhook Received', $data);

        $status = $data['status'] ?? null;
        $reference = $data['reference'] ?? null;

        if (!$reference || !$status) {
            return response()->json(['message' => 'Invalid Payload'], 400);
        }

        $payment = \App\Models\Payment::where('campay_reference', $reference)->first();

        if ($payment) {
            if ($payment->status === 'completed') {
                return response()->json(['message' => 'Already processed']);
            }

            if ($status === 'SUCCESSFUL') {
                // Update Payment
                $payment->update([
                    'status' => 'completed',
                    'campay_status' => 'SUCCESSFUL',
                    'paid_at' => now(),
                    'meta' => array_merge($payment->meta ?? [], ['webhook_data' => $data]),
                ]);

                // Handle Subscription Payment
                if ($payment->payment_type === 'subscription' && $payment->subscription_id) {
                    $subscription = \App\Models\Subscription::find($payment->subscription_id);
                    if ($subscription) {
                        $subscription->update([
                            'status' => 'active',
                            'current_period_start' => now(),
                            'current_period_end' => now()->addMonth(),
                            'next_payment_date' => now()->addMonth(),
                        ]);

                        $tenant = \App\Models\Tenant::find($payment->tenant_id);
                        if ($tenant) {
                            $tenant->update([
                                'plan_id' => $subscription->plan_id,
                                'status' => 'active',
                            ]);

                            // Notify Owner
                            if ($tenant->owner_id) {
                                $owner = \App\Models\User::find($tenant->owner_id);
                                if ($owner) {
                                    $owner->notify(new \App\Notifications\PaymentReceivedNotification($payment));
                                }
                            }
                        }
                    }
                }
            } elseif ($status === 'FAILED') {
                $payment->update([
                    'status' => 'failed',
                    'campay_status' => 'FAILED',
                    'meta' => array_merge($payment->meta ?? [], ['webhook_data' => $data]),
                ]);
            }
            return response()->json(['message' => 'Processed Central Payment']);
        }

        // 2. If not found in central, check if it's a Tenant Payment (Voucher Sale)
        // We look for PaymentAttempt in the tenant DB. 
        // We need to know which tenant. For now, we can try to find an attempt with this reference across all tenants 
        // OR better: ensure the external_reference or some data tells us the tenant.
        
        $attempt = null;
        $foundTenant = null;

        // Try to find tenant from external_reference if we format it as "TENANT_{id}_..."
        $extRef = $data['external_reference'] ?? '';
        if (str_starts_with($extRef, 'TENANT_')) {
            $parts = explode('_', $extRef);
            $tenantId = $parts[1] ?? null;
            $foundTenant = \App\Models\Tenant::find($tenantId);
        }

        if ($foundTenant) {
            $tenantService = app(\App\Services\TenantService::class);
            $tenantService->switchTo($foundTenant);

            $attempt = \App\Models\Tenant\PaymentAttempt::where('reference', $reference)->first();
            
            if ($attempt) {
                if ($attempt->status === 'success') {
                    return response()->json(['message' => 'Already processed']);
                }

                if ($status === 'SUCCESSFUL') {
                    $attempt->update([
                        'status' => 'success',
                        'completed_at' => now(),
                        'meta' => array_merge($attempt->meta ?? [], ['webhook_data' => $data])
                    ]);

                    // Finalize voucher sale
                    $voucherId = $attempt->meta['voucher_id'] ?? null;
                    $voucher = \App\Models\Tenant\WifiVoucher::find($voucherId);
                    
                    if ($voucher && $voucher->status === 'available') {
                        $voucher->update([
                            'status' => 'sold',
                            'purchased_at' => now(),
                            'purchase_amount_fcfa' => $attempt->amount_fcfa,
                            'campay_reference' => $reference,
                            'comment' => "Vendu via Webhook - Ref: {$reference}"
                        ]);
                    }
                } elseif (in_array($status, ['FAILED', 'CANCELLED'])) {
                    $attempt->update([
                        'status' => strtolower($status),
                        'completed_at' => now(),
                        'failure_reason' => $data['reason'] ?? 'Webhook signaled failure',
                        'meta' => array_merge($attempt->meta ?? [], ['webhook_data' => $data])
                    ]);
                }
                return response()->json(['message' => 'Processed Tenant Payment']);
            }
        }

        return response()->json(['message' => 'Payment not found or tenant not identified'], 200); // 200 to acknowledge Campay even if not found
    }
}

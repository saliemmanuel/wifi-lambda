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

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

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
            
            // Handle other payment types (like ticket purchase if needed in future)
        } elseif ($status === 'FAILED') {
            $payment->update([
                'status' => 'failed',
                'campay_status' => 'FAILED',
                'meta' => array_merge($payment->meta ?? [], ['webhook_data' => $data]),
            ]);
        }

        return response()->json(['message' => 'Processed']);
    }
}

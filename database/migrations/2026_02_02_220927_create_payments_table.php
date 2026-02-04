<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            
            $table->enum('payment_type', ['subscription', 'ticket']);
            
            // Subscription Payment Details
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->cascadeOnDelete();
            $table->decimal('amount_eur', 10, 2)->nullable();
            
            // Ticket Payment Details (Tenant DB References)
            $table->unsignedBigInteger('ticket_id')->nullable();
            $table->unsignedBigInteger('client_user_id')->nullable();
            $table->integer('amount_fcfa')->nullable();
            $table->integer('platform_commission_fcfa')->nullable();
            $table->integer('reseller_amount_fcfa')->nullable();
            
            // CamPay Integration
            $table->string('campay_transaction_id')->unique()->nullable();
            $table->string('campay_reference')->nullable();
            $table->enum('campay_status', ['PENDING', 'SUCCESSFUL', 'FAILED', 'CANCELLED'])->nullable();
            
            // Payment Method
            $table->enum('payment_method', ['orange_money', 'mtn_mobile_money', 'moov_money', 'card'])->nullable();
            $table->string('phone_number')->nullable();
            
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->unique();
            $table->string('database_name')->unique();
            
            $table->enum('status', [
                'pending', 'trial', 'active', 'suspended', 'banned', 'cancelled', 'deleted'
            ])->default('pending');

            $table->enum('payment_mode', ['subscription', 'pay_per_ticket'])->default('subscription');
            $table->integer('ticket_price_fcfa')->nullable(); // For pay_per_ticket mode
            $table->string('campay_wallet_id')->nullable(); // For pay_per_ticket mode
            $table->decimal('commission_rate', 5, 2)->default(10.00);

            $table->foreignId('plan_id')->nullable()->constrained('plans');
            
            $table->string('api_key')->unique()->nullable();
            
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('banned_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};

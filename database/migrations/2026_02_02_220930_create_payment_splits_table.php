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
        Schema::create('payment_splits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            
            $table->integer('total_amount_fcfa');
            
            // Platform Share (10%)
            $table->integer('platform_amount_fcfa');
            $table->string('platform_wallet_id')->nullable();
            $table->timestamp('platform_transferred_at')->nullable();
            
            // Reseller Share (90%)
            $table->integer('reseller_amount_fcfa');
            $table->string('reseller_wallet_id')->nullable();
            $table->timestamp('reseller_transferred_at')->nullable();
            
            $table->integer('campay_fees_fcfa')->nullable();
            $table->enum('split_status', ['pending', 'completed', 'failed'])->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_splits');
    }
};

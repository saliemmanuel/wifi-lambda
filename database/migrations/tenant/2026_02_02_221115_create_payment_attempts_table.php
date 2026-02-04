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
        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->decimal('amount', 12, 2);
            $table->integer('amount_fcfa');
            
            // Nullable for public/anonymous purchases
            $table->foreignId('ticket_id')->nullable()->constrained('tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            
            $table->enum('payment_method', ['orange_money', 'mtn_mobile_money', 'moov_money'])->nullable();
            $table->string('phone_number')->nullable();
            
            $table->string('campay_transaction_id')->nullable();
            $table->enum('status', ['pending', 'success', 'failed', 'cancelled'])->default('pending');
            $table->text('failure_reason')->nullable();
            
            $table->json('meta')->nullable();
            
            $table->timestamp('attempted_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_attempts');
    }
};

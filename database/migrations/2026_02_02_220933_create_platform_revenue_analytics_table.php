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
        Schema::create('platform_revenue_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            
            $table->decimal('subscription_revenue_eur', 10, 2)->default(0);
            $table->integer('active_subscriptions_count')->default(0);
            
            $table->integer('commission_revenue_fcfa')->default(0);
            $table->decimal('commission_revenue_eur', 10, 2)->default(0);
            $table->integer('tickets_paid_count')->default(0);
            
            $table->decimal('total_revenue_eur', 10, 2)->default(0);
            
            $table->json('revenue_by_tenant')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_revenue_analytics');
    }
};

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
        Schema::create('mikrotik_active_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('router_id')->constrained('mikrotik_routers')->cascadeOnDelete();
            $table->foreignId('voucher_id')->constrained('wifi_vouchers')->cascadeOnDelete();
            
            $table->string('mikrotik_session_id')->unique(); // .id from MikroTik
            $table->string('username');
            $table->string('mac_address');
            $table->string('ip_address');
            
            $table->timestamp('login_time')->nullable();
            $table->integer('uptime_seconds')->default(0);
            
            // Data Usage
            $table->bigInteger('bytes_in')->default(0);
            $table->bigInteger('bytes_out')->default(0);
            
            // Current Speed
            $table->integer('current_rate_in_kbps')->nullable();
            $table->integer('current_rate_out_kbps')->nullable();
            
            $table->enum('session_status', ['active', 'idle', 'disconnecting'])->default('active');
            
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('synced_at')->useCurrent();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mikrotik_active_sessions');
    }
};

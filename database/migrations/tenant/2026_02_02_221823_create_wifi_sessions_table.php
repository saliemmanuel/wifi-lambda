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
        Schema::create('wifi_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_id')->constrained('wifi_vouchers')->cascadeOnDelete();
            $table->foreignId('router_id')->constrained('mikrotik_routers')->cascadeOnDelete();
            
            $table->string('session_id')->unique();
            $table->string('username');
            $table->string('mac_address');
            $table->string('ip_address')->nullable();
            
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_minutes')->default(0);
            
            $table->bigInteger('data_upload_mb')->default(0);
            $table->bigInteger('data_download_mb')->default(0);
            
            $table->enum('disconnect_reason', ['user_request', 'time_limit', 'data_limit', 'lost_connection', 'unknown'])->default('unknown');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wifi_sessions');
    }
};

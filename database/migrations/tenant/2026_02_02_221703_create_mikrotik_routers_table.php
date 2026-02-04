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
        Schema::create('mikrotik_routers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('router_model')->nullable();
            
            // Connection Details
            $table->string('ip_address')->unique();
            $table->integer('port')->default(8728);
            $table->string('api_username');
            $table->text('api_password'); // Encrypted
            $table->boolean('use_ssl')->default(false);
            
            // Hotspot Config
            $table->string('hotspot_server_name')->nullable();
            $table->string('hotspot_interface')->nullable();
            $table->string('captive_portal_url')->nullable();
            
            // Sync Settings
            $table->boolean('sync_enabled')->default(true);
            $table->integer('sync_interval_minutes')->default(5);
            $table->timestamp('last_sync_at')->nullable();
            $table->enum('last_sync_status', ['success', 'failed', 'pending'])->nullable();
            
            // Stats
            $table->integer('total_users_created')->default(0);
            $table->integer('active_sessions_count')->default(0);
            $table->decimal('cpu_load_percent', 5, 2)->nullable();
            $table->decimal('memory_usage_percent', 5, 2)->nullable();
            $table->bigInteger('uptime_seconds')->nullable();
            
            // Connection Status
            $table->enum('connection_status', ['online', 'offline', 'unreachable'])->default('offline');
            $table->timestamp('last_seen_at')->nullable();
            $table->integer('ping_latency_ms')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mikrotik_routers');
    }
};

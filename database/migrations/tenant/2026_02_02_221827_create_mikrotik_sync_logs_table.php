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
        Schema::create('mikrotik_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('router_id')->constrained('mikrotik_routers')->cascadeOnDelete();
            
            $table->enum('sync_type', ['manual', 'scheduled', 'webhook', 'voucher_created']);
            $table->string('triggered_by')->nullable(); // user_id or 'system'
            
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            
            // Sync Results
            $table->integer('active_sessions_synced')->default(0);
            $table->integer('new_sessions')->default(0);
            $table->integer('ended_sessions')->default(0);
            
            $table->json('router_stats')->nullable(); // cpu, memory, etc.
            
            $table->integer('errors_count')->default(0);
            $table->json('errors_details')->nullable();
            $table->json('actions_performed')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mikrotik_sync_logs');
    }
};

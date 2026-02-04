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
        Schema::create('wifi_vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('wifi_packages')->cascadeOnDelete();
            $table->foreignId('hotspot_id')->nullable()->constrained('mikrotik_routers')->nullOnDelete();
            
            $table->string('username', 50)->unique();
            $table->string('password', 50);
            $table->text('qr_code_data')->nullable();
            
            $table->string('profile_name')->nullable();
            $table->string('time_limit')->nullable();
            $table->integer('time_limit_minutes')->nullable();
            $table->integer('data_limit_mb')->nullable();
            
            // Status
            $table->enum('status', ['generated', 'available', 'sold', 'active', 'expired', 'exhausted', 'suspended'])->default('generated');
            $table->enum('import_status', ['imported', 'system_generated', 'manual'])->default('system_generated');
            
            // Sale Info
            $table->foreignId('purchased_by')->nullable()->constrained('users');
            $table->timestamp('purchased_at')->nullable();
            $table->integer('purchase_amount_fcfa')->nullable();
            $table->unsignedBigInteger('payment_id')->nullable(); // Reference to Central DB
            
            // Usage Info
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('total_session_time_minutes')->default(0);
            $table->decimal('data_consumed_mb', 10, 2)->default(0);
            $table->integer('remaining_time_minutes')->nullable();
            $table->integer('connection_count')->default(0);
            
            // Current Session
            $table->string('current_session_id')->nullable();
            $table->string('mac_address', 17)->nullable();
            $table->string('ip_address', 45)->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wifi_vouchers');
    }
};

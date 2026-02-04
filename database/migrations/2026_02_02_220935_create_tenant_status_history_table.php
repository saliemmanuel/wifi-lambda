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
        Schema::create('tenant_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            
            $table->string('old_status')->nullable();
            $table->string('new_status');
            
            $table->enum('transition_type', ['automatic', 'manual', 'scheduled', 'webhook']);
            $table->text('reason')->nullable();
            
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->string('changed_by_system')->nullable();
            
            $table->json('metadata')->nullable();
            $table->boolean('notification_sent')->default(false);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_status_history');
    }
};

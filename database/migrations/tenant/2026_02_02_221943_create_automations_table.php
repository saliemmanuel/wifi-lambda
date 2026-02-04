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
        Schema::create('automations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('trigger', ['ticket_created', 'ticket_updated', 'ticket_status_changed', 'new_message']);
            
            $table->json('conditions')->nullable();
            $table->json('actions');
            
            $table->boolean('is_active')->default(true);
            $table->integer('execution_count')->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automations');
    }
};

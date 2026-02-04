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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            $table->enum('type', ['ticket_created', 'new_message', 'payment_received', 'wifi_expiring', 'system_alert']);
            $table->string('title');
            $table->text('message');
            
            $table->json('data')->nullable();
            
            $table->boolean('is_read')->default(false);
            $table->boolean('sent_email')->default(false);
            $table->boolean('sent_sms')->default(false);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

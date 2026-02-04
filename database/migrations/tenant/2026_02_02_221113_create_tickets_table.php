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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->foreignId('category_id')->constrained('categories');
            
            $table->string('subject');
            $table->text('description');
            
            $table->enum('status', ['open', 'in_progress', 'pending', 'resolved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('source', ['web', 'email', 'api', 'phone', 'chat'])->default('web');
            
            // Payment Logic
            $table->boolean('requires_payment')->default(false);
            $table->enum('payment_status', ['not_required', 'pending', 'processing', 'paid', 'failed'])->default('not_required');
            $table->integer('payment_amount_fcfa')->nullable();
            $table->unsignedBigInteger('payment_id')->nullable(); // Reference to Central DB
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            // Timing
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            
            // Satisfaction
            $table->integer('satisfaction_rating')->nullable();
            $table->text('satisfaction_comment')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};

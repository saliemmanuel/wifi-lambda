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
        Schema::create('withdrawal_methods', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->default('campay');
            $table->string('phone_number');
            $table->string('label')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('method_id')->constrained('withdrawal_methods')->onDelete('cascade');
            $table->integer('amount'); // In FCFA
            $table->integer('fee')->default(0);
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->string('reference')->unique();
            $table->string('external_reference')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('withdrawal_methods');
    }
};

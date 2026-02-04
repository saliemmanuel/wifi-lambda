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
        Schema::table('payment_attempts', function (Blueprint $table) {
            // Make user_id and ticket_id nullable
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->unsignedBigInteger('ticket_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_attempts', function (Blueprint $table) {
            // Revert to not null (caution: this might fail if null values exist)
            // We usually don't strictly revert 'nullable' changes in dev environments to avoid data loss issues
        });
    }
};

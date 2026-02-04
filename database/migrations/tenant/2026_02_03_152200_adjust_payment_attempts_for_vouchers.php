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
            if (!Schema::hasColumn('payment_attempts', 'reference')) {
                $table->string('reference')->nullable()->after('id');
            }
            if (!Schema::hasColumn('payment_attempts', 'meta')) {
                $table->json('meta')->nullable()->after('status');
            }
            if (!Schema::hasColumn('payment_attempts', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable()->after('reference');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_attempts', function (Blueprint $table) {
            $table->dropColumn(['reference', 'meta', 'amount']);
        });
    }
};

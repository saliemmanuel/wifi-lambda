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
        Schema::table('wifi_vouchers', function (Blueprint $table) {
            $table->string('campay_reference')->nullable()->after('payment_id')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wifi_vouchers', function (Blueprint $table) {
            $table->dropColumn('campay_reference');
        });
    }
};

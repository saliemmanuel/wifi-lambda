<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wifi_vouchers', function (Blueprint $table) {
            $table->string('campay_code')->nullable()->after('campay_reference')->index();
            $table->string('operator_reference')->nullable()->after('campay_code')->index();
        });
    }

    public function down(): void
    {
        Schema::table('wifi_vouchers', function (Blueprint $table) {
            $table->dropColumn(['campay_code', 'operator_reference']);
        });
    }
};

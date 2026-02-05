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
        if (!Schema::hasColumn('wifi_vouchers', 'campay_code')) {
            Schema::table('wifi_vouchers', function (Blueprint $table) {
                $after = Schema::hasColumn('wifi_vouchers', 'campay_reference') ? 'campay_reference' : 'status';
                $table->string('campay_code')->nullable()->after($after)->index();
            });
        }

        if (!Schema::hasColumn('wifi_vouchers', 'operator_reference')) {
            Schema::table('wifi_vouchers', function (Blueprint $table) {
                $after = Schema::hasColumn('wifi_vouchers', 'campay_code') ? 'campay_code' : 'status';
                 $table->string('operator_reference')->nullable()->after($after)->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe keep
    }
};

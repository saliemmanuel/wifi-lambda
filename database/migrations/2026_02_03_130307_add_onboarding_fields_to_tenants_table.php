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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('wifi_zone_name')->nullable()->after('name');
            $table->string('expected_users')->nullable()->after('plan_id');
            $table->string('referral_source')->nullable()->after('expected_users');
            $table->timestamp('onboarding_completed_at')->nullable()->after('referral_source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['wifi_zone_name', 'expected_users', 'referral_source', 'onboarding_completed_at']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('max_wifi_zones')->default(1)->after('max_agents');
        });

        // Update existing plans with zone limits
        DB::table('plans')->where('slug', 'free')->update(['max_wifi_zones' => 8]);
        DB::table('plans')->where('slug', 'business')->update(['max_wifi_zones' => -1]); // unlimited
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('max_wifi_zones');
        });
    }
};

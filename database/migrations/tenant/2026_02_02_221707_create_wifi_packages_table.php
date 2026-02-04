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
        Schema::create('wifi_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->integer('price_fcfa');
            $table->integer('time_limit_minutes');
            $table->string('time_limit_display');
            $table->integer('data_limit_mb')->nullable();
            $table->integer('bandwidth_limit_kbps')->nullable();
            $table->string('profile_name');
            $table->string('rate_limit')->nullable();
            $table->timestamps();
        });

        // Insert default packages
        DB::table('wifi_packages')->insert([
            [
                'name' => 'MINI_1H',
                'slug' => 'mini-1h',
                'price_fcfa' => 100,
                'time_limit_minutes' => 60,
                'time_limit_display' => '1 heure',
                'data_limit_mb' => null,
                'bandwidth_limit_kbps' => null,
                'profile_name' => 'MINI_1H',
                'rate_limit' => '1M/1M',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'FLASH_24H',
                'slug' => 'flash-24h',
                'price_fcfa' => 350,
                'time_limit_minutes' => 1440,
                'time_limit_display' => '24 heures',
                'data_limit_mb' => null,
                'bandwidth_limit_kbps' => null,
                'profile_name' => 'FLASH_24H',
                'rate_limit' => '2M/2M',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'BOSS_30MOIS',
                'slug' => 'boss-30-mois',
                'price_fcfa' => 5000,
                'time_limit_minutes' => 43200,
                'time_limit_display' => '30 jours',
                'data_limit_mb' => null,
                'bandwidth_limit_kbps' => null,
                'profile_name' => 'BOSS_30MOIS',
                'rate_limit' => '5M/5M',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wifi_packages');
    }
};

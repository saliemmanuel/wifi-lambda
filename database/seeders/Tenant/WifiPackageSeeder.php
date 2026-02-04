<?php

namespace Database\Seeders\Tenant;

use App\Models\Tenant\WifiPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WifiPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => '1 Heure',
                'slug' => '1h',
                'price_fcfa' => 100,
                'time_limit_minutes' => 60,
                'time_limit_display' => '1H',
                'profile_name' => '1H_PROFILE',
            ],
            [
                'name' => '24 Heures',
                'slug' => '24h',
                'price_fcfa' => 500,
                'time_limit_minutes' => 1440,
                'time_limit_display' => '24H',
                'profile_name' => '24H_PROFILE',
            ],
            [
                'name' => '1 Mois (BOSS)',
                'slug' => 'boss-30d',
                'price_fcfa' => 10000,
                'time_limit_minutes' => 43200,
                'time_limit_display' => '30 Jours',
                'profile_name' => 'BOSS_30MOIS',
            ],
        ];

        foreach ($packages as $package) {
            WifiPackage::updateOrCreate(['slug' => $package['slug']], $package);
        }
    }
}

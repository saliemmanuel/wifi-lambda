<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlatformAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Platform Super Admin
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@wifi-lambda.com'],
            [
                'name' => 'Platform Super Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\TenantService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Tenant\User as TenantUser;

class SampleDataSeeder extends Seeder
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function run(): void
    {
        // 1. Ensure we have a plan
        $plan = Plan::where('slug', 'business')->first();

        // 2. Create a Test Tenant
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'alfa'],
            [
                'name' => 'Hotel Alfa',
                'email' => 'contact@hotel-alfa.com',
                'database_name' => 'tenant_alfa', // This would need to exist in MySQL
                'status' => 'active',
                'plan_id' => $plan->id,
            ]
        );

        // 3. Create a subscription for the tenant
        Subscription::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan_id' => $plan->id,
                'starts_at' => now(),
                'status' => 'active',
            ]
        );

        // 4. Ideally, we would switch to the tenant DB and create a user
        // NOTE: This assumes the 'tenant_alfa' database exists.
        // For development, you might be using a single DB or SQLite.
        
        /*
        try {
            $this->tenantService->switchTo($tenant);
            
            TenantUser::firstOrCreate(
                ['email' => 'manager@alfa.com'],
                [
                    'name' => 'Manager Alfa',
                    'password' => Hash::make('password'),
                    'role' => 'admin',
                    'is_active' => true,
                ]
            );
        } catch (\Exception $e) {
            $this->command->warn("Could not seed tenant user: " . $e->getMessage());
        }
        */
    }
}

<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class TenantService
{
    protected ?Tenant $currentTenant = null;

    public function switchTo(Tenant $tenant): void
    {
        $this->currentTenant = $tenant;

        // Update the tenant connection configuration
        Config::set('database.connections.tenant.database', $tenant->database_name);

        // Purge the connection to ensure the new configuration is used
        DB::purge('tenant');
        DB::reconnect('tenant');

        // Set the connection as default if needed, or just let models handle it
        // For this app, models will handle it via the 'tenant' connection name
    }

    public function setupNewTenant(\App\Models\User $user, string $name, string $slug): Tenant
    {
        $dbName = 'tenant_' . $slug;

        // 1. Create Database (Central Connection)
        DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}`");
        
        // 2. Create Tenant & Subscription in Central DB
        $tenant = DB::transaction(function () use ($user, $name, $slug, $dbName) {
            $tenant = Tenant::create([
                'owner_id' => $user->id,
                'name' => $name,
                'slug' => $slug,
                'email' => $user->email,
                'database_name' => $dbName,
                'status' => 'active',
                'plan_id' => \App\Models\Plan::where('slug', 'free')->first()?->id ?? \App\Models\Plan::first()?->id ?? null,
            ]);

            \App\Models\Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $tenant->plan_id,
                'current_period_start' => now(),
                'current_period_end' => now()->addDays(30),
                'status' => 'active',
                'amount_eur' => 0,
            ]);

            return $tenant;
        });

        // 3. Run migrations on the NEW database
        try {
            // Force clean state for the 'tenant' connection
            \Illuminate\Support\Facades\Config::set('database.connections.tenant.database', $dbName);
            DB::purge('tenant');
            DB::disconnect('tenant');

            // Verify the connection is actually pointing to the correct DB
            $currentDb = DB::connection('tenant')->getDatabaseName();
            if ($currentDb !== $dbName) {
                throw new \Exception("Failed to switch to tenant database. Expected {$dbName}, got {$currentDb}");
            }

            // Run migrations
            $exitCode = \Illuminate\Support\Facades\Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path' => 'database/migrations/tenant',
                '--force' => true,
            ]);

            if ($exitCode !== 0) {
                $output = \Illuminate\Support\Facades\Artisan::output();
                \Illuminate\Support\Facades\Log::error("Migration failed for {$slug}: " . $output);
                throw new \Exception("La migration a échoué. Veuillez contacter le support.");
            }

            // Verify a critical table exists
            if (!\Illuminate\Support\Facades\Schema::connection('tenant')->hasTable('wifi_vouchers')) {
                throw new \Exception("Tables non trouvées après la migration pour {$dbName}.");
            }

            // Run seeder
            \Illuminate\Support\Facades\Artisan::call('db:seed', [
                '--database' => 'tenant',
                '--class' => \Database\Seeders\Tenant\WifiPackageSeeder::class,
                '--force' => true,
            ]);

            return $tenant;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Tenant Setup Exceptional Error for {$slug}: " . $e->getMessage());
            // Optional: cleanup failed tenant/db here if needed
            throw $e;
        }
    }

    public function getCurrentTenant(): ?Tenant
    {
        return $this->currentTenant;
    }
}

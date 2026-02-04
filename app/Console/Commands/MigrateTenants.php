<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class MigrateTenants extends Command
{
    protected $signature = 'tenants:migrate {--refresh : Reset and re-run all migrations} {--seed : Seed after migration}';
    protected $description = 'Run migrations for all tenant databases';

    public function __construct(protected TenantService $tenantService)
    {
        parent::__construct();
    }

    public function handle()
    {
        $tenants = Tenant::all();
        $this->info("Found " . $tenants->count() . " tenants. Starting migration...");

        foreach ($tenants as $tenant) {
            $this->info("------------------------------------------");
            $this->info("Migrating tenant: {$tenant->name} ({$tenant->slug})");
            
            try {
                $this->tenantService->switchTo($tenant);
                
                $command = $this->option('refresh') ? 'migrate:refresh' : 'migrate';
                
                Artisan::call($command, [
                    '--database' => 'tenant',
                    '--path' => 'database/migrations/tenant',
                    '--force' => true,
                ]);

                $this->line(Artisan::output());

                if ($this->option('seed')) {
                    $this->info("Seeding tenant: {$tenant->slug}");
                    Artisan::call('db:seed', [
                        '--database' => 'tenant',
                        '--class' => 'Database\Seeders\Tenant\WifiPackageSeeder',
                        '--force' => true,
                    ]);
                    $this->line(Artisan::output());
                }

                $this->info("Done: {$tenant->slug}");
            } catch (\Exception $e) {
                $this->error("Failed to migrate tenant {$tenant->slug}: " . $e->getMessage());
            }
        }

        $this->info("------------------------------------------");
        $this->info("All tenant migrations completed.");
    }
}

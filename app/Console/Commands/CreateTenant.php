<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant\User as TenantUser;
use App\Services\TenantService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateTenant extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:create {name} {email} {slug}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new tenant with a database and an admin user';

    public function __construct(protected TenantService $tenantService)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $slug = Str::slug($this->argument('slug'));

        // Reserved keywords check
        $reservedSlugs = [
            'admin', 'administrator', 'api', 'dashboard', 'settings', 
            'setup-tenant', 'setup', 'login', 'register', 'password', 
            'email', 'profile', 'shop', 'billing', 'withdrawals', 
            'assets', 'css', 'js', 'images', 'onboarding', 'buy'
        ];

        if (in_array($slug, $reservedSlugs) || strlen($slug) < 2) {
            $slug .= '-wifi';
        }

        $dbName = 'tenant_' . $slug;

        $this->info("Creating tenant: {$name} ({$slug})...");

        // 1. Create the database (MySQL specific)
        try {
            DB::statement("CREATE DATABASE IF NOT EXISTS {$dbName}");
            $this->info("Database {$dbName} created.");
        } catch (\Exception $e) {
            $this->error("Failed to create database: " . $e->getMessage());
            return 1;
        }

        // 2. Create the Tenant record
        $plan = Plan::where('slug', 'business')->first() ?? Plan::first();
        
        $tenant = Tenant::updateOrCreate(
            ['slug' => $slug],
            [
                'name' => $name,
                'email' => $email,
                'database_name' => $dbName,
                'status' => 'active',
                'plan_id' => $plan->id,
            ]
        );

        Subscription::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan_id' => $plan->id,
                'starts_at' => now(),
                'status' => 'active',
            ]
        );

        // 3. Run tenant migrations
        $this->info("Running migrations for tenant...");
        $this->tenantService->switchTo($tenant);
        
        $this->call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        // 4. Create Tenant Admin User
        $adminEmail = "manager@{$slug}.com";
        TenantUser::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => "Manager {$name}",
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $this->info("Tenant created successfully!");
        $this->info("Tenant Admin Credentials:");
        $this->info("Email: {$adminEmail}");
        $this->info("Password: password");

        return 0;
    }
}

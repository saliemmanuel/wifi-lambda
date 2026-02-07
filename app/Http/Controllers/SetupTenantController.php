<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SetupTenantController extends Controller
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function index()
    {
        // Check if user already has a tenant
        $tenant = Tenant::where('owner_id', auth()->id())->first();
        if ($tenant) {
            return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);
        }

        return Inertia::render('setup/create-tenant');
    }

    public function store(Request $request)
    {
        // 1. Generate UUID for slug
        $slug = (string) Str::uuid();
        
        // 2. Set name based on UUID (or generic name)
        // We use a generic name initially, the user can change it later if we add that feature.
        $name = 'Boutique-' . substr($slug, 0, 8);

        // 3. Ensure slug is unique in the database (highly likely with UUID but good practice)
        if (Tenant::where('slug', $slug)->exists()) {
             // In the extremely rare case of collision, regenerate
             $slug = (string) Str::uuid();
        }

        try {
            $tenant = $this->tenantService->setupNewTenant(
                auth()->user(), 
                $name, 
                $slug
            );

            return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Échec de la création de la zone : ' . $e->getMessage()]);
        }
    }
}

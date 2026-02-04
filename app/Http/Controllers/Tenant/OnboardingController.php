<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function show($tenant_slug)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($tenant->onboarding_completed_at) {
            return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);
        }

        return Inertia::render('tenant/onboarding/wizard', [
            'tenant' => $tenant
        ]);
    }

    public function store(Request $request, $tenant_slug)
    {
        $tenant = $this->tenantService->getCurrentTenant();

        $validated = $request->validate([
            'expected_users' => 'required|string',
            'referral_source' => 'required|string',
        ]);

        $tenant->update([
            ...$validated,
            'onboarding_completed_at' => now(),
        ]);

        return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);
    }
}

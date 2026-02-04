<?php

namespace App\Http\Middleware;

use App\Services\TenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingIsCompleted
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();

        if ($tenant && !$tenant->onboarding_completed_at && !$request->routeIs('tenant.onboarding')) {
            return redirect()->route('tenant.onboarding', ['tenant_slug' => $tenant->slug]);
        }

        return $next($request);
    }
}

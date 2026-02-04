<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Services\TenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
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
        $slug = $request->route('tenant_slug');

        if ($slug) {
            $tenant = Tenant::with('plan')->where('slug', $slug)->first();

            if (!$tenant) {
                abort(404, 'Tenant not found.');
            }

            if ($tenant->status !== 'active') {
                abort(403, 'Tenant account is ' . $tenant->status);
            }

            $this->tenantService->switchTo($tenant);

            // Security: Ownership Verification
            // If the user is logged in, they MUST be the owner of this tenant
            // to access any non-public tenant routes.
            if (auth()->check()) {
                $user = auth()->user();
                
                // Allow Super Admin (logic: email ends with @wifi-lambda.com)
                $isSuperAdmin = str_ends_with($user->email, '@wifi-lambda.com');
                
                if (!$isSuperAdmin && $tenant->owner_id !== $user->id) {
                    // This user is logged in but doesn't own this tenant!
                    // If they are trying to access an admin route, we block them.
                    // Note: Public routes like /buy are handled by checking if 'auth' middleware is present in the route.
                    if (in_array('auth', $request->route()->middleware())) {
                        abort(403, "Vous n'êtes pas autorisé à accéder à cet espace.");
                    }
                }
            }

            // Security: Prevent Session Leakage between Tenants
            if (session()->has('tenant_context_slug')) {
                if (session('tenant_context_slug') !== $slug) {
                    // Mismatch detected: The user (or guest) came from another tenant.
                    if (auth()->check()) {
                        auth()->logout();
                    }
                    session()->invalidate();
                    session()->regenerateToken();
                    session(['tenant_context_slug' => $slug]);
                }
            } else {
                session(['tenant_context_slug' => $slug]);
            }
        }

        return $next($request);
    }
}

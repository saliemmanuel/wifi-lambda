<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the requested tenant slug from the route parameter
        $routeTenantSlug = $request->route('tenant_slug');

        // If no tenant in route, proceed (public pages or central admin)
        if (!$routeTenantSlug) {
            return $next($request);
        }

        // If user is logged in
        if (Auth::check()) {
            $sessionTenantSlug = session('current_tenant_slug');

            // If the session tenant doesn't match the route tenant
            if ($sessionTenantSlug && $sessionTenantSlug !== $routeTenantSlug) {
                // Security breach attempt or unintentional navigation detected
                
                // Logout the user
                Auth::guard('web')->logout();

                // Invalidate the session
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Redirect to the login page of the NEW tenant
                return redirect()->route('tenant.login', ['tenant_slug' => $routeTenantSlug])
                    ->withErrors(['email' => 'Session expirée car vous avez changé d\'espace. Veuillez vous reconnecter.']);
            }

            // If user is logged in but session has no tenant_slug (legacy or edge case), set it
            if (!$sessionTenantSlug) {
                session(['current_tenant_slug' => $routeTenantSlug]);
            }
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !str_ends_with($user->email, '@wifi-lambda.com')) {
            // Abort with 403 Forbidden or redirect to home
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}

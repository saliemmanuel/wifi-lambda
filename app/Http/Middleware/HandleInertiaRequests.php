<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'tenant' => function () use ($request) {
                $tenantService = app(\App\Services\TenantService::class);
                $currentTenant = $tenantService->getCurrentTenant();
                
                if (!$currentTenant && $request->user()) {
                    // Try to find if user owns a tenant for navigation context
                    $currentTenant = \App\Models\Tenant::where('owner_id', $request->user()->id)->first();
                }
                
                return $currentTenant;
            },
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'alert' => fn () => $request->session()->get('alert'),
                'campay_reference' => fn () => $request->session()->get('campay_reference'),
            ],
        ];
    }
}

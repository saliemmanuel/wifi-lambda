<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\MikrotikRouter;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ZoneController extends Controller
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function index($tenant_slug)
    {
        return Inertia::render('tenant/zones/index', [
            'zones' => MikrotikRouter::latest()->get()
        ]);
    }

    public function store(Request $request, $tenant_slug)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $plan = $tenant->plan;

        // Check zone limit based on plan
        if ($plan && $plan->max_wifi_zones !== -1) {
            $currentCount = MikrotikRouter::count();
            if ($currentCount >= $plan->max_wifi_zones) {
                return back()->withErrors(['error' => "Vous avez atteint la limite de {$plan->max_wifi_zones} zones pour votre forfait actuel. Passez à un forfait supérieur pour créer plus de zones."]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'ip_address' => 'required|string|ip|unique:mikrotik_routers,ip_address',
            'port' => 'required|integer|min:1|max:65535',
            'api_username' => 'required|string|max:255',
            'api_password' => 'required|string',
            'hotspot_server_name' => 'nullable|string|max:255',
            'hotspot_interface' => 'nullable|string|max:255',
            'captive_portal_url' => 'nullable|url|max:500',
        ]);

        MikrotikRouter::create($validated);

        return back()->with('success', 'Zone créée avec succès.');
    }

    public function update(Request $request, $tenant_slug, $id)
    {
        $zone = MikrotikRouter::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'ip_address' => 'required|string|ip|unique:mikrotik_routers,ip_address,' . $id,
            'port' => 'required|integer|min:1|max:65535',
            'api_username' => 'required|string|max:255',
            'api_password' => 'nullable|string',
            'hotspot_server_name' => 'nullable|string|max:255',
            'hotspot_interface' => 'nullable|string|max:255',
            'captive_portal_url' => 'nullable|url|max:500',
        ]);

        // Only update password if provided
        if (empty($validated['api_password'])) {
            unset($validated['api_password']);
        }

        $zone->update($validated);

        return back()->with('success', 'Zone mise à jour avec succès.');
    }

    public function destroy($tenant_slug, $id)
    {
        $zone = MikrotikRouter::findOrFail($id);
        
        // Check if zone has associated packages
        $packagesCount = $zone->packages()->count();
        if ($packagesCount > 0) {
            return back()->withErrors(['error' => "Impossible de supprimer cette zone car elle contient {$packagesCount} forfait(s). Veuillez d'abord supprimer ou réassigner les forfaits."]);
        }

        $zone->delete();
        return back()->with('success', 'Zone supprimée avec succès.');
    }
}

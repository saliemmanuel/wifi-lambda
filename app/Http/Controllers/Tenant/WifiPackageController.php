<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\WifiPackage;
use App\Models\Tenant\MikrotikRouter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WifiPackageController extends Controller
{
    public function index($tenant_slug)
    {
        return Inertia::render('tenant/wifi/packages/index', [
            'packages' => WifiPackage::with('router')->latest()->get(),
            'zones' => MikrotikRouter::all(['id', 'name'])
        ]);
    }

    public function store(Request $request, $tenant_slug)
    {
        $validated = $request->validate([
            'mikrotik_router_id' => 'nullable|exists:tenant.mikrotik_routers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_fcfa' => 'required|integer|min:0',
            'profile_name' => 'required|string|max:255', // The name in MikroTik
            'time_limit_display' => 'required|string|max:255',
            'time_limit_minutes' => 'required|integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        WifiPackage::create($validated);

        return back()->with('success', 'Forfait créé avec succès.');
    }

    public function update(Request $request, $tenant_slug, $id)
    {
        $package = WifiPackage::findOrFail($id);

        $validated = $request->validate([
            'mikrotik_router_id' => 'nullable|exists:tenant.mikrotik_routers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_fcfa' => 'required|integer|min:0',
            'profile_name' => 'required|string|max:255',
            'time_limit_display' => 'required|string|max:255',
            'time_limit_minutes' => 'required|integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $package->update($validated);

        return back()->with('success', 'Forfait mis à jour.');
    }

    public function destroy($tenant_slug, $id)
    {
        WifiPackage::findOrFail($id)->delete();
        return back()->with('success', 'Forfait supprimé.');
    }
}

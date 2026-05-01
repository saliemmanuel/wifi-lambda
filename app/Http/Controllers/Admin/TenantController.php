<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Tenant;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $tenants = Tenant::with(['plan', 'activeSubscription.plan'])
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/tenants/index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search'])
        ]);
    }

    public function toggleStatus(Tenant $tenant)
    {
        $newStatus = $tenant->status === 'active' ? 'suspended' : 'active';
        
        $tenant->update([
            'status' => $newStatus,
            'suspended_at' => $newStatus === 'suspended' ? now() : null
        ]);

        return back()->with('success', "Tenant status updated to {$newStatus}.");
    }

    public function upgradeToBusiness(Tenant $tenant)
    {
        $businessPlan = \App\Models\Plan::where('slug', 'business')->first();

        if (!$businessPlan) {
            return back()->with('error', "Le plan Business n'existe pas dans la base de données.");
        }

        $tenant->update([
            'plan_id' => $businessPlan->id,
            'status' => 'active',
        ]);

        // Update or create an active subscription for consistency
        \App\Models\Subscription::updateOrCreate(
            ['tenant_id' => $tenant->id, 'status' => 'active'],
            [
                'plan_id' => $businessPlan->id,
                'starts_at' => now(),
            ]
        );

        return back()->with('success', "Le tenant {$tenant->name} a été passé au plan Business.");
    }

    public function downgradeToFree(Tenant $tenant)
    {
        $freePlan = \App\Models\Plan::where('slug', 'free')->first();

        if (!$freePlan) {
            return back()->with('error', "Le plan Gratuit n'existe pas dans la base de données.");
        }

        $tenant->update([
            'plan_id' => $freePlan->id,
            'status' => 'active',
        ]);

        // Update or create an active subscription for consistency
        \App\Models\Subscription::updateOrCreate(
            ['tenant_id' => $tenant->id, 'status' => 'active'],
            [
                'plan_id' => $freePlan->id,
                'starts_at' => now(),
            ]
        );

        return back()->with('success', "Le tenant {$tenant->name} a été remis au plan Gratuit.");
    }
}

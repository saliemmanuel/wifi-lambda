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
}

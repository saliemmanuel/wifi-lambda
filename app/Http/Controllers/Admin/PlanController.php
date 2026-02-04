<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::all();
        return Inertia::render('admin/plans/index', [
            'plans' => $plans
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_eur' => 'required|numeric|min:0',
            'price_fcfa' => 'required|integer|min:0',
            'max_tickets_per_month' => 'required|integer',
            'max_agents' => 'required|integer',
            'max_storage_gb' => 'required|integer',
        ]);

        $plan->update($validated);

        return back()->with('success', 'Plan mis à jour avec succès.');
    }
}

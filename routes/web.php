<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::post('/webhook/campay', [\App\Http\Controllers\Webhook\CampayController::class, 'handle'])->name('webhook.campay');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // Redirection logic based on user role and ownership
        $user = auth()->user();
        
        // 1. Is Super Admin?
        if (str_ends_with($user->email, '@zawifi.com')) {
            return redirect()->route('admin.dashboard');
        }

        // 2. Has a Tenant?
        $tenant = \App\Models\Tenant::where('owner_id', $user->id)->first();
        if ($tenant) {
            return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);
        }

        // 3. New User? Rediriger vers la home ou une page de création
        return redirect()->route('home');
    })->name('dashboard');



    Route::prefix('admin')->name('admin.')->middleware('super-admin')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/tenants', [\App\Http\Controllers\Admin\TenantController::class, 'index'])->name('tenants.index');
        Route::patch('/tenants/{tenant}/toggle-status', [\App\Http\Controllers\Admin\TenantController::class, 'toggleStatus'])->name('tenants.toggle-status');
        Route::post('/tenants/{tenant}/upgrade-business', [\App\Http\Controllers\Admin\TenantController::class, 'upgradeToBusiness'])->name('tenants.upgrade-business');
        Route::post('/tenants/{tenant}/downgrade-free', [\App\Http\Controllers\Admin\TenantController::class, 'downgradeToFree'])->name('tenants.downgrade-free');
        
        Route::get('/plans', [\App\Http\Controllers\Admin\PlanController::class, 'index'])->name('plans.index');
        Route::put('/plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'update'])->name('plans.update');
        Route::get('/revenue', [\App\Http\Controllers\Admin\RevenueController::class, 'index'])->name('revenue.index');
        Route::get('/withdrawals', [\App\Http\Controllers\Admin\WithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::post('/withdrawals/methods', [\App\Http\Controllers\Admin\WithdrawalController::class, 'storeMethod'])->name('withdrawals.methods.store');
        Route::post('/withdrawals/request', [\App\Http\Controllers\Admin\WithdrawalController::class, 'requestWithdrawal'])->name('withdrawals.request');
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/tenant.php';

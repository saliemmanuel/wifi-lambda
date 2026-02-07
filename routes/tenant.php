<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('{tenant_slug}')->middleware(['tenant'])->group(function () {
    
    // Public Shop (Capture Portal) - NO AUTH REQUIRED
    Route::get('/buy', [\App\Http\Controllers\Public\ShopController::class, 'index'])->name('tenant.shop.index');
    Route::post('/buy/initiate', [\App\Http\Controllers\Public\ShopController::class, 'initiate'])->name('tenant.shop.initiate');
    Route::get('/buy/check-status/{reference}', [\App\Http\Controllers\Public\ShopController::class, 'checkStatus'])->name('tenant.shop.check-status');
    Route::post('/buy/retrieve', [\App\Http\Controllers\Public\ShopController::class, 'retrieveVoucher'])->name('tenant.shop.retrieve');
    Route::get('/buy/download-pdf/{reference}', [\App\Http\Controllers\Public\ShopController::class, 'downloadPdf'])->name('tenant.shop.download-pdf');
    
    // Zone Specific Shop
    Route::get('/buy/zone/{zone}', [\App\Http\Controllers\Public\ShopController::class, 'index'])->name('tenant.shop.zone');

    // Protected Routes - AUTH REQUIRED
    Route::middleware(['auth'])->group(function () {
        
        // Onboarding
        Route::get('/onboarding', [\App\Http\Controllers\Tenant\OnboardingController::class, 'show'])->name('tenant.onboarding');
        Route::post('/onboarding', [\App\Http\Controllers\Tenant\OnboardingController::class, 'store']);

        // Routes protected by onboarding
        Route::middleware(['onboarded'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Tenant\DashboardController::class, 'index'])->name('tenant.dashboard');

            // Tickets
            Route::get('/tickets', function () {
                return Inertia::render('tenant/tickets/index');
            })->name('tenant.tickets.index');

            // Wi-Fi
            Route::get('/wifi/vouchers', [\App\Http\Controllers\Tenant\WifiVoucherController::class, 'index'])->name('tenant.wifi.vouchers');
            Route::post('/wifi/vouchers/import', [\App\Http\Controllers\Tenant\WifiVoucherController::class, 'import'])->name('tenant.wifi.vouchers.import');
            Route::delete('/wifi/vouchers/bulk-delete', [\App\Http\Controllers\Tenant\WifiVoucherController::class, 'bulkDestroy'])->name('tenant.wifi.vouchers.bulk-delete');
            Route::delete('/wifi/vouchers/{voucher}', [\App\Http\Controllers\Tenant\WifiVoucherController::class, 'destroy'])->name('tenant.wifi.vouchers.destroy');
            
            Route::get('/wifi/packages', [\App\Http\Controllers\Tenant\WifiPackageController::class, 'index'])->name('tenant.wifi.packages');
            Route::post('/wifi/packages', [\App\Http\Controllers\Tenant\WifiPackageController::class, 'store'])->name('tenant.wifi.packages.store');
            Route::put('/wifi/packages/{package}', [\App\Http\Controllers\Tenant\WifiPackageController::class, 'update'])->name('tenant.wifi.packages.update');
            Route::delete('/wifi/packages/{package}', [\App\Http\Controllers\Tenant\WifiPackageController::class, 'destroy'])->name('tenant.wifi.packages.destroy');
            
            Route::get('/wifi/statistics', [\App\Http\Controllers\Tenant\StatisticsController::class, 'index'])->name('tenant.wifi.statistics');

            Route::get('/zones', [\App\Http\Controllers\Tenant\ZoneController::class, 'index'])->name('tenant.zones');
            Route::post('/zones', [\App\Http\Controllers\Tenant\ZoneController::class, 'store'])->name('tenant.zones.store');
            Route::put('/zones/{zone}', [\App\Http\Controllers\Tenant\ZoneController::class, 'update'])->name('tenant.zones.update');
            Route::delete('/zones/{zone}', [\App\Http\Controllers\Tenant\ZoneController::class, 'destroy'])->name('tenant.zones.destroy');

            Route::get('/transactions', [\App\Http\Controllers\Tenant\TransactionController::class, 'index'])->name('tenant.transactions');
            Route::get('/transactions/{transaction}', [\App\Http\Controllers\Tenant\TransactionController::class, 'show'])->name('tenant.transactions.show');

            // Withdrawals (Retraits)
            Route::prefix('withdrawals')->name('tenant.withdrawals.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Tenant\WithdrawalController::class, 'index'])->name('index');
                Route::post('/methods', [\App\Http\Controllers\Tenant\WithdrawalController::class, 'addMethod'])->name('methods.store');
                Route::delete('/methods/{id}', [\App\Http\Controllers\Tenant\WithdrawalController::class, 'deleteMethod'])->name('methods.destroy');
                Route::post('/initiate', [\App\Http\Controllers\Tenant\WithdrawalController::class, 'initiate'])->name('initiate');
            });
            
            // Billing & Plans
            Route::get('/billing', [\App\Http\Controllers\Tenant\BillingController::class, 'index'])->name('tenant.billing.index');
            Route::post('/billing/initiate', [\App\Http\Controllers\Tenant\BillingController::class, 'initiatePayment'])->name('tenant.billing.initiate');
            Route::get('/billing/check-status/{reference}', [\App\Http\Controllers\Tenant\BillingController::class, 'checkStatus'])->name('tenant.billing.check-status');
            Route::post('/billing/upgrade', [\App\Http\Controllers\Tenant\BillingController::class, 'upgrade'])->name('tenant.billing.upgrade');
        });
    });

});

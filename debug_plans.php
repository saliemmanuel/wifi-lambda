<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;

$tenants = Tenant::with(['plan', 'activeSubscription.plan'])->get();
foreach($tenants as $t) {
    echo "Tenant: " . $t->name . "\n";
    echo "  Plan ID: " . $t->plan_id . " (" . ($t->plan->name ?? 'N/A') . ")\n";
    echo "  Active Sub: " . ($t->activeSubscription->plan->name ?? 'NONE') . "\n";
    echo "-------------------\n";
}

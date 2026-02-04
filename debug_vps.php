<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- DIAGNOSTIC START ---\n";

// 1. Check Code Version (BillingController)
$content = file_get_contents(__DIR__ . '/app/Http/Controllers/Tenant/BillingController.php');
if (strpos($content, "'amount_fcfa' => 5") !== false) {
    echo "[OK] Code seems updated (amount_fcfa is integer).\n";
} else {
    echo "[FAIL] Code is OLD! 'amount_fcfa' is likely string '5'. GIT PULL FAILED OR CACHE NOT CLEARED.\n";
}

if (strpos($content, "detectPaymentMethod") !== false) {
     echo "[OK] Code seems updated (detectPaymentMethod present).\n";
} else {
     echo "[FAIL] Code is OLD! detectPaymentMethod missing.\n";
}

// 2. Test DB Connection
try {
    \DB::connection()->getPdo();
    echo "[OK] Database connection successful.\n";
} catch (\Exception $e) {
    echo "[FAIL] DB Connection failed: " . $e->getMessage() . "\n";
    exit;
}

// 3. Test Insert
try {
    echo "Attempting raw SQL insert...\n";
    \DB::table('payments')->insert([
        'tenant_id' => 1, // Assumptions
        'payment_type' => 'subscription',
        'amount_fcfa' => 5,
        'payment_method' => 'mobile_money', // TESTING THE ENUM/STRING ISSUE
        'campay_transaction_id' => 'DEBUG_' . time(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "[SUCCESS] Inserted 'mobile_money' successfully! The DB migration IS Applied.\n";
} catch (\Exception $e) {
    echo "[FAIL] Insert Failed: " . $e->getMessage() . "\n";
    if (strpos($e->getMessage(), "Data truncated") !== false) {
        echo ">>> DIAGNOSIS: The DB migration to change ENUM to STRING has NOT been applied on the VPS.\n";
        echo ">>> ACTION: Run 'docker compose exec app php artisan migrate --force' again.\n";
    }
}

echo "--- DIAGNOSTIC END ---\n";

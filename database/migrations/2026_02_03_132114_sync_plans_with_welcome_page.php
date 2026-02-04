<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('plans', 'commission_rate')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->decimal('commission_rate', 5, 2)->default(0.00)->after('price_fcfa');
            });
        }

        // Clear existing plans safely
        Schema::disableForeignKeyConstraints();
        DB::table('plans')->truncate();
        Schema::enableForeignKeyConstraints();

        // Insert synced plans
        DB::table('plans')->insert([
            [
                'id' => 1,
                'name' => 'Gratuit',
                'slug' => 'free',
                'price_eur' => 0.00,
                'price_fcfa' => 0,
                'commission_rate' => 10.00,
                'max_tickets_per_month' => -1,
                'max_agents' => -1,
                'max_storage_gb' => 5,
                'api_access' => false,
                'white_label' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Business',
                'slug' => 'business',
                'price_eur' => 79.00,
                'price_fcfa' => 52000,
                'commission_rate' => 0.00,
                'max_tickets_per_month' => -1,
                'max_agents' => -1,
                'max_storage_gb' => 50,
                'api_access' => true,
                'white_label' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('plans', 'commission_rate')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropColumn('commission_rate');
            });
        }
    }
};

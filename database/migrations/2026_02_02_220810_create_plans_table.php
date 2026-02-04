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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price_eur', 10, 2);
            $table->integer('price_fcfa');
            $table->integer('max_tickets_per_month'); // -1 for unlimited
            $table->integer('max_agents'); // -1 for unlimited
            $table->integer('max_storage_gb');
            $table->boolean('api_access')->default(false);
            $table->boolean('white_label')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default plans
        DB::table('plans')->insert([
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'price_eur' => 29.00,
                'price_fcfa' => 19000,
                'max_tickets_per_month' => 100,
                'max_agents' => 3,
                'max_storage_gb' => 5,
                'api_access' => false,
                'white_label' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'price_eur' => 79.00,
                'price_fcfa' => 52000,
                'max_tickets_per_month' => 1000,
                'max_agents' => 10,
                'max_storage_gb' => 50,
                'api_access' => true,
                'white_label' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'price_eur' => 199.00,
                'price_fcfa' => 130000,
                'max_tickets_per_month' => -1,
                'max_agents' => -1,
                'max_storage_gb' => 500,
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
        Schema::dropIfExists('plans');
    }
};

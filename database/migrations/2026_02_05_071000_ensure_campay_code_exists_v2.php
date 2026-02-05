<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('payments', 'campay_code')) {
            Schema::table('payments', function (Blueprint $table) {
                // Check if 'campay_reference' exists to place it after, otherwise just add it
                if (Schema::hasColumn('payments', 'campay_reference')) {
                    $table->string('campay_code')->nullable()->after('campay_reference')->index();
                } else {
                    $table->string('campay_code')->nullable()->index();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We do not drop the column here to avoid accidental data loss if rolling back this specific fix migration
        // checking if it was created by the original migration or this one is complex.
    }
};

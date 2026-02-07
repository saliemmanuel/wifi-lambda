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
        Schema::table('mikrotik_routers', function (Blueprint $table) {
            $table->string('ip_address')->nullable()->change();
            $table->dropUnique('mikrotik_routers_ip_address_unique'); // Remove unique constraint if it complicates nulls (though nulls are usually allowed, cleaner to drop if not needed)
            $table->integer('port')->nullable()->change();
            $table->string('api_username')->nullable()->change();
            $table->text('api_password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mikrotik_routers', function (Blueprint $table) {
            // Reverting validtaion is risky if data contains nulls, but we can try
            // $table->string('ip_address')->nullable(false)->change();
            // ...
        });
    }
};

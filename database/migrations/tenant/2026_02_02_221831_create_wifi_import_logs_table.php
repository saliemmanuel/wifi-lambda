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
        Schema::create('wifi_import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('imported_by')->constrained('users');
            
            $table->string('batch_id')->unique();
            $table->string('filename');
            $table->enum('import_type', ['csv', 'excel', 'mikhmon']);
            
            $table->integer('total_rows')->default(0);
            $table->integer('successful_imports')->default(0);
            $table->integer('failed_imports')->default(0);
            $table->integer('duplicate_usernames')->default(0);
            
            $table->foreignId('package_id')->nullable()->constrained('wifi_packages');
            
            $table->json('import_config')->nullable();
            $table->json('errors_json')->nullable();
            
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wifi_import_logs');
    }
};

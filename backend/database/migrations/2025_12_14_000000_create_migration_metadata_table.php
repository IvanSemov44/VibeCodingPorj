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
        Schema::create('migration_metadata', function (Blueprint $table) {
            $table->id();
            $table->string('marker_key')->unique();
            $table->text('marker_value')->nullable();
            $table->string('ran_by')->nullable();
            $table->timestamp('ran_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('migration_metadata');
    }
};

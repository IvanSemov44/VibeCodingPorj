<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable()->index();
            $table->string('url')->nullable();
            $table->string('docs_url')->nullable();
            $table->text('description')->nullable();
            $table->text('usage')->nullable();
            $table->text('examples')->nullable();
            $table->string('difficulty')->nullable();
            $table->json('screenshots')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddApprovalToTools extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->string('status')->default('pending')->index()->after('slug'); // pending, approved, rejected
            $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null')->after('status');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null')->after('submitted_by');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('rejection_reason')->nullable()->after('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropColumn(['status', 'submitted_by', 'reviewed_by', 'reviewed_at', 'rejection_reason']);
        });
    }
}

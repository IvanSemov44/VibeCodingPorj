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
        // Add columns only when they do not already exist to allow re-runs in development.
        if (! Schema::hasColumn('users', 'two_factor_type')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('two_factor_type')->nullable()->after('email');
            });
        }

        if (! Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('two_factor_secret')->nullable()->after('two_factor_type');
            });
        }

        if (! Schema::hasColumn('users', 'two_factor_recovery_codes')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            });
        }

        if (! Schema::hasColumn('users', 'two_factor_confirmed_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
            });
        }

        if (! Schema::hasColumn('users', 'telegram_chat_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('telegram_chat_id')->nullable()->unique()->after('two_factor_confirmed_at');
            });
        }

        if (! Schema::hasColumn('users', 'telegram_verified')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('telegram_verified')->default(false)->after('telegram_chat_id');
            });
        }

        if (! Schema::hasColumn('users', 'is_active')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->index()->after('telegram_verified');
            });
        }

        if (! Schema::hasColumn('users', 'last_login_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('last_login_at')->nullable()->after('is_active');
            });
        }

        if (! Schema::hasColumn('users', 'last_login_ip')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('last_login_ip')->nullable()->after('last_login_at');
            });
        }

        if (! Schema::hasColumn('users', 'failed_login_attempts')) {
            Schema::table('users', function (Blueprint $table) {
                $table->integer('failed_login_attempts')->default(0)->after('last_login_ip');
            });
        }

        if (! Schema::hasColumn('users', 'locked_until')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            });
        }

        if (! Schema::hasColumn('users', 'password_changed_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('password_changed_at')->nullable()->after('locked_until');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'two_factor_type',
                'two_factor_secret',
                'two_factor_recovery_codes',
                'two_factor_confirmed_at',
                'telegram_chat_id',
                'telegram_verified',
                'is_active',
                'last_login_at',
                'last_login_ip',
                'failed_login_attempts',
                'locked_until',
                'password_changed_at',
            ]);
        });
    }
};

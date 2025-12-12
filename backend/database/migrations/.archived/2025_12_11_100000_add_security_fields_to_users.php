<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSecurityFieldsToUsers extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('two_factor_type')->nullable()->after('remember_token'); // totp, email, telegram
            $table->text('two_factor_secret')->nullable()->after('two_factor_type');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');

            $table->string('telegram_chat_id')->nullable()->unique()->after('two_factor_confirmed_at');
            $table->boolean('telegram_verified')->default(false)->after('telegram_chat_id');

            $table->boolean('is_active')->default(true)->index()->after('telegram_verified');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
            $table->integer('failed_login_attempts')->default(0)->after('last_login_ip');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            $table->timestamp('password_changed_at')->nullable()->after('locked_until');
        });
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
}

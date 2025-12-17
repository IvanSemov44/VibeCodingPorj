<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $db = env('DB_DATABASE');

        Schema::table('tools', function (Blueprint $table) use ($db) {
            if (! Schema::hasColumn('tools', 'status')) {
                return;
            }

            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'tools' and index_name = ?", [$db, 'tools_status_index']));
            if (! $exists) {
                $table->index('status', 'tools_status_index');
            }

            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'tools' and index_name = ?", [$db, 'tools_created_at_index']));
            if (! $exists) {
                $table->index('created_at', 'tools_created_at_index');
            }

            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'tools' and index_name = ?", [$db, 'tools_status_created_at_index']));
            if (! $exists) {
                $table->index(['status', 'created_at'], 'tools_status_created_at_index');
            }
        });

        Schema::table('users', function (Blueprint $table) use ($db) {
            if (Schema::hasColumn('users', 'email')) {
                $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'users' and index_name = ?", [$db, 'users_email_index']));
                if (! $exists) {
                    $table->index('email', 'users_email_index');
                }
            }

            if (Schema::hasColumn('users', 'is_active')) {
                $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'users' and index_name = ?", [$db, 'users_is_active_index']));
                if (! $exists) {
                    $table->index('is_active', 'users_is_active_index');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $db = env('DB_DATABASE');

        Schema::table('tools', function (Blueprint $table) use ($db) {
            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'tools' and index_name = ?", [$db, 'tools_status_index']));
            if ($exists) {
                $table->dropIndex('tools_status_index');
            }

            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'tools' and index_name = ?", [$db, 'tools_created_at_index']));
            if ($exists) {
                $table->dropIndex('tools_created_at_index');
            }

            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'tools' and index_name = ?", [$db, 'tools_status_created_at_index']));
            if ($exists) {
                $table->dropIndex('tools_status_created_at_index');
            }
        });

        Schema::table('users', function (Blueprint $table) use ($db) {
            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'users' and index_name = ?", [$db, 'users_email_index']));
            if ($exists) {
                $table->dropIndex('users_email_index');
            }

            $exists = (bool) count(\DB::select("select 1 from information_schema.statistics where table_schema = ? and table_name = 'users' and index_name = ?", [$db, 'users_is_active_index']));
            if ($exists) {
                $table->dropIndex('users_is_active_index');
            }
        });
    }
};

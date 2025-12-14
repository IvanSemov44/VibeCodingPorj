<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class MigrateAndSeedWithLock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:with-lock
                            {--lock-name=migrate_and_seed_lock}
                            {--marker-key=migrations_done}
                            {--tries=30}
                            {--sleep=2}
    ';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrations and seeders with a DB advisory lock and upsert a migration marker.';

    public function handle()
    {
        $lockName = $this->option('lock-name');
        $markerKey = $this->option('marker-key');
        $tries = (int) $this->option('tries');
        $sleep = (int) $this->option('sleep');

        $this->info("Migrator (artisan): attempting to acquire DB lock ({$lockName})");

        $acquired = false;
        for ($i = 0; $i < $tries; $i++) {
            try {
                $res = DB::select('SELECT GET_LOCK(?, ?)', [$lockName, 5]);
                if (is_array($res) && count($res) > 0) {
                    $row = (array) $res[0];
                    $val = array_values($row)[0];
                    if ((int) $val === 1) {
                        $acquired = true;
                        break;
                    }
                }
            } catch (\Throwable $e) {
                $this->warn('Migrator (artisan): lock attempt error: '.$e->getMessage());
            }
            $this->info('Migrator (artisan): waiting for lock... ('.($i + 1)."/{$tries})");
            sleep($sleep);
        }

        if (! $acquired) {
            $this->error('Migrator (artisan): could not acquire lock after retries; exiting');

            return 1;
        }

        // Force safe/local drivers to avoid runtime dependencies like Redis during
        // migrations/seeding in ephemeral migrator containers.
        try {
            Config::set('cache.default', 'file');
            Config::set('queue.default', 'sync');
            Config::set('session.driver', 'file');
            Config::set('broadcast.default', 'log');
        } catch (\Throwable $e) {
            // ignore if config can't be set for some reason
        }

        try {
            $this->info('Migrator (artisan): running migrations');
            Artisan::call('migrate', ['--force' => true]);
            $this->info(trim(Artisan::output()));

            $this->info('Migrator (artisan): running seeders');
            Artisan::call('db:seed', ['--force' => true]);
            $this->info(trim(Artisan::output()));

            // Ensure migration_metadata exists and upsert marker
            try {
                DB::statement('CREATE TABLE IF NOT EXISTS migration_metadata (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    marker_key VARCHAR(191) UNIQUE,
                    marker_value TEXT,
                    ran_by VARCHAR(191),
                    ran_at TIMESTAMP NULL DEFAULT NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
            } catch (\Throwable $e) {
                $this->warn('Migrator (artisan): could not ensure migration_metadata table: '.$e->getMessage());
            }

            $now = Carbon::now()->toIso8601String();
            $ranBy = getenv('USER') ?: getenv('USERNAME') ?: php_uname('n');
            DB::table('migration_metadata')->updateOrInsert(
                ['marker_key' => $markerKey],
                [
                    'marker_value' => $now,
                    'ran_by' => $ranBy,
                    'ran_at' => Carbon::now(),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $this->info('Migrator (artisan): marking migrations done in DB');
        } catch (\Throwable $e) {
            $this->error('Migrator (artisan): error during migrate/seed: '.$e->getMessage());
            // Attempt to release lock before exiting
            try {
                DB::select('SELECT RELEASE_LOCK(?)', [$lockName]);
            } catch (\Throwable $e2) {
                // ignore
            }

            return 1;
        }

        // Release lock
        try {
            DB::select('SELECT RELEASE_LOCK(?)', [$lockName]);
        } catch (\Throwable $e) {
            $this->warn('Migrator (artisan): could not release lock: '.$e->getMessage());
        }

        $this->info('Migrator (artisan): finished');

        return 0;
    }
}

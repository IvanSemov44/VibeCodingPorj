<?php

namespace App\Console\Commands;

use App\Enums\ToolStatus;
use App\Models\Category;
use App\Models\Tool;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class WarmCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm commonly used caches (categories, tags, roles, tools)';

    public function handle(): int
    {
        $this->info('Warming caches...');

        try {
            $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
            $cacheService = app(\App\Services\CacheService::class);
            if ($cacheService->putWithTags(['meta', 'categories'], 'list', $categories, 3600)) {
                $this->info('Cached categories');
            } else {
                $this->info('Cached categories (fallback)');
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache categories: '.$e->getMessage());
        }

        // Try to cache tags if model exists
        try {
            if (class_exists('\App\\Models\\Tag')) {
                $tags = \App\Models\Tag::orderBy('name')->get();
                try {
                    $cacheService = app(\App\Services\CacheService::class);
                    $cacheService->putWithTags(['meta', 'tags'], 'list', $tags, 3600);
                    $this->info('Cached tags');
                } catch (\Throwable $e) {
                    $cacheService = app(\App\Services\CacheService::class);
                    $cacheService->putWithTags(['meta', 'tags'], 'list', $tags, 3600);
                    $this->info('Cached tags (fallback)');
                }
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache tags: '.$e->getMessage());
        }

        // Try to cache roles if Spatie is available
        try {
            if (class_exists('\Spatie\\Permission\\Models\\Role')) {
                $roles = \Spatie\Permission\Models\Role::all();
                try {
                    $cacheService = app(\App\Services\CacheService::class);
                    $cacheService->putWithTags(['meta', 'roles'], 'list', $roles, 3600);
                    $this->info('Cached roles');
                } catch (\Throwable $e) {
                    $cacheService = app(\App\Services\CacheService::class);
                    $cacheService->putWithTags(['meta', 'roles'], 'list', $roles, 3600);
                    $this->info('Cached roles (fallback)');
                }
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache roles: '.$e->getMessage());
        }

        // Cache first page of approved tools (default per-page 20)
        try {
            $tools = Tool::where('status', ToolStatus::APPROVED->value)->withRelations()->orderBy('name')->paginate(20);
            try {
                $cacheService = app(\App\Services\CacheService::class);
                if ($cacheService->putWithTags(['tools'], 'tools.approved.page.1.perpage.20', $tools, 300)) {
                    $this->info('Cached tools page 1');
                } else {
                    $cacheService->putWithTags(['tools'], 'tools.approved.page.1.perpage.20', $tools, 300);
                    $this->info('Cached tools page 1 (fallback)');
                }
            } catch (\Throwable $e) {
                $cacheService = app(\App\Services\CacheService::class);
                $cacheService->putWithTags(['tools'], 'tools.approved.page.1.perpage.20', $tools, 300);
                $this->info('Cached tools page 1 (fallback)');
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache tools: '.$e->getMessage());
        }

        $this->info('Cache warm complete.');

        return 0;
    }
}

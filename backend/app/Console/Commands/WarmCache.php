<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use App\Models\Category;
use App\Models\Tool;
use App\Enums\ToolStatus;

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
            try {
                if (method_exists(Cache::getStore(), 'tags')) {
                    Cache::tags(['meta', 'categories'])->put('list', $categories, 3600);
                } else {
                    Cache::put('categories', $categories, 3600);
                }
                $this->info('Cached categories');
            } catch (\Throwable $e) {
                Cache::put('categories', $categories, 3600);
                $this->info('Cached categories (fallback)');
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache categories: ' . $e->getMessage());
        }

        // Try to cache tags if model exists
        try {
            if (class_exists('\App\\Models\\Tag')) {
                $tags = \App\Models\Tag::orderBy('name')->get();
                try {
                    if (method_exists(Cache::getStore(), 'tags')) {
                        Cache::tags(['meta', 'tags'])->put('list', $tags, 3600);
                    } else {
                        Cache::put('tags', $tags, 3600);
                    }
                    $this->info('Cached tags');
                } catch (\Throwable $e) {
                    Cache::put('tags', $tags, 3600);
                    $this->info('Cached tags (fallback)');
                }
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache tags: ' . $e->getMessage());
        }

        // Try to cache roles if Spatie is available
        try {
            if (class_exists('\Spatie\\Permission\\Models\\Role')) {
                $roles = \Spatie\Permission\Models\Role::all();
                try {
                    if (method_exists(Cache::getStore(), 'tags')) {
                        Cache::tags(['meta', 'roles'])->put('list', $roles, 3600);
                    } else {
                        Cache::put('roles', $roles, 3600);
                    }
                    $this->info('Cached roles');
                } catch (\Throwable $e) {
                    Cache::put('roles', $roles, 3600);
                    $this->info('Cached roles (fallback)');
                }
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache roles: ' . $e->getMessage());
        }

        // Cache first page of approved tools (default per-page 20)
        try {
            $tools = Tool::where('status', ToolStatus::APPROVED->value)->withRelations()->orderBy('name')->paginate(20);
            try {
                if (method_exists(Cache::getStore(), 'tags')) {
                    Cache::tags(['tools'])->put('page.1.perpage.20', $tools, 300);
                } else {
                    Cache::put('tools.approved.page.1.perpage.20', $tools, 300);
                }
                $this->info('Cached tools page 1');
            } catch (\Throwable $e) {
                Cache::put('tools.approved.page.1.perpage.20', $tools, 300);
                $this->info('Cached tools page 1 (fallback)');
            }
        } catch (\Throwable $e) {
            $this->warn('Failed to cache tools: ' . $e->getMessage());
        }

        $this->info('Cache warm complete.');

        return 0;
    }
}

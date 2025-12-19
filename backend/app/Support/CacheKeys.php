<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Centralized cache key definitions for the application.
 * Using constants ensures consistency and makes keys easy to find and manage.
 */
final class CacheKeys
{
    /**
     * Cache key for tools listing (paginated).
     */
    public static function tools(int $page = 1, int $perPage = 20): string
    {
        return "tools.approved.page.{$page}.perpage.{$perPage}";
    }

    /**
     * Cache key for single tool detail.
     */
    public static function tool(int $id): string
    {
        return "tool.{$id}";
    }

    /**
     * Cache key for all categories.
     */
    public static function categories(): string
    {
        return 'categories.all';
    }

    /**
     * Cache key for all tags.
     */
    public static function tags(): string
    {
        return 'tags.all';
    }

    /**
     * Cache key for all roles.
     */
    public static function roles(): string
    {
        return 'roles.all';
    }

    /**
     * Cache key for user permissions.
     */
    public static function userPermissions(int $userId): string
    {
        return "user.{$userId}.permissions";
    }

    /**
     * Cache key for user roles.
     */
    public static function userRoles(int $userId): string
    {
        return "user.{$userId}.roles";
    }

    /**
     * Cache key for analytics dashboard data.
     */
    public static function analytics(string $period): string
    {
        return "analytics.dashboard.period.{$period}";
    }

    /**
     * Cache key for tool analytics.
     */
    public static function toolAnalytics(int $toolId, string $period): string
    {
        return "analytics.tool.{$toolId}.period.{$period}";
    }

    /**
     * Cache key for admin statistics.
     */
    public static function adminStats(): string
    {
        return 'admin.stats';
    }

    /**
     * Get all cache tags related to tools.
     *
     * @return array<string>
     */
    public static function toolsTags(): array
    {
        return ['tools', 'tools.list', 'tools.detail'];
    }

    /**
     * Get all cache tags related to categories.
     *
     * @return array<string>
     */
    public static function categoriesTags(): array
    {
        return ['categories', 'taxonomy'];
    }

    /**
     * Get all cache tags related to tags.
     *
     * @return array<string>
     */
    public static function tagsTags(): array
    {
        return ['tags', 'taxonomy'];
    }

    /**
     * Get all cache tags related to analytics.
     *
     * @return array<string>
     */
    public static function analyticsTags(): array
    {
        return ['analytics', 'admin'];
    }
}

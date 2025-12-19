<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SearchLog;
use App\Models\SearchSuggestion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class SearchService
{
    /**
     * Search across all resources.
     *
     * @return array<string, mixed>
     */
    public function search(
        string $query,
        string $type = 'all',
        array $filters = [],
        int $limit = 20,
        int $offset = 0,
    ): array {
        $startTime = microtime(true);

        if (empty(trim($query)) || strlen($query) < 2) {
            return [
                'tools' => [],
                'comments' => [],
                'users' => [],
                'total' => 0,
                'response_time_ms' => 0,
                'query' => $query,
            ];
        }

        $results = [];

        if ($type === 'all' || $type === 'tools') {
            $results['tools'] = $this->searchTools($query, $filters, $limit, $offset);
        }

        if ($type === 'all' || $type === 'comments') {
            $results['comments'] = $this->searchComments($query, $filters, $limit, $offset);
        }

        if ($type === 'all' || $type === 'users') {
            $results['users'] = $this->searchUsers($query, $filters, $limit, $offset);
        }

        $responseTime = (microtime(true) - $startTime) * 1000;

        $total = array_sum(array_map('count', $results));

        // Update suggestions
        $this->updateSuggestions($query, $type, $total);

        // Log search
        $this->logSearch($query, $type, $total, $responseTime);

        return [
            ...$results,
            'total' => $total,
            'response_time_ms' => round($responseTime, 2),
            'query' => $query,
        ];
    }

    /**
     * Search tools by name and description.
     *
     * @return array<int, mixed>
     */
    private function searchTools(string $query, array $filters, int $limit, int $offset): array
    {
        $query_param = '%' . $query . '%';

        $toolsQuery = DB::table('tools')
            ->where('name', 'like', $query_param)
            ->orWhere('description', 'like', $query_param)
            ->where('status', 'published');

        // Apply filters
        if (!empty($filters['category_id'])) {
            $toolsQuery->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['tags'])) {
            $toolsQuery->whereIn('id', function ($q) use ($filters) {
                $q->select('tool_id')
                    ->from('tool_tags')
                    ->whereIn('tag_id', (array) $filters['tags']);
            });
        }

        if (!empty($filters['min_rating'])) {
            $toolsQuery->where('average_rating', '>=', $filters['min_rating']);
        }

        return $toolsQuery
            ->select('id', 'name', 'slug', 'description', 'average_rating', 'thumbnail_url')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->toArray();
    }

    /**
     * Search comments by content.
     *
     * @return array<int, mixed>
     */
    private function searchComments(string $query, array $filters, int $limit, int $offset): array
    {
        $query_param = '%' . $query . '%';

        $commentsQuery = DB::table('comments')
            ->where('content', 'like', $query_param)
            ->where('status', 'approved');

        // Apply tool filter if provided
        if (!empty($filters['tool_id'])) {
            $commentsQuery->where('tool_id', $filters['tool_id']);
        }

        return $commentsQuery
            ->select('id', 'content', 'tool_id', 'user_id', 'created_at')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->toArray();
    }

    /**
     * Search users by name and bio.
     *
     * @return array<int, mixed>
     */
    private function searchUsers(string $query, array $filters, int $limit, int $offset): array
    {
        $query_param = '%' . $query . '%';

        return DB::table('users')
            ->where('name', 'like', $query_param)
            ->orWhere('bio', 'like', $query_param)
            ->where('is_active', true)
            ->select('id', 'name', 'bio', 'avatar_url')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->toArray();
    }

    /**
     * Get search suggestions for autocomplete.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getSuggestions(string $prefix, int $limit = 10): array
    {
        return SearchSuggestion::where('keyword', 'like', $prefix . '%')
            ->where('is_active', true)
            ->orderByDesc('popularity_score')
            ->limit($limit)
            ->select('keyword', 'type', 'popularity_score')
            ->get()
            ->toArray();
    }

    /**
     * Get trending searches.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getTrendingSearches(int $limit = 10, int $days = 7): array
    {
        return SearchLog::where('created_at', '>=', now()->subDays($days))
            ->selectRaw('LOWER(query) as query, COUNT(*) as count')
            ->groupBy(DB::raw('LOWER(query)'))
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get popular keywords for a specific type.
     *
     * @return Collection<int, SearchSuggestion>
     */
    public function getPopularKeywords(string $type = 'tool', int $limit = 15): Collection
    {
        return SearchSuggestion::where('type', $type)
            ->where('is_active', true)
            ->orderByDesc('popularity_score')
            ->limit($limit)
            ->get();
    }

    /**
     * Update or create search suggestions.
     */
    private function updateSuggestions(string $query, string $type, int $resultCount): void
    {
        if ($resultCount === 0) {
            return;
        }

        $keyword = Str::lower(trim($query));

        $suggestion = SearchSuggestion::firstOrCreate(
            ['keyword' => $keyword],
            [
                'type' => $type === 'all' ? 'tool' : $type,
                'search_count' => 0,
            ]
        );

        $suggestion->incrementSearchCount();
    }

    /**
     * Log search query for analytics.
     */
    private function logSearch(string $query, string $type, int $resultCount, float $responseTime): void
    {
        SearchLog::create([
            'user_id' => auth()->id(),
            'query' => $query,
            'search_type' => $type,
            'results_count' => $resultCount,
            'response_time_ms' => $responseTime,
            'ip_address' => request()->ip() ?? '0.0.0.0',
            'user_agent' => request()->userAgent(),
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService,
    ) {}

    /**
     * Search across all resources.
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:255',
            'type' => 'in:all,tools,comments,users',
            'category_id' => 'integer|exists:categories,id',
            'tags' => 'array',
            'tags.*' => 'integer|exists:tags,id',
            'min_rating' => 'numeric|min:0|max:5',
            'limit' => 'integer|min:1|max:100',
            'offset' => 'integer|min:0',
        ]);

        $results = $this->searchService->search(
            query: $validated['q'],
            type: $validated['type'] ?? 'all',
            filters: array_filter([
                'category_id' => $validated['category_id'] ?? null,
                'tags' => $validated['tags'] ?? null,
                'min_rating' => $validated['min_rating'] ?? null,
            ]),
            limit: $validated['limit'] ?? 20,
            offset: $validated['offset'] ?? 0,
        );

        return response()->json([
            'data' => $results,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get search suggestions for autocomplete.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:255',
            'limit' => 'integer|min:1|max:20',
        ]);

        $suggestions = $this->searchService->getSuggestions(
            prefix: $validated['q'],
            limit: $validated['limit'] ?? 10,
        );

        return response()->json([
            'data' => $suggestions,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get trending searches.
     */
    public function trending(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => 'integer|min:1|max:30',
            'days' => 'integer|min:1|max:90',
        ]);

        $trending = $this->searchService->getTrendingSearches(
            limit: $validated['limit'] ?? 10,
            days: $validated['days'] ?? 7,
        );

        return response()->json([
            'data' => $trending,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get popular keywords.
     */
    public function popular(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'in:tool,category,tag,user',
            'limit' => 'integer|min:1|max:30',
        ]);

        $keywords = $this->searchService->getPopularKeywords(
            type: $validated['type'] ?? 'tool',
            limit: $validated['limit'] ?? 15,
        );

        return response()->json([
            'data' => $keywords,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Tool\ApproveToolAction;
use App\Actions\Tool\RejectToolAction;
use App\DataTransferObjects\ToolData;
use App\Enums\ToolStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use App\Services\CacheService;
use App\Services\ToolService;
use App\Traits\HandlesServiceErrors;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

final class ToolController extends Controller
{
    use HandlesServiceErrors;

    public function __construct(
        private readonly ToolService $toolService,
        private readonly CacheService $cacheService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        // No-op: instrumentation removed. Defer choosing relations until we
        // know whether this is a search request (we load a smaller set for
        // searches to reduce DB queries and payload size).
        $query = Tool::query();

        if ($q = $request->query('q')) {
            $query->search($q);
        }

        if ($category = $request->query('category')) {
            $query->whereHas('categories', fn ($q2) => $q2->where('slug', $category)->orWhere('name', $category));
        }

        if ($role = $request->query('role')) {
            $query->whereHas('roles', fn ($r) => $r->where('name', $role));
        }

        // Allow filtering by status (approved, pending, rejected)
        if ($status = $request->query('status')) {
            $allowed = [
                ToolStatus::APPROVED->value,
                ToolStatus::PENDING->value,
                ToolStatus::REJECTED->value,
            ];
            if (in_array($status, $allowed, true)) {
                $query->where('status', $status);
            }
        }

        // Support single `tag` or comma-separated `tags` parameter for filtering
        if ($tag = $request->query('tag')) {
            $query->whereHas('tags', fn ($t) => $t->where('slug', $tag)->orWhere('name', $tag));
        }

        if ($tags = $request->query('tags')) {
            $arr = array_filter(array_map('trim', explode(',', $tags)));
            if (! empty($arr)) {
                $query->whereHas('tags', function ($q) use ($arr) {
                    $q->whereIn('slug', $arr)->orWhereIn('name', $arr);
                });
            }
        }

        // Allow client to request larger pages for listing (cap at configured max)
        $perPage = (int) $request->query('per_page', config('app.pagination.default_per_page', 20));
        if ($perPage < 1) {
            $perPage = config('app.pagination.default_per_page', 20);
        }
        $perPage = min(config('app.pagination.max_per_page', 100), $perPage);

        // Only cache when no filters are applied (pagination-only is ok)
        $queryParams = $request->query();
        $filterKeys = array_diff(array_keys($queryParams), ['page', 'per_page']);
        if (empty($filterKeys)) {
            $page = (int) $request->query('page', 1);
            // Only cache the default first page with default size to keep invalidation simple
            $defaultPerPage = config('app.pagination.default_per_page', 20);
            if ($perPage === $defaultPerPage && $page === 1) {
                $cacheKey = "tools.approved.page.{$page}.perpage.{$perPage}";
                try {
                    $tools = $this->cacheService->rememberWithTags(['tools'], $cacheKey, function () use ($query, $perPage) {
                        return $query->orderBy('name')->paginate($perPage);
                    }, config('app.cache_ttl.dynamic_queries', 300));
                } catch (\Throwable $e) {
                    logger()->warning('Cache read failed, falling back to DB: '.$e->getMessage());
                    $tools = $query->orderBy('name')->paginate($perPage);
                }

                return ToolResource::collection($tools);
            }
        }

        $isSearch = (bool) $request->query('q');

        // Choose a lean eager-loading strategy for searches to reduce the
        // number of relation queries and response payload. For non-search
        // listing we keep the full relation set.
        if ($isSearch) {
            $query = $query->withRelationsForSearch();
            // Use simplePaginate for search to avoid expensive count queries
            $tools = $query->orderBy('name')->simplePaginate($perPage);
        } else {
            $query = $query->withRelations();
            $tools = $query->orderBy('name')->paginate($perPage);
        }

        return ToolResource::collection($tools);
    }

    public function show(Tool $tool): ToolResource
    {
        $tool->load(['categories', 'tags', 'roles', 'userRating']);

        return new ToolResource($tool);
    }

    public function store(StoreToolRequest $request): ToolResource
    {
        $toolData = ToolData::fromRequest($request->validated());

        $tool = $this->toolService->create($toolData, $request->user());

        $this->handleCacheOperation(
            fn () => $this->cacheService->invalidateToolCaches(),
            'invalidate after tool creation'
        );

        return new ToolResource($tool);
    }

    public function update(UpdateToolRequest $request, Tool $tool): ToolResource
    {
        $toolData = ToolData::fromRequest($request->validated());

        $tool = $this->toolService->update($tool, $toolData, $request->user());

        $this->handleCacheOperation(
            fn () => $this->cacheService->invalidateToolCaches(),
            'invalidate after tool update'
        );

        return new ToolResource($tool);
    }

    public function destroy(Request $request, Tool $tool): Response
    {
        $this->authorize('delete', $tool);

        $this->toolService->delete($tool, $request->user());

        $this->handleCacheOperation(
            fn () => $this->cacheService->invalidateToolCaches(),
            'invalidate after tool deletion'
        );

        return response()->noContent();
    }

    public function approve(Tool $tool, ApproveToolAction $action): JsonResponse
    {
        $this->authorize('update', $tool);

        $approved = $action->execute($tool, request()->user());

        // Log activity and invalidate cache
        $this->handleActivityLog(
            fn () => \App\Models\Activity::create([
                'subject_type' => get_class($approved),
                'subject_id' => $approved->id,
                'action' => 'approved',
                'user_id' => request()->user()?->id,
                'meta' => ['title' => $approved->name ?? null],
                'created_at' => now(),
            ]),
            'tool approval'
        );

        $this->handleCacheOperation(
            fn () => $this->cacheService->invalidateToolCaches(),
            'invalidate after tool approval'
        );

        return response()->json([
            'message' => 'Tool approved successfully',
            'data' => new ToolResource($approved->fresh()),
        ]);
    }

    public function reject(Tool $tool, Request $request, RejectToolAction $action): JsonResponse
    {
        $this->authorize('update', $tool);

        $reason = $request->input('reason');

        $rejected = $action->execute($tool, $request->user(), $reason);

        $this->handleActivityLog(
            fn () => \App\Models\Activity::create([
                'subject_type' => get_class($rejected),
                'subject_id' => $rejected->id,
                'action' => 'rejected',
                'user_id' => $request->user()?->id,
                'meta' => ['title' => $rejected->name ?? null, 'reason' => $reason],
                'created_at' => now(),
            ]),
            'tool rejection'
        );

        $this->handleCacheOperation(
            fn () => $this->cacheService->invalidateToolCaches(),
            'invalidate after tool rejection'
        );

        return response()->json([
            'message' => 'Tool rejected',
            'data' => new ToolResource($rejected),
        ]);
    }

    public function pending(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Tool::class);

        $tools = Tool::where('status', ToolStatus::PENDING->value)
            ->withRelations()
            ->orderBy('created_at', 'desc')
            ->paginate(config('app.pagination.default_per_page', 20));

        return ToolResource::collection($tools);
    }
}

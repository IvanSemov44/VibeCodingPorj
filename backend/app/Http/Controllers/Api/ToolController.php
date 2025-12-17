<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ToolData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use App\Services\ToolService;
use App\Actions\Tool\ApproveToolAction;
use App\Actions\Tool\RejectToolAction;
use App\Enums\ToolStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

final class ToolController extends Controller
{
    public function __construct(
        private readonly ToolService $toolService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Tool::query()->withRelations();

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

        // Allow client to request larger pages for listing (cap at 100)
        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) {
            $perPage = 20;
        }
        $perPage = min(100, $perPage);

        // Only cache when no filters are applied (pagination-only is ok)
        $queryParams = $request->query();
        $filterKeys = array_diff(array_keys($queryParams), ['page', 'per_page']);
        if (empty($filterKeys)) {
            $page = (int) $request->query('page', 1);
            // Only cache the default first page with default size to keep invalidation simple
            if ($perPage === 20 && $page === 1) {
                $cacheKey = "tools.approved.page.{$page}.perpage.{$perPage}";
                try {
                    if (method_exists(Cache::getStore(), 'tags')) {
                        $tools = Cache::tags(['tools'])->remember($cacheKey, 300, function () use ($query, $perPage) {
                            return $query->orderBy('name')->paginate($perPage);
                        });
                    } else {
                        $tools = Cache::remember($cacheKey, 300, function () use ($query, $perPage) {
                            return $query->orderBy('name')->paginate($perPage);
                        });
                    }
                } catch (\Throwable $e) {
                    logger()->warning('Cache tags check failed, falling back to key cache: ' . $e->getMessage());
                    $tools = Cache::remember($cacheKey, 300, function () use ($query, $perPage) {
                        return $query->orderBy('name')->paginate($perPage);
                    });
                }

                return ToolResource::collection($tools);
            }
        }

        $tools = $query->orderBy('name')->paginate($perPage);

        return ToolResource::collection($tools);
    }

    public function show(Tool $tool): ToolResource
    {
        $tool->load(['categories', 'tags', 'roles']);

        return new ToolResource($tool);
    }

    public function store(StoreToolRequest $request): ToolResource
    {
        $toolData = ToolData::fromRequest($request->validated());

        $tool = $this->toolService->create($toolData, $request->user());

        try {
            if (method_exists(Cache::getStore(), 'tags')) {
                Cache::tags(['tools'])->flush();
            } else {
                for ($i = 1; $i <= 5; $i++) {
                    Cache::forget("tools.approved.page.{$i}.perpage.20");
                }
            }
        } catch (\Throwable $e) {
            logger()->warning('Failed to invalidate tools cache: ' . $e->getMessage());
        }

        return new ToolResource($tool);
    }

    public function update(UpdateToolRequest $request, Tool $tool): ToolResource
    {
        $toolData = ToolData::fromRequest($request->validated());

        $tool = $this->toolService->update($tool, $toolData, $request->user());

        try {
            if (method_exists(Cache::getStore(), 'tags')) {
                Cache::tags(['tools'])->flush();
            } else {
                for ($i = 1; $i <= 5; $i++) {
                    Cache::forget("tools.approved.page.{$i}.perpage.20");
                }
            }
        } catch (\Throwable $e) {
            logger()->warning('Failed to invalidate tools cache: ' . $e->getMessage());
        }

        return new ToolResource($tool);
    }

    public function destroy(Request $request, Tool $tool): Response
    {
        $this->authorize('delete', $tool);

        $this->toolService->delete($tool, $request->user());

        try {
            if (method_exists(Cache::getStore(), 'tags')) {
                Cache::tags(['tools'])->flush();
            } else {
                for ($i = 1; $i <= 5; $i++) {
                    Cache::forget("tools.approved.page.{$i}.perpage.20");
                }
            }
        } catch (\Throwable $e) {
            logger()->warning('Failed to invalidate tools cache: ' . $e->getMessage());
        }

        return response()->noContent();
    }

    public function approve(Tool $tool, ApproveToolAction $action): JsonResponse
    {
        $this->authorize('update', $tool);

        $approved = $action->execute($tool, request()->user());

        // Log lightweight activity for admin dashboard
        try {
            \App\Models\Activity::create([
                'subject_type' => get_class($approved),
                'subject_id' => $approved->id,
                'action' => 'approved',
                'user_id' => request()->user()?->id,
                'meta' => ['title' => $approved->name ?? null],
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            logger()->warning('Failed to create activity for tool approval: ' . $e->getMessage());
        }

        // Invalidate cached tool lists
        for ($i = 1; $i <= 5; $i++) {
            Cache::forget("tools.approved.page.{$i}.perpage.20");
        }

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

        try {
            \App\Models\Activity::create([
                'subject_type' => get_class($rejected),
                'subject_id' => $rejected->id,
                'action' => 'rejected',
                'user_id' => $request->user()?->id,
                'meta' => ['title' => $rejected->name ?? null, 'reason' => $reason],
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            logger()->warning('Failed to create activity for tool rejection: ' . $e->getMessage());
        }

        // Invalidate cached tool lists
        for ($i = 1; $i <= 5; $i++) {
            Cache::forget("tools.approved.page.{$i}.perpage.20");
        }

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
            ->paginate(20);

        return ToolResource::collection($tools);
    }
}

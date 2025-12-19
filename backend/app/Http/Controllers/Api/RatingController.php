<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\RatingData;
use App\Http\Requests\StoreRatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\Rating;
use App\Models\Tool;
use App\Services\RatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class RatingController
{
    public function __construct(
        private RatingService $service,
    ) {}

    /**
     * Display all ratings for a tool.
     *
     * @param Tool $tool
     * @return AnonymousResourceCollection
     */
    public function index(Tool $tool): AnonymousResourceCollection
    {
        $ratings = $tool->ratings()
            ->with('user')
            ->latest()
            ->paginate(15);

        return RatingResource::collection($ratings);
    }

    /**
     * Store a new rating or update existing.
     *
     * @param Tool $tool
     * @param StoreRatingRequest $request
     * @return JsonResponse
     */
    public function store(
        Tool $tool,
        StoreRatingRequest $request
    ): JsonResponse {
        $this->authorize('create', Rating::class);

        $data = RatingData::fromRequest(array_merge(
            $request->validated(),
            ['tool_id' => $tool->id, 'user_id' => auth()->id()]
        ));

        $rating = $this->service->create($data, auth()->user());

        return response()->json(
            new RatingResource($rating),
            201
        );
    }

    /**
     * Display ratings summary.
     *
     * @param Tool $tool
     * @return JsonResponse
     */
    public function summary(Tool $tool): JsonResponse
    {
        $breakdown = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];

        $ratings = $tool->ratings()
            ->selectRaw('score, COUNT(*) as count')
            ->groupBy('score')
            ->get();

        foreach ($ratings as $rating) {
            $breakdown[$rating->score] = $rating->count;
        }

        return response()->json([
            'average' => $tool->average_rating,
            'count' => $tool->ratings()->count(),
            'breakdown' => $breakdown,
        ]);
    }

    /**
     * Delete a rating.
     *
     * @param Rating $rating
     * @return JsonResponse
     */
    public function destroy(Rating $rating): JsonResponse
    {
        $this->authorize('delete', $rating);

        $this->service->delete($rating, auth()->user());

        return response()->json(null, 204);
    }
}

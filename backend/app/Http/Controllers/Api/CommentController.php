<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CommentData;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Requests\ModerateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Tool;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class CommentController
{
    public function __construct(
        private CommentService $service,
    ) {}

    /**
     * Display all comments for a tool.
     *
     * @param Tool $tool
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(
        Tool $tool,
        Request $request
    ): AnonymousResourceCollection {
        $comments = $tool->comments()
            ->where('is_moderated', true)
            ->with('user', 'replies')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return CommentResource::collection($comments);
    }

    /**
     * Store a newly created comment.
     *
     * @param Tool $tool
     * @param StoreCommentRequest $request
     * @return JsonResponse
     */
    public function store(
        Tool $tool,
        StoreCommentRequest $request
    ): JsonResponse {
        $this->authorize('create', Comment::class);

        $data = CommentData::fromRequest(array_merge(
            $request->validated(),
            ['tool_id' => $tool->id]
        ));

        $comment = $this->service->create($data, auth()->user());

        return response()->json(
            new CommentResource($comment->load('user')),
            201
        );
    }

    /**
     * Display the specified comment.
     *
     * @param Comment $comment
     * @return CommentResource
     */
    public function show(Comment $comment): CommentResource
    {
        $this->authorize('view', $comment);

        return new CommentResource(
            $comment->load('user', 'tool', 'replies')
        );
    }

    /**
     * Update the specified comment.
     *
     * @param Comment $comment
     * @param UpdateCommentRequest $request
     * @return CommentResource
     */
    public function update(
        Comment $comment,
        UpdateCommentRequest $request
    ): CommentResource {
        $this->authorize('update', $comment);

        $data = CommentData::fromRequest($request->validated());
        $updated = $this->service->create($data, auth()->user());

        return new CommentResource($updated);
    }

    /**
     * Delete the specified comment.
     *
     * @param Comment $comment
     * @return JsonResponse
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $this->service->delete($comment, auth()->user());

        return response()->json(null, 204);
    }

    /**
     * Moderate a comment (approve/reject).
     *
     * @param Comment $comment
     * @param ModerateCommentRequest $request
     * @return CommentResource
     */
    public function moderate(
        Comment $comment,
        ModerateCommentRequest $request
    ): CommentResource {
        $this->authorize('moderate', Comment::class);

        $approved = $request->boolean('approved');
        $moderated = $this->service->moderate(
            $comment,
            $approved,
            auth()->user()
        );

        return new CommentResource($moderated);
    }
}

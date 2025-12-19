<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\DataTransferObjects\UserRoleData;
use App\Http\Requests\BanUserRequest;
use App\Http\Requests\SetUserRolesRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class UserController
{
    public function __construct(
        private UserService $service,
    ) {}

    /**
     * Display all users.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->with('roles')
            ->when($request->input('search'), fn ($q) =>
                $q->where('name', 'like', '%'.$request->input('search').'%')
                  ->orWhere('email', 'like', '%'.$request->input('search').'%')
            )
            ->when($request->input('banned'), fn ($q) =>
                $q->where('is_banned', $request->boolean('banned'))
            )
            ->latest()
            ->paginate($request->input('per_page', 15));

        return UserResource::collection($users);
    }

    /**
     * Display the specified user.
     *
     * @param User $user
     * @return UserResource
     */
    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        return new UserResource($user->load('roles'));
    }

    /**
     * Ban a user.
     *
     * @param User $user
     * @param BanUserRequest $request
     * @return JsonResponse
     */
    public function ban(User $user, BanUserRequest $request): JsonResponse
    {
        $this->authorize('ban', User::class);

        $banned = $this->service->ban(
            $user,
            $request->input('reason'),
            $request->input('duration', 'permanent'),
            auth()->user()
        );

        return response()->json([
            'message' => 'User banned successfully.',
            'data' => new UserResource($banned),
        ]);
    }

    /**
     * Unban a user.
     *
     * @param User $user
     * @return JsonResponse
     */
    public function unban(User $user): JsonResponse
    {
        $this->authorize('unban', User::class);

        $unbanned = $this->service->unban($user, auth()->user());

        return response()->json([
            'message' => 'User unbanned successfully.',
            'data' => new UserResource($unbanned),
        ]);
    }

    /**
     * Set user roles.
     *
     * @param User $user
     * @param SetUserRolesRequest $request
     * @return UserResource
     */
    public function setRoles(User $user, SetUserRolesRequest $request): UserResource
    {
        $this->authorize('setRoles', User::class);

        $data = UserRoleData::fromRequest(array_merge(
            $request->validated(),
            ['user_id' => $user->id]
        ));

        $updated = $this->service->setRoles($data, auth()->user());

        return new UserResource($updated->load('roles'));
    }

    /**
     * Delete a user.
     *
     * @param User $user
     * @return JsonResponse
     */
    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->service->delete($user, auth()->user());

        return response()->json(null, 204);
    }
}

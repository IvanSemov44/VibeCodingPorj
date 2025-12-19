<?php

declare(strict_types=1);

namespace Tests\Traits;

use App\Models\User;
use Illuminate\Foundation\Testing\Concerns\InteractsWithAuthentication;

/**
 * Helper trait for user management in tests.
 */
trait CreatesUsers
{
    use InteractsWithAuthentication;

    /**
     * Create a single user with optional attributes.
     *
     * @param array<string, mixed> $attributes
     * @return User
     */
    protected function createUser(array $attributes = []): User
    {
        return User::factory()->create($attributes);
    }

    /**
     * Create multiple users.
     *
     * @param int $count
     * @param array<string, mixed> $attributes
     * @return \Illuminate\Database\Eloquent\Collection<int, User>
     */
    protected function createUsers(int $count = 3, array $attributes = [])
    {
        return User::factory()->count($count)->create($attributes);
    }

    /**
     * Create a user and authenticate them.
     *
     * @param array<string, mixed> $attributes
     * @return User
     */
    protected function createAndAuthenticateUser(array $attributes = []): User
    {
        $user = $this->createUser($attributes);
        $this->actingAs($user);
        return $user;
    }

    /**
     * Create an admin user.
     *
     * @param array<string, mixed> $attributes
     * @return User
     */
    protected function createAdminUser(array $attributes = []): User
    {
        $user = $this->createUser($attributes);
        $user->assignRole('admin');
        return $user;
    }

    /**
     * Create an admin user and authenticate them.
     *
     * @param array<string, mixed> $attributes
     * @return User
     */
    protected function createAndAuthenticateAdminUser(array $attributes = []): User
    {
        $user = $this->createAdminUser($attributes);
        $this->actingAs($user);
        return $user;
    }

    /**
     * Create an owner user.
     *
     * @param array<string, mixed> $attributes
     * @return User
     */
    protected function createOwnerUser(array $attributes = []): User
    {
        $user = $this->createUser($attributes);
        $user->assignRole('owner');
        return $user;
    }

    /**
     * Create an owner user and authenticate them.
     *
     * @param array<string, mixed> $attributes
     * @return User
     */
    protected function createAndAuthenticateOwnerUser(array $attributes = []): User
    {
        $user = $this->createOwnerUser($attributes);
        $this->actingAs($user);
        return $user;
    }
}

<?php

namespace Tests\Unit\Policies;

use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_their_own_profile(): void
    {
        $user = User::factory()->create();
        $policy = new UserPolicy();

        $this->assertTrue($policy->update($user, $user));
    }

    public function test_user_cannot_update_other_user_profile(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $policy = new UserPolicy();

        $this->assertFalse($policy->update($user, $other));
    }
}

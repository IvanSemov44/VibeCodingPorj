<?php

namespace Tests\Unit\Policies;

use App\Models\Tool;
use App\Models\User;
use App\Policies\ToolPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_view_update_and_delete_tool(): void
    {
        $owner = User::factory()->create();
        $tool = Tool::factory()->make(['user_id' => $owner->id]);

        $policy = new ToolPolicy();

        $this->assertTrue($policy->view($owner, $tool));
        $this->assertTrue($policy->update($owner, $tool));
        $this->assertTrue($policy->delete($owner, $tool));
    }

    public function test_non_owner_cannot_update_or_delete_tool(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $tool = Tool::factory()->make(['user_id' => $owner->id]);

        $policy = new ToolPolicy();

        $this->assertTrue($policy->view($other, $tool)); // viewing may be allowed
        $this->assertFalse($policy->update($other, $tool));
        $this->assertFalse($policy->delete($other, $tool));
    }
}

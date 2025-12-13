<?php

namespace Tests\Feature\Api;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ToolApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_tools_list(): void
    {
        Tool::factory()->count(3)->create();

        $response = $this->getJson('/api/tools');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }

    public function test_guest_can_view_single_tool(): void
    {
        $tool = Tool::factory()->create();

        $response = $this->getJson("/api/tools/{$tool->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => $tool->id]);
    }

    public function test_authenticated_user_can_create_tool(): void
    {
        $user = User::factory()->create();

        $payload = [
            'name' => 'API Tool',
            'url' => 'https://example.com',
        ];

        $response = $this->actingAs($user)->postJson('/api/tools', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tools', ['name' => 'API Tool']);
    }

    public function test_guest_cannot_create_tool(): void
    {
        $payload = ['name' => 'NoAuth Tool'];

        $response = $this->postJson('/api/tools', $payload);

        $response->assertStatus(401);
    }

    public function test_owner_role_can_update_tool(): void
    {
        $user = User::factory()->create();
        Role::create(['name' => 'owner']);
        $user->assignRole('owner');

        $tool = Tool::factory()->create(['name' => 'Old Name']);

        $payload = ['name' => 'Updated Name'];

        $response = $this->actingAs($user)->putJson("/api/tools/{$tool->id}", $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tools', ['id' => $tool->id, 'name' => 'Updated Name']);
    }

    public function test_user_without_matching_role_cannot_update_tool(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create(['name' => 'Owner Tool']);

        // Tool has role 'dev' but user does not
        $toolRole = Role::create(['name' => 'dev']);
        $tool->roles()->attach($toolRole->id);

        $payload = ['name' => 'Hack Name'];

        $response = $this->actingAs($user)->putJson("/api/tools/{$tool->id}", $payload);

        $response->assertStatus(403);
    }

    public function test_owner_role_can_delete_tool(): void
    {
        $user = User::factory()->create();
        Role::create(['name' => 'owner']);
        $user->assignRole('owner');

        $tool = Tool::factory()->create();

        $response = $this->actingAs($user)->deleteJson("/api/tools/{$tool->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('tools', ['id' => $tool->id]);
    }

    public function test_user_without_matching_role_cannot_delete_tool(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $toolRole = Role::create(['name' => 'dev']);
        $tool->roles()->attach($toolRole->id);

        $response = $this->actingAs($user)->deleteJson("/api/tools/{$tool->id}");

        $response->assertStatus(403);
    }
}

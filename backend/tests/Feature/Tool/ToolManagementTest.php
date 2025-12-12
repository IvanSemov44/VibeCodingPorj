<?php

namespace Tests\Feature\Tool;

use App\Models\Category;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ToolManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'owner']);
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);
    }

    public function test_guest_can_view_tools_list(): void
    {
        Tool::factory()->count(3)->create();

        $response = $this->getJson('/api/tools');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_guest_can_view_single_tool(): void
    {
        $tool = Tool::factory()->create(['name' => 'Test Tool']);

        $response = $this->getJson("/api/tools/{$tool->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Test Tool',
                ],
            ]);
    }

    public function test_authenticated_user_can_create_tool(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/tools', [
                'name' => 'New Tool',
                'description' => 'A new testing tool',
                'url' => 'https://example.com',
                'difficulty' => 'beginner',
                'categories' => [$category->id],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                ],
            ]);

        $this->assertDatabaseHas('tools', [
            'name' => 'New Tool',
            'slug' => 'new-tool',
        ]);
    }

    public function test_guest_cannot_create_tool(): void
    {
        $response = $this->postJson('/api/tools', [
            'name' => 'New Tool',
        ]);

        $response->assertStatus(401);
    }

    public function test_tool_name_must_be_unique(): void
    {
        $user = User::factory()->create();
        Tool::factory()->create(['name' => 'Existing Tool']);

        $response = $this->actingAs($user)
            ->postJson('/api/tools', [
                'name' => 'Existing Tool',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_user_can_update_their_tool(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $response = $this->actingAs($user)
            ->putJson("/api/tools/{$tool->id}", [
                'name' => 'Updated Tool Name',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'name' => 'Updated Tool Name',
        ]);
    }

    public function test_user_can_delete_tool(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/tools/{$tool->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('tools', [
            'id' => $tool->id,
        ]);
    }

    public function test_tools_can_be_filtered_by_category(): void
    {
        $category = Category::factory()->create(['slug' => 'testing']);
        $tool1 = Tool::factory()->create();
        $tool2 = Tool::factory()->create();

        $tool1->categories()->attach($category);

        $response = $this->getJson('/api/tools?category=testing');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_tools_can_be_searched_by_name(): void
    {
        Tool::factory()->create(['name' => 'Docker']);
        Tool::factory()->create(['name' => 'Kubernetes']);
        Tool::factory()->create(['name' => 'Docker Compose']);

        $response = $this->getJson('/api/tools?q=docker');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}

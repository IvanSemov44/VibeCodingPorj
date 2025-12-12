<?php

namespace Tests\Unit\Services;

use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use App\Services\ToolService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ToolService $toolService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->toolService = new ToolService();
    }

    public function test_create_tool_with_basic_data(): void
    {
        $data = [
            'name' => 'Docker',
            'description' => 'Container platform',
            'url' => 'https://docker.com',
        ];

        $tool = $this->toolService->create($data);

        $this->assertInstanceOf(Tool::class, $tool);
        $this->assertEquals('Docker', $tool->name);
        $this->assertEquals('docker', $tool->slug);
    }

    public function test_create_tool_with_tags(): void
    {
        $data = [
            'name' => 'Docker',
            'tags' => ['containerization', 'devops'],
        ];

        $tool = $this->toolService->create($data);

        $this->assertCount(2, $tool->tags);
        $this->assertTrue($tool->tags->contains('name', 'containerization'));
    }

    public function test_resolve_tag_ids_creates_new_tags(): void
    {
        $tagsBefore = Tag::count();

        $data = [
            'name' => 'Test Tool',
            'tags' => ['newtag1', 'newtag2'],
        ];

        $this->toolService->create($data);

        $this->assertEquals($tagsBefore + 2, Tag::count());
        $this->assertDatabaseHas('tags', ['name' => 'newtag1']);
        $this->assertDatabaseHas('tags', ['name' => 'newtag2']);
    }

    public function test_update_tool_changes_slug_when_name_changes(): void
    {
        $tool = Tool::factory()->create(['name' => 'Old Name']);

        $updated = $this->toolService->update($tool, ['name' => 'New Name']);

        $this->assertEquals('New Name', $updated->name);
        $this->assertEquals('new-name', $updated->slug);
    }

    public function test_delete_tool_removes_from_database(): void
    {
        $tool = Tool::factory()->create();
        $toolId = $tool->id;

        $result = $this->toolService->delete($tool);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('tools', ['id' => $toolId]);
    }

    public function test_approve_tool_sets_approval_fields(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $approved = $this->toolService->approve($tool, $user);

        $this->assertEquals('approved', $approved->status);
    }

    public function test_create_tool_logs_activity(): void
    {
        $user = User::factory()->create();

        $this->toolService->create(['name' => 'Test Tool'], $user);

        $this->assertDatabaseHas('activity_log', [
            'description' => 'tool_created',
            'causer_id' => $user->id,
        ]);
    }
}

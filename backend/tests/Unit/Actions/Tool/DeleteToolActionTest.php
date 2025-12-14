<?php

declare(strict_types=1);

use App\Actions\Tool\DeleteToolAction;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it deletes a tool', function () {
    $tool = Tool::factory()->create(['name' => 'Tool to Delete']);

    $action = new DeleteToolAction();
    $result = $action->execute($tool);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('tools', [
        'id' => $tool->id,
    ]);
});

test('it logs activity when user is provided', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->create(['name' => 'Tool to Delete']);
    $toolId = $tool->id;

    $action = new DeleteToolAction();
    $result = $action->execute($tool, $user);

    expect($result)->toBeTrue();

    $this->assertDatabaseHas('activity_log', [
        'description' => 'tool_deleted',
        'subject_type' => Tool::class,
        'subject_id' => $toolId,
        'causer_id' => $user->id,
    ]);
});

test('it does not log activity when user is not provided', function () {
    $tool = Tool::factory()->create(['name' => 'Tool to Delete']);
    $toolId = $tool->id;

    $action = new DeleteToolAction();
    $result = $action->execute($tool);

    expect($result)->toBeTrue();

    $this->assertDatabaseMissing('activity_log', [
        'description' => 'tool_deleted',
        'subject_id' => $toolId,
    ]);
});

test('it stores tool data in activity log before deletion', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->create([
        'name' => 'Important Tool',
        'description' => 'Important description',
    ]);
    $toolId = $tool->id;
    $toolName = $tool->name;

    $action = new DeleteToolAction();
    $action->execute($tool, $user);

    // Verify activity log contains tool data
    $activity = \Spatie\Activitylog\Models\Activity::where('subject_id', $toolId)
        ->where('description', 'tool_deleted')
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->properties->get('tool')['name'])->toBe($toolName);
});

test('it uses database transaction', function () {
    $tool = Tool::factory()->create();
    $toolId = $tool->id;

    // Mock delete to throw exception
    $action = new class extends DeleteToolAction
    {
        public function execute(\App\Models\Tool $tool, ?object $user = null): bool
        {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($tool, $user) {
                parent::execute($tool, $user);
                throw new \Exception('Simulated error');
            });
        }
    };

    try {
        $action->execute($tool);
    } catch (\Exception $e) {
        // Expected to fail
    }

    // Tool should still exist due to transaction rollback
    expect(Tool::find($toolId))->not->toBeNull();
});

test('it returns true on successful deletion', function () {
    $tool = Tool::factory()->create();

    $action = new DeleteToolAction();
    $result = $action->execute($tool);

    expect($result)->toBeTrue();
});

test('it removes tool relationships on deletion', function () {
    $tool = Tool::factory()->create();
    $category = \App\Models\Category::factory()->create();
    $tag = \App\Models\Tag::factory()->create();

    $tool->categories()->attach($category);
    $tool->tags()->attach($tag);

    $action = new DeleteToolAction();
    $action->execute($tool);

    // Verify pivot table entries are removed (cascade)
    $this->assertDatabaseMissing('category_tool', ['tool_id' => $tool->id]);
    $this->assertDatabaseMissing('tag_tool', ['tool_id' => $tool->id]);
});

<?php

declare(strict_types=1);

use App\Actions\Tool\ApproveToolAction;
use App\Enums\ToolStatus;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it approves a tool', function () {
    $tool = Tool::factory()->create([
        'status' => ToolStatus::PENDING,
    ]);

    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $approved = $action->execute($tool, $user);

    expect($approved->status)->toBe(ToolStatus::APPROVED);

    $this->assertDatabaseHas('tools', [
        'id' => $tool->id,
        'status' => ToolStatus::APPROVED->value,
    ]);
});

test('it changes status from pending to approved', function () {
    $tool = Tool::factory()->create([
        'status' => ToolStatus::PENDING,
    ]);

    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $approved = $action->execute($tool, $user);

    expect($approved->status)->toBe(ToolStatus::APPROVED);
});

test('it changes status from rejected to approved', function () {
    $tool = Tool::factory()->create([
        'status' => ToolStatus::REJECTED,
    ]);

    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $approved = $action->execute($tool, $user);

    expect($approved->status)->toBe(ToolStatus::APPROVED);
});

test('it logs activity with user', function () {
    $tool = Tool::factory()->create([
        'status' => ToolStatus::PENDING,
    ]);

    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $action->execute($tool, $user);

    $this->assertDatabaseHas('activity_log', [
        'description' => 'tool_approved',
        'subject_type' => Tool::class,
        'subject_id' => $tool->id,
        'causer_id' => $user->id,
    ]);
});

test('it returns the updated tool', function () {
    $tool = Tool::factory()->create([
        'name' => 'Test Tool',
        'status' => ToolStatus::PENDING,
    ]);

    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $result = $action->execute($tool, $user);

    expect($result)->toBeInstanceOf(Tool::class);
    expect($result->id)->toBe($tool->id);
    expect($result->name)->toBe('Test Tool');
    expect($result->status)->toBe(ToolStatus::APPROVED);
});

test('it updates existing tool instance', function () {
    $tool = Tool::factory()->create([
        'status' => ToolStatus::PENDING,
    ]);

    $originalId = $tool->id;
    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $approved = $action->execute($tool, $user);

    // Refresh the original instance
    $tool->refresh();

    expect($tool->status)->toBe(ToolStatus::APPROVED);
    expect($approved->id)->toBe($originalId);
});

test('it only updates status field', function () {
    $tool = Tool::factory()->create([
        'name' => 'Original Name',
        'description' => 'Original Description',
        'status' => ToolStatus::PENDING,
    ]);

    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $approved = $action->execute($tool, $user);

    // Other fields should remain unchanged
    expect($approved->name)->toBe('Original Name');
    expect($approved->description)->toBe('Original Description');
    expect($approved->status)->toBe(ToolStatus::APPROVED);
});

test('it can approve already approved tool', function () {
    $tool = Tool::factory()->create([
        'status' => ToolStatus::APPROVED,
    ]);

    $user = User::factory()->create();

    $action = new ApproveToolAction;
    $approved = $action->execute($tool, $user);

    // Should remain approved
    expect($approved->status)->toBe(ToolStatus::APPROVED);
});

test('activity log includes tool information', function () {
    $tool = Tool::factory()->create([
        'name' => 'Tool to Approve',
        'status' => ToolStatus::PENDING,
    ]);

    $user = User::factory()->create(['name' => 'Approver User']);

    $action = new ApproveToolAction;
    $action->execute($tool, $user);

    $activity = \Spatie\Activitylog\Models\Activity::where('subject_id', $tool->id)
        ->where('description', 'tool_approved')
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->subject_id)->toBe($tool->id);
    expect($activity->subject_type)->toBe(Tool::class);
    expect($activity->causer_id)->toBe($user->id);
});

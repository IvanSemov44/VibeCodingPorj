<?php

declare(strict_types=1);

use App\Actions\Tool\CreateToolAction;
use App\DataTransferObjects\ToolData;
use App\Enums\ToolDifficulty;
use App\Enums\ToolStatus;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('it creates a tool with basic data', function () {
    $toolData = new ToolData(
        name: 'Docker',
        description: 'Container platform',
        url: 'https://docker.com',
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool)->toBeInstanceOf(Tool::class);
    expect($tool->name)->toBe('Docker');
    expect($tool->slug)->toBe('docker');
    expect($tool->description)->toBe('Container platform');
    expect($tool->url)->toBe('https://docker.com');

    $this->assertDatabaseHas('tools', [
        'name' => 'Docker',
        'slug' => 'docker',
    ]);
});

test('it generates slug from name', function () {
    $toolData = new ToolData(
        name: 'Machine Learning Tool',
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->slug)->toBe('machine-learning-tool');
});

test('it syncs categories', function () {
    $category1 = Category::factory()->create();
    $category2 = Category::factory()->create();

    $toolData = new ToolData(
        name: 'Test Tool',
        categoryIds: [$category1->id, $category2->id],
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->categories)->toHaveCount(2);
    expect($tool->categories->pluck('id')->toArray())->toContain($category1->id, $category2->id);
});

test('it resolves and syncs tags by name', function () {
    $toolData = new ToolData(
        name: 'Test Tool',
        tags: ['PHP', 'Laravel', 'Testing'],
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->tags)->toHaveCount(3);
    expect(Tag::count())->toBe(3);

    $this->assertDatabaseHas('tags', ['name' => 'PHP']);
    $this->assertDatabaseHas('tags', ['name' => 'Laravel']);
    $this->assertDatabaseHas('tags', ['name' => 'Testing']);
});

test('it syncs roles', function () {
    $role1 = Role::create(['name' => 'developer']);
    $role2 = Role::create(['name' => 'designer']);

    $toolData = new ToolData(
        name: 'Test Tool',
        roleIds: [$role1->id, $role2->id],
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->roles)->toHaveCount(2);
    expect($tool->roles->pluck('name')->toArray())->toContain('developer', 'designer');
});

test('it sets difficulty enum', function () {
    $toolData = new ToolData(
        name: 'Test Tool',
        difficulty: ToolDifficulty::ADVANCED,
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->difficulty)->toBe(ToolDifficulty::ADVANCED);
});

test('it sets status enum', function () {
    $toolData = new ToolData(
        name: 'Test Tool',
        status: ToolStatus::PENDING,
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->status)->toBe(ToolStatus::PENDING);
});

test('it logs activity when user is provided', function () {
    $user = User::factory()->create();
    $toolData = new ToolData(
        name: 'Test Tool',
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData, $user);

    $this->assertDatabaseHas('activity_log', [
        'description' => 'tool_created',
        'subject_type' => Tool::class,
        'subject_id' => $tool->id,
        'causer_id' => $user->id,
    ]);
});

test('it does not log activity with causer when user is not provided', function () {
    $toolData = new ToolData(
        name: 'Test Tool',
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->exists)->toBeTrue();

    // ModelActivityObserver still logs, but without a causer
    $this->assertDatabaseHas('activity_log', [
        'subject_type' => Tool::class,
        'subject_id' => $tool->id,
        'description' => 'Tool_created',
        'causer_id' => null, // No user, so no causer
    ]);
});

test('it creates tool with all fields', function () {
    $toolData = new ToolData(
        name: 'Complete Tool',
        url: 'https://example.com',
        docsUrl: 'https://docs.example.com',
        description: 'A complete tool',
        usage: 'Usage instructions',
        examples: 'Example code',
        difficulty: ToolDifficulty::INTERMEDIATE,
        status: ToolStatus::APPROVED,
        screenshots: ['screenshot1.png', 'screenshot2.png'],
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    expect($tool->name)->toBe('Complete Tool');
    expect($tool->url)->toBe('https://example.com');
    expect($tool->docs_url)->toBe('https://docs.example.com');
    expect($tool->description)->toBe('A complete tool');
    expect($tool->usage)->toBe('Usage instructions');
    expect($tool->examples)->toBe('Example code');
    expect($tool->difficulty)->toBe(ToolDifficulty::INTERMEDIATE);
    expect($tool->status)->toBe(ToolStatus::APPROVED);
    expect($tool->screenshots)->toBeArray()->toHaveCount(2);
});

test('it returns tool with loaded relationships', function () {
    $category = Category::factory()->create();
    $toolData = new ToolData(
        name: 'Test Tool',
        categoryIds: [$category->id],
        tags: ['PHP'],
    );

    $action = app(CreateToolAction::class);
    $tool = $action->execute($toolData);

    // Verify relationships are loaded
    expect($tool->relationLoaded('categories'))->toBeTrue();
    expect($tool->relationLoaded('tags'))->toBeTrue();
    expect($tool->relationLoaded('roles'))->toBeTrue();
});

test('it uses database transaction', function () {
    // Create invalid data that will fail during sync
    $toolData = new ToolData(
        name: 'Test Tool',
        categoryIds: [999999], // Non-existent category
    );

    $action = app(CreateToolAction::class);

    try {
        $action->execute($toolData);
    } catch (\Exception $e) {
        // Transaction should rollback
    }

    // Tool should not exist in database due to rollback
    expect(Tool::where('name', 'Test Tool')->exists())->toBeFalse();
});

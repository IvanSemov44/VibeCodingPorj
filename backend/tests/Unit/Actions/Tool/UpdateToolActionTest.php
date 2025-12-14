<?php

declare(strict_types=1);

use App\Actions\Tool\UpdateToolAction;
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

test('it updates tool basic fields', function () {
    $tool = Tool::factory()->create([
        'name' => 'Old Name',
        'description' => 'Old description',
    ]);

    $toolData = new ToolData(
        name: 'New Name',
        description: 'New description',
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->name)->toBe('New Name');
    expect($updated->description)->toBe('New description');

    $this->assertDatabaseHas('tools', [
        'id' => $tool->id,
        'name' => 'New Name',
        'description' => 'New description',
    ]);
});

test('it updates slug when name changes', function () {
    $tool = Tool::factory()->create([
        'name' => 'Old Name',
        'slug' => 'old-name',
    ]);

    $toolData = new ToolData(
        name: 'Brand New Name',
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->slug)->toBe('brand-new-name');
});

test('it updates categories', function () {
    $tool = Tool::factory()->create();
    $oldCategory = Category::factory()->create();
    $tool->categories()->attach($oldCategory);

    $newCategory1 = Category::factory()->create();
    $newCategory2 = Category::factory()->create();

    $toolData = new ToolData(
        name: $tool->name,
        categoryIds: [$newCategory1->id, $newCategory2->id],
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->categories)->toHaveCount(2);
    expect($updated->categories->pluck('id')->toArray())
        ->toContain($newCategory1->id, $newCategory2->id)
        ->not->toContain($oldCategory->id);
});

test('it updates tags', function () {
    $tool = Tool::factory()->create();
    $oldTag = Tag::factory()->create(['name' => 'OldTag']);
    $tool->tags()->attach($oldTag);

    $toolData = new ToolData(
        name: $tool->name,
        tags: ['NewTag1', 'NewTag2'],
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->tags)->toHaveCount(2);
    $tagNames = $updated->tags->pluck('name')->toArray();
    expect($tagNames)->toContain('NewTag1', 'NewTag2');
    expect($tagNames)->not->toContain('OldTag');
});

test('it updates roles', function () {
    $tool = Tool::factory()->create();
    $oldRole = Role::create(['name' => 'old-role']);
    $tool->roles()->attach($oldRole);

    $newRole = Role::create(['name' => 'new-role']);

    $toolData = new ToolData(
        name: $tool->name,
        roleIds: [$newRole->id],
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->roles)->toHaveCount(1);
    expect($updated->roles->first()->name)->toBe('new-role');
});

test('it updates difficulty', function () {
    $tool = Tool::factory()->create([
        'difficulty' => ToolDifficulty::BEGINNER,
    ]);

    $toolData = new ToolData(
        name: $tool->name,
        difficulty: ToolDifficulty::ADVANCED,
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->difficulty)->toBe(ToolDifficulty::ADVANCED);
});

test('it updates status', function () {
    $tool = Tool::factory()->create([
        'status' => ToolStatus::PENDING,
    ]);

    $toolData = new ToolData(
        name: $tool->name,
        status: ToolStatus::APPROVED,
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->status)->toBe(ToolStatus::APPROVED);
});

test('it logs activity with old and new data when user is provided', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->create([
        'name' => 'Old Name',
    ]);

    $toolData = new ToolData(
        name: 'New Name',
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData, $user);

    $this->assertDatabaseHas('activity_log', [
        'description' => 'tool_updated',
        'subject_type' => Tool::class,
        'subject_id' => $tool->id,
        'causer_id' => $user->id,
    ]);
});

test('it does not log activity when user is not provided', function () {
    $tool = Tool::factory()->create(['name' => 'Old Name']);

    $toolData = new ToolData(
        name: 'New Name',
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->name)->toBe('New Name');

    $this->assertDatabaseMissing('activity_log', [
        'description' => 'tool_updated',
        'subject_id' => $tool->id,
    ]);
});

test('it returns fresh model with loaded relationships', function () {
    $tool = Tool::factory()->create();
    $category = Category::factory()->create();

    $toolData = new ToolData(
        name: 'Updated Name',
        categoryIds: [$category->id],
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->relationLoaded('categories'))->toBeTrue();
    expect($updated->relationLoaded('tags'))->toBeTrue();
    expect($updated->relationLoaded('roles'))->toBeTrue();
});

test('it updates all optional fields', function () {
    $tool = Tool::factory()->create();

    $toolData = new ToolData(
        name: 'Updated Tool',
        url: 'https://updated.com',
        docsUrl: 'https://docs.updated.com',
        description: 'Updated description',
        usage: 'Updated usage',
        examples: 'Updated examples',
        screenshots: ['new1.png', 'new2.png'],
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    expect($updated->url)->toBe('https://updated.com');
    expect($updated->docs_url)->toBe('https://docs.updated.com');
    expect($updated->description)->toBe('Updated description');
    expect($updated->usage)->toBe('Updated usage');
    expect($updated->examples)->toBe('Updated examples');
    expect($updated->screenshots)->toBeArray()->toContain('new1.png', 'new2.png');
});

test('it uses database transaction', function () {
    $tool = Tool::factory()->create(['name' => 'Original']);

    $toolData = new ToolData(
        name: 'Updated',
        categoryIds: [999999], // Non-existent category will fail
    );

    $action = app(UpdateToolAction::class);

    try {
        $action->execute($tool, $toolData);
    } catch (\Exception $e) {
        // Expected to fail
    }

    // Tool name should still be original due to transaction rollback
    $tool->refresh();
    expect($tool->name)->toBe('Original');
});

test('it preserves existing relationships when not provided in update', function () {
    $tool = Tool::factory()->create();
    $category = Category::factory()->create();
    $tool->categories()->attach($category);

    // Update without providing categories
    $toolData = new ToolData(
        name: 'Updated Name',
    );

    $action = app(UpdateToolAction::class);
    $updated = $action->execute($tool, $toolData);

    // Categories should still exist (empty array means no sync)
    $updated->refresh();
    expect($updated->categories)->toHaveCount(1);
});

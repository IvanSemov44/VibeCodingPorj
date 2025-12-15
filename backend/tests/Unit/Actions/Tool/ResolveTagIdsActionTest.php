<?php

declare(strict_types=1);

use App\Actions\Tool\ResolveTagIdsAction;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it resolves existing tag IDs', function () {
    $tag1 = Tag::factory()->create(['name' => 'PHP', 'slug' => 'php']);
    $tag2 = Tag::factory()->create(['name' => 'Laravel', 'slug' => 'laravel']);

    $action = new ResolveTagIdsAction;
    $result = $action->execute([$tag1->id, $tag2->id]);

    expect($result)
        ->toBeArray()
        ->toHaveCount(2)
        ->toContain($tag1->id)
        ->toContain($tag2->id);
});

test('it creates new tags from names', function () {
    $action = new ResolveTagIdsAction;

    expect(Tag::count())->toBe(0);

    $result = $action->execute(['PHP', 'Laravel']);

    expect(Tag::count())->toBe(2);
    expect($result)->toHaveCount(2);

    $this->assertDatabaseHas('tags', ['name' => 'PHP', 'slug' => 'php']);
    $this->assertDatabaseHas('tags', ['name' => 'Laravel', 'slug' => 'laravel']);
});

test('it handles mix of IDs and names', function () {
    $existingTag = Tag::factory()->create(['name' => 'Existing', 'slug' => 'existing']);

    $action = new ResolveTagIdsAction;
    $result = $action->execute([$existingTag->id, 'NewTag']);

    expect($result)->toHaveCount(2);
    expect(Tag::count())->toBe(2);

    $this->assertDatabaseHas('tags', ['name' => 'NewTag', 'slug' => 'newtag']);
});

test('it finds existing tags by slug instead of duplicating', function () {
    Tag::factory()->create(['name' => 'JavaScript', 'slug' => 'javascript']);

    $action = new ResolveTagIdsAction;
    $result = $action->execute(['JavaScript']);

    expect(Tag::count())->toBe(1);
    expect($result)->toHaveCount(1);
});

test('it removes duplicates from results', function () {
    $tag = Tag::factory()->create(['name' => 'PHP', 'slug' => 'php']);

    $action = new ResolveTagIdsAction;
    $result = $action->execute([$tag->id, $tag->id, 'PHP']);

    expect($result)->toHaveCount(1);
});

test('it skips empty strings', function () {
    $action = new ResolveTagIdsAction;
    $result = $action->execute(['Valid', '', '   ', 'Another']);

    expect($result)->toHaveCount(2);
    expect(Tag::count())->toBe(2);
});

test('it handles empty array input', function () {
    $action = new ResolveTagIdsAction;
    $result = $action->execute([]);

    expect($result)
        ->toBeArray()
        ->toBeEmpty();
});

test('it normalizes tag names with slugs', function () {
    $action = new ResolveTagIdsAction;
    $result = $action->execute(['Machine Learning', 'AI & ML']);

    $this->assertDatabaseHas('tags', ['slug' => 'machine-learning']);
    $this->assertDatabaseHas('tags', ['slug' => 'ai-ml']);
});

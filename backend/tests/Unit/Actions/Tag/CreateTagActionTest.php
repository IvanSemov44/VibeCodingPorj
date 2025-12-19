<?php

declare(strict_types=1);

namespace Tests\Unit\Actions\Tag;

use App\Actions\Tag\CreateTagAction;
use App\DataTransferObjects\TagData;
use App\Models\Tag;
use App\Models\User;
use Tests\TestCase;

class CreateTagActionTest extends TestCase
{
    private CreateTagAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new CreateTagAction();
    }

    public function test_create_tag_with_basic_data(): void
    {
        $data = new TagData(
            name: 'JavaScript',
            description: 'JavaScript programming language'
        );

        $tag = $this->action->execute($data);

        $this->assertInstanceOf(Tag::class, $tag);
        $this->assertEquals('JavaScript', $tag->name);
        $this->assertEquals('javascript', $tag->slug);
        $this->assertEquals('JavaScript programming language', $tag->description);
        $this->assertDatabaseHas('tags', [
            'name' => 'JavaScript',
            'slug' => 'javascript',
        ]);
    }

    public function test_create_tag_without_description(): void
    {
        $data = new TagData(name: 'Python');

        $tag = $this->action->execute($data);

        $this->assertNull($tag->description);
        $this->assertEquals('python', $tag->slug);
    }

    public function test_create_tag_logs_activity(): void
    {
        $user = User::factory()->create();
        $data = new TagData(name: 'React');

        $tag = $this->action->execute($data, $user);

        $activities = $user->activities;
        $this->assertTrue($activities->contains(fn ($activity) =>
            $activity->event === 'tag_created' &&
            $activity->subject_id === $tag->id
        ));
    }

    public function test_create_tag_without_user(): void
    {
        $data = new TagData(name: 'Vue.js');

        $tag = $this->action->execute($data);

        $this->assertNotNull($tag->id);
        $this->assertEquals('Vue.js', $tag->name);
    }
}

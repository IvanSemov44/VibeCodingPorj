<?php

declare(strict_types=1);

namespace Tests\Unit\Actions\Rating;

use App\Actions\Rating\CreateRatingAction;
use App\DataTransferObjects\RatingData;
use App\Models\Rating;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTools;
use Tests\Traits\CreatesUsers;

class CreateRatingActionTest extends TestCase
{
    use CreatesTools;
    use CreatesUsers;
    use RefreshDatabase;

    private CreateRatingAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = app(CreateRatingAction::class);
    }

    public function test_create_rating_creates_rating_with_valid_data(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $data = new RatingData(
            toolId: $tool->id,
            userId: $user->id,
            score: 5,
        );

        $rating = $this->action->execute($data, $user);

        $this->assertInstanceOf(Rating::class, $rating);
        $this->assertEquals(5, $rating->score);
        $this->assertEquals($tool->id, $rating->tool_id);
        $this->assertEquals($user->id, $rating->user_id);
    }

    public function test_create_rating_updates_existing_rating(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();

        $data1 = new RatingData(
            toolId: $tool->id,
            userId: $user->id,
            score: 3,
        );
        $rating1 = $this->action->execute($data1, $user);

        $data2 = new RatingData(
            toolId: $tool->id,
            userId: $user->id,
            score: 5,
        );
        $rating2 = $this->action->execute($data2, $user);

        $this->assertEquals($rating1->id, $rating2->id);
        $this->assertEquals(5, $rating2->score);
    }

    public function test_create_rating_recalculates_tool_average_rating(): void
    {
        $tool = $this->createApprovedTool();
        $user1 = $this->createUser();
        $user2 = $this->createUser();

        $data1 = new RatingData(
            toolId: $tool->id,
            userId: $user1->id,
            score: 4,
        );
        $this->action->execute($data1, $user1);

        $data2 = new RatingData(
            toolId: $tool->id,
            userId: $user2->id,
            score: 5,
        );
        $this->action->execute($data2, $user2);

        $tool->refresh();
        $this->assertEquals(4.5, $tool->average_rating);
    }

    public function test_create_rating_logs_activity(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $data = new RatingData(
            toolId: $tool->id,
            userId: $user->id,
            score: 5,
        );

        $this->action->execute($data, $user);

        $activity = \App\Models\Activity::where('causer_type', User::class)
            ->where('causer_id', $user->id)
            ->where('event', 'created')
            ->where('subject_type', Rating::class)
            ->latest()
            ->first();

        $this->assertNotNull($activity);
    }

    public function test_create_rating_with_valid_score_range(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();

        for ($score = 1; $score <= 5; $score++) {
            $data = new RatingData(
                toolId: $tool->id,
                userId: $user->id,
                score: $score,
            );
            $rating = $this->action->execute($data, $user);
            $this->assertEquals($score, $rating->score);
        }
    }
}

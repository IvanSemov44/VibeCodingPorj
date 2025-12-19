<?php

declare(strict_types=1);

namespace Tests\Unit\Actions\Journal;

use App\Actions\Journal\CreateJournalEntryAction;
use App\DataTransferObjects\JournalEntryData;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesUsers;

class CreateJournalEntryActionTest extends TestCase
{
    use CreatesUsers;
    use RefreshDatabase;

    private CreateJournalEntryAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = app(CreateJournalEntryAction::class);
    }

    public function test_create_journal_entry_creates_entry_with_valid_data(): void
    {
        $user = $this->createUser();
        $data = new JournalEntryData(
            userId: $user->id,
            title: 'My First Entry',
            content: 'This is my first journal entry.',
            mood: 'happy',
            tags: ['learning', 'progress'],
        );

        $entry = $this->action->execute($data, $user);

        $this->assertInstanceOf(JournalEntry::class, $entry);
        $this->assertEquals('My First Entry', $entry->title);
        $this->assertEquals('This is my first journal entry.', $entry->content);
        $this->assertEquals('happy', $entry->mood);
        $this->assertEquals($user->id, $entry->user_id);
    }

    public function test_create_journal_entry_with_tags(): void
    {
        $user = $this->createUser();
        $tags = ['learning', 'development', 'testing'];
        $data = new JournalEntryData(
            userId: $user->id,
            title: 'Tagged Entry',
            content: 'Entry with multiple tags',
            mood: null,
            tags: $tags,
        );

        $entry = $this->action->execute($data, $user);

        $this->assertNotNull($entry->tags);
    }

    public function test_create_journal_entry_without_mood(): void
    {
        $user = $this->createUser();
        $data = new JournalEntryData(
            userId: $user->id,
            title: 'No Mood Entry',
            content: 'Entry without mood tracking',
            mood: null,
            tags: null,
        );

        $entry = $this->action->execute($data, $user);

        $this->assertNull($entry->mood);
    }

    public function test_create_journal_entry_logs_activity(): void
    {
        $user = $this->createUser();
        $data = new JournalEntryData(
            userId: $user->id,
            title: 'Activity Logged Entry',
            content: 'This entry should log activity',
            mood: 'neutral',
            tags: null,
        );

        $this->action->execute($data, $user);

        $activity = \App\Models\Activity::where('causer_type', User::class)
            ->where('causer_id', $user->id)
            ->where('event', 'created')
            ->where('subject_type', JournalEntry::class)
            ->latest()
            ->first();

        $this->assertNotNull($activity);
    }

    public function test_create_multiple_journal_entries(): void
    {
        $user = $this->createUser();

        for ($i = 1; $i <= 3; $i++) {
            $data = new JournalEntryData(
                userId: $user->id,
                title: "Entry {$i}",
                content: "Content for entry {$i}",
                mood: 'happy',
                tags: null,
            );
            $this->action->execute($data, $user);
        }

        $entries = JournalEntry::where('user_id', $user->id)->get();
        $this->assertCount(3, $entries);
    }
}

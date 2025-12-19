<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events;
use App\Listeners;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

final class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Events\CommentCreated::class => [
            Listeners\SendCommentNotification::class,
        ],
        Events\CommentDeleted::class => [
            Listeners\LogCommentDeletion::class,
        ],
        Events\RatingCreated::class => [
            Listeners\UpdateRatingAnalytics::class,
        ],
        Events\RatingDeleted::class => [
            Listeners\RecalculateRatingAverage::class,
        ],
        Events\JournalEntryCreated::class => [
            Listeners\LogJournalEntryCreation::class,
        ],
        Events\JournalEntryDeleted::class => [
            Listeners\LogJournalEntryDeletion::class,
        ],
        Events\UserBanned::class => [
            Listeners\LogUserBanning::class,
        ],
        Events\UserUnbanned::class => [
            Listeners\LogUserUnbanning::class,
        ],
    ];

    /**
     * Enable event discovery.
     *
     * @return bool
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}

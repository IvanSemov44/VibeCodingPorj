<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

/**
 * Centralized audit logging utility.
 * Provides consistent logging for all critical events.
 */
final class AuditLogger
{
    /**
     * Log an event with optional subject and causer.
     *
     * @param string $event The event name
     * @param Model|null $subject The model being acted upon
     * @param array<string, mixed> $properties Additional properties to log
     * @param Authenticatable|null $causer The user performing the action
     * @return void
     */
    public static function log(
        string $event,
        ?Model $subject = null,
        array $properties = [],
        ?Authenticatable $causer = null
    ): void {
        try {
            $activity = activity()
                ->withProperties([
                    ...$properties,
                    'ip' => Request::ip(),
                    'user_agent' => Request::userAgent(),
                    'timestamp' => now()->toISOString(),
                ]);

            if ($subject !== null) {
                $activity->performedOn($subject);
            }

            if ($causer !== null) {
                $activity->causedBy($causer);
            }

            $activity->log($event);
        } catch (\Throwable $e) {
            Log::error('Failed to log audit activity', [
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Log a critical security event.
     *
     * @param string $event The security event name
     * @param Authenticatable|null $causer The user involved
     * @param array<string, mixed> $context Additional context
     * @return void
     */
    public static function security(
        string $event,
        ?Authenticatable $causer = null,
        array $context = []
    ): void {
        self::log(
            "security.{$event}",
            null,
            [
                'severity' => 'high',
                ...$context,
            ],
            $causer
        );
    }

    /**
     * Log unauthorized access attempt.
     *
     * @param string $resource The resource being accessed
     * @param Authenticatable|null $causer The user attempting access
     * @return void
     */
    public static function unauthorized(string $resource, ?Authenticatable $causer = null): void
    {
        self::security('unauthorized_access', $causer, [
            'resource' => $resource,
        ]);
    }

    /**
     * Log a user action.
     *
     * @param string $action The action name (e.g., 'login', 'logout', 'profile_update')
     * @param Authenticatable $user The user performing the action
     * @param array<string, mixed> $details Additional details
     * @return void
     */
    public static function userAction(string $action, Authenticatable $user, array $details = []): void
    {
        self::log(
            "user.{$action}",
            null,
            $details,
            $user
        );
    }
}

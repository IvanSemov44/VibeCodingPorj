<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $slug
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tool> $tools
 * @property-read int|null $tools_count
 * @method static \Database\Factories\CategoryFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereUpdatedAt($value)
 */
	class Category extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $content
 * @property string $mood
 * @property array<array-key, mixed>|null $tags
 * @property int $xp
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry byMood($mood)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry byTag($tag)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry search($search)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereMood($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereTags($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereXp($value)
 */
	class JournalEntry extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $slug
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tool> $tools
 * @property-read int|null $tools_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tag whereUpdatedAt($value)
 */
	class Tag extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $slug
 * @property string $status
 * @property string|null $url
 * @property string|null $docs_url
 * @property string|null $description
 * @property string|null $usage
 * @property string|null $examples
 * @property string|null $difficulty
 * @property array<array-key, mixed>|null $screenshots
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $submitted_by
 * @property int|null $reviewed_by
 * @property string|null $reviewed_at
 * @property string|null $rejection_reason
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read int|null $tags_count
 * @method static \Database\Factories\ToolFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereDifficulty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereDocsUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereExamples($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereRejectionReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereReviewedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereReviewedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereScreenshots($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereSubmittedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tool whereUsage($value)
 */
	class Tool extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $code
 * @property string $type
 * @property bool $used
 * @property \Illuminate\Support\Carbon $expires_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereUsed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TwoFactorChallenge whereUserId($value)
 */
	class TwoFactorChallenge extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $two_factor_type
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property string|null $two_factor_confirmed_at
 * @property string|null $telegram_chat_id
 * @property int $telegram_verified
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $last_login_at
 * @property string|null $last_login_ip
 * @property int $failed_login_attempts
 * @property \Illuminate\Support\Carbon|null $locked_until
 * @property string|null $password_changed_at
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\JournalEntry> $journalEntries
 * @property-read int|null $journal_entries_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFailedLoginAttempts($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastLoginAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastLoginIp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLockedUntil($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePasswordChangedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTelegramChatId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTelegramVerified($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorRecoveryCodes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent {}
}


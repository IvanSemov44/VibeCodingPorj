<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * User Preferences Model
 * Stores user-specific settings for privacy, display, notifications, and accessibility
 *
 * @property int $id
 * @property int $user_id
 * @property string $privacy_level public|private|friends_only
 * @property bool $show_email
 * @property bool $show_activity
 * @property string $theme light|dark|system
 * @property string $language
 * @property int $items_per_page
 * @property string $email_digest_frequency off|daily|weekly|monthly
 * @property bool $email_on_comment
 * @property bool $email_on_mention
 * @property bool $email_on_rating
 * @property bool $email_marketing
 * @property bool $enable_api_access
 * @property bool $enable_webhooks
 * @property bool $personalized_recommendations
 * @property array|null $saved_filters
 * @property bool $high_contrast_mode
 * @property bool $reduce_motion
 * @property bool $large_text_mode
 * @property bool $two_factor_enabled
 * @property string $timezone
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class UserPreference extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'privacy_level',
        'show_email',
        'show_activity',
        'theme',
        'language',
        'items_per_page',
        'email_digest_frequency',
        'email_on_comment',
        'email_on_mention',
        'email_on_rating',
        'email_marketing',
        'enable_api_access',
        'enable_webhooks',
        'personalized_recommendations',
        'saved_filters',
        'high_contrast_mode',
        'reduce_motion',
        'large_text_mode',
        'two_factor_enabled',
        'timezone',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'show_email' => 'bool',
        'show_activity' => 'bool',
        'email_on_comment' => 'bool',
        'email_on_mention' => 'bool',
        'email_on_rating' => 'bool',
        'email_marketing' => 'bool',
        'enable_api_access' => 'bool',
        'enable_webhooks' => 'bool',
        'personalized_recommendations' => 'bool',
        'saved_filters' => 'array',
        'high_contrast_mode' => 'bool',
        'reduce_motion' => 'bool',
        'large_text_mode' => 'bool',
        'two_factor_enabled' => 'bool',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns this preference record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user's theme preference.
     */
    public function getTheme(): string
    {
        return $this->theme;
    }

    /**
     * Set the user's theme preference.
     */
    public function setTheme(string $theme): self
    {
        $this->update(['theme' => $theme]);
        return $this;
    }

    /**
     * Get the user's language preference.
     */
    public function getLanguage(): string
    {
        return $this->language;
    }

    /**
     * Set the user's language preference.
     */
    public function setLanguage(string $language): self
    {
        $this->update(['language' => $language]);
        return $this;
    }

    /**
     * Get the user's privacy level.
     */
    public function getPrivacyLevel(): string
    {
        return $this->privacy_level;
    }

    /**
     * Set the user's privacy level.
     */
    public function setPrivacyLevel(string $level): self
    {
        $this->update(['privacy_level' => $level]);
        return $this;
    }

    /**
     * Check if email digest is enabled.
     */
    public function isEmailDigestEnabled(): bool
    {
        return $this->email_digest_frequency !== 'off';
    }

    /**
     * Get email digest frequency.
     */
    public function getEmailDigestFrequency(): string
    {
        return $this->email_digest_frequency;
    }

    /**
     * Set email digest frequency.
     */
    public function setEmailDigestFrequency(string $frequency): self
    {
        $this->update(['email_digest_frequency' => $frequency]);
        return $this;
    }

    /**
     * Check if email notifications are enabled for a specific event.
     */
    public function isEmailEnabledFor(string $type): bool
    {
        return match ($type) {
            'comment' => (bool) $this->email_on_comment,
            'mention' => (bool) $this->email_on_mention,
            'rating' => (bool) $this->email_on_rating,
            'marketing' => (bool) $this->email_marketing,
            default => false,
        };
    }

    /**
     * Check if accessibility feature is enabled.
     */
    public function isAccessibilityFeatureEnabled(string $feature): bool
    {
        return match ($feature) {
            'high_contrast' => (bool) $this->high_contrast_mode,
            'reduce_motion' => (bool) $this->reduce_motion,
            'large_text' => (bool) $this->large_text_mode,
            default => false,
        };
    }

    /**
     * Check if API access is enabled.
     */
    public function isApiAccessEnabled(): bool
    {
        return (bool) $this->enable_api_access;
    }

    /**
     * Check if webhooks are enabled.
     */
    public function isWebhooksEnabled(): bool
    {
        return (bool) $this->enable_webhooks;
    }

    /**
     * Save a search filter for the user.
     */
    public function saveFilter(string $name, array $filterData): self
    {
        $filters = $this->saved_filters ?? [];
        $filters[$name] = [
            'data' => $filterData,
            'created_at' => now()->toIso8601String(),
        ];
        $this->update(['saved_filters' => $filters]);
        return $this;
    }

    /**
     * Get a saved filter by name.
     */
    public function getFilter(string $name): ?array
    {
        $filters = $this->saved_filters ?? [];
        return $filters[$name] ?? null;
    }

    /**
     * Delete a saved filter.
     */
    public function deleteFilter(string $name): self
    {
        $filters = $this->saved_filters ?? [];
        unset($filters[$name]);
        $this->update(['saved_filters' => $filters]);
        return $this;
    }

    /**
     * Get all saved filters.
     */
    public function getSavedFilters(): array
    {
        return $this->saved_filters ?? [];
    }

    /**
     * Get timezone.
     */
    public function getTimezone(): string
    {
        return $this->timezone;
    }

    /**
     * Set timezone.
     */
    public function setTimezone(string $timezone): self
    {
        $this->update(['timezone' => $timezone]);
        return $this;
    }

    /**
     * Get items per page setting.
     */
    public function getItemsPerPage(): int
    {
        return (int) $this->items_per_page;
    }

    /**
     * Set items per page.
     */
    public function setItemsPerPage(int $count): self
    {
        $this->update(['items_per_page' => $count]);
        return $this;
    }
}

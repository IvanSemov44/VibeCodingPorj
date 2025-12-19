<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Settings Service
 * Manages user preferences and settings
 */
class SettingsService
{
    /**
     * Get or create user preferences.
     *
     * @throws ModelNotFoundException
     */
    public function getOrCreatePreferences(User $user): UserPreference
    {
        return UserPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'privacy_level' => 'public',
                'show_email' => false,
                'show_activity' => true,
                'theme' => 'system',
                'language' => 'en',
                'items_per_page' => 20,
                'email_digest_frequency' => 'weekly',
                'email_on_comment' => true,
                'email_on_mention' => true,
                'email_on_rating' => true,
                'email_marketing' => true,
                'enable_api_access' => false,
                'enable_webhooks' => false,
                'personalized_recommendations' => true,
                'saved_filters' => null,
                'high_contrast_mode' => false,
                'reduce_motion' => false,
                'large_text_mode' => false,
                'two_factor_enabled' => false,
                'timezone' => 'UTC',
            ]
        );
    }

    /**
     * Get user preferences.
     */
    public function getPreferences(User $user): UserPreference
    {
        return $this->getOrCreatePreferences($user);
    }

    /**
     * Update privacy settings.
     */
    public function updatePrivacySettings(
        User $user,
        string $privacyLevel,
        bool $showEmail = null,
        bool $showActivity = null
    ): UserPreference {
        $preferences = $this->getOrCreatePreferences($user);
        $data = ['privacy_level' => $privacyLevel];

        if ($showEmail !== null) {
            $data['show_email'] = $showEmail;
        }
        if ($showActivity !== null) {
            $data['show_activity'] = $showActivity;
        }

        $preferences->update($data);
        return $preferences;
    }

    /**
     * Update theme preference.
     */
    public function updateTheme(User $user, string $theme): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->setTheme($theme);
        return $preferences;
    }

    /**
     * Update language preference.
     */
    public function updateLanguage(User $user, string $language): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->setLanguage($language);
        return $preferences;
    }

    /**
     * Update notification email settings.
     */
    public function updateEmailNotifications(
        User $user,
        string $digestFrequency = null,
        bool $emailOnComment = null,
        bool $emailOnMention = null,
        bool $emailOnRating = null,
        bool $emailMarketing = null
    ): UserPreference {
        $preferences = $this->getOrCreatePreferences($user);
        $data = [];

        if ($digestFrequency !== null) {
            $data['email_digest_frequency'] = $digestFrequency;
        }
        if ($emailOnComment !== null) {
            $data['email_on_comment'] = $emailOnComment;
        }
        if ($emailOnMention !== null) {
            $data['email_on_mention'] = $emailOnMention;
        }
        if ($emailOnRating !== null) {
            $data['email_on_rating'] = $emailOnRating;
        }
        if ($emailMarketing !== null) {
            $data['email_marketing'] = $emailMarketing;
        }

        if (!empty($data)) {
            $preferences->update($data);
        }

        return $preferences;
    }

    /**
     * Update accessibility settings.
     */
    public function updateAccessibilitySettings(
        User $user,
        bool $highContrast = null,
        bool $reduceMotion = null,
        bool $largeText = null
    ): UserPreference {
        $preferences = $this->getOrCreatePreferences($user);
        $data = [];

        if ($highContrast !== null) {
            $data['high_contrast_mode'] = $highContrast;
        }
        if ($reduceMotion !== null) {
            $data['reduce_motion'] = $reduceMotion;
        }
        if ($largeText !== null) {
            $data['large_text_mode'] = $largeText;
        }

        if (!empty($data)) {
            $preferences->update($data);
        }

        return $preferences;
    }

    /**
     * Update API and webhook settings.
     */
    public function updateIntegrationSettings(
        User $user,
        bool $enableApi = null,
        bool $enableWebhooks = null
    ): UserPreference {
        $preferences = $this->getOrCreatePreferences($user);
        $data = [];

        if ($enableApi !== null) {
            $data['enable_api_access'] = $enableApi;
        }
        if ($enableWebhooks !== null) {
            $data['enable_webhooks'] = $enableWebhooks;
        }

        if (!empty($data)) {
            $preferences->update($data);
        }

        return $preferences;
    }

    /**
     * Update pagination settings.
     */
    public function updateItemsPerPage(User $user, int $itemsPerPage): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->setItemsPerPage($itemsPerPage);
        return $preferences;
    }

    /**
     * Update timezone.
     */
    public function updateTimezone(User $user, string $timezone): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->setTimezone($timezone);
        return $preferences;
    }

    /**
     * Update personalized recommendations setting.
     */
    public function updateRecommendations(User $user, bool $enabled): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->update(['personalized_recommendations' => $enabled]);
        return $preferences;
    }

    /**
     * Enable or disable two-factor authentication.
     */
    public function updateTwoFactorAuth(User $user, bool $enabled): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->update(['two_factor_enabled' => $enabled]);
        return $preferences;
    }

    /**
     * Update all settings at once.
     */
    public function updateAllSettings(User $user, array $settings): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->update($settings);
        return $preferences;
    }

    /**
     * Get a specific setting value.
     */
    public function getSetting(User $user, string $settingKey): mixed
    {
        $preferences = $this->getOrCreatePreferences($user);
        return $preferences->getAttribute($settingKey);
    }

    /**
     * Save a search filter.
     */
    public function saveFilter(User $user, string $name, array $filterData): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        return $preferences->saveFilter($name, $filterData);
    }

    /**
     * Get a saved filter.
     */
    public function getFilter(User $user, string $name): ?array
    {
        $preferences = $this->getOrCreatePreferences($user);
        return $preferences->getFilter($name);
    }

    /**
     * Get all saved filters.
     */
    public function getSavedFilters(User $user): array
    {
        $preferences = $this->getOrCreatePreferences($user);
        return $preferences->getSavedFilters();
    }

    /**
     * Delete a saved filter.
     */
    public function deleteFilter(User $user, string $name): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        return $preferences->deleteFilter($name);
    }

    /**
     * Reset settings to defaults.
     */
    public function resetToDefaults(User $user): UserPreference
    {
        $preferences = $this->getOrCreatePreferences($user);
        $preferences->update([
            'privacy_level' => 'public',
            'show_email' => false,
            'show_activity' => true,
            'theme' => 'system',
            'language' => 'en',
            'items_per_page' => 20,
            'email_digest_frequency' => 'weekly',
            'email_on_comment' => true,
            'email_on_mention' => true,
            'email_on_rating' => true,
            'email_marketing' => true,
            'enable_api_access' => false,
            'enable_webhooks' => false,
            'personalized_recommendations' => true,
            'saved_filters' => null,
            'high_contrast_mode' => false,
            'reduce_motion' => false,
            'large_text_mode' => false,
            'two_factor_enabled' => false,
            'timezone' => 'UTC',
        ]);
        return $preferences;
    }

    /**
     * Get privacy profile for public display.
     */
    public function getPrivacyProfile(User $user): array
    {
        $preferences = $this->getOrCreatePreferences($user);

        return [
            'privacy_level' => $preferences->privacy_level,
            'show_email' => $preferences->show_email,
            'show_activity' => $preferences->show_activity && $preferences->privacy_level !== 'private',
        ];
    }

    /**
     * Verify a setting has a specific value.
     */
    public function verifySetting(User $user, string $settingKey, mixed $value): bool
    {
        $preferences = $this->getOrCreatePreferences($user);
        return $preferences->getAttribute($settingKey) === $value;
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Settings Controller
 * Manages user preferences and settings via API
 */
class SettingsController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        private readonly SettingsService $settingsService
    ) {
    }

    /**
     * Get authenticated user's settings.
     * GET /api/settings
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $preferences = $this->settingsService->getPreferences($user);

        return response()->json([
            'data' => [
                'id' => $preferences->id,
                'user_id' => $preferences->user_id,
                'privacy' => [
                    'level' => $preferences->privacy_level,
                    'show_email' => $preferences->show_email,
                    'show_activity' => $preferences->show_activity,
                ],
                'display' => [
                    'theme' => $preferences->theme,
                    'language' => $preferences->language,
                    'items_per_page' => $preferences->items_per_page,
                ],
                'notifications' => [
                    'email_digest_frequency' => $preferences->email_digest_frequency,
                    'email_on_comment' => $preferences->email_on_comment,
                    'email_on_mention' => $preferences->email_on_mention,
                    'email_on_rating' => $preferences->email_on_rating,
                    'email_marketing' => $preferences->email_marketing,
                ],
                'integrations' => [
                    'enable_api_access' => $preferences->enable_api_access,
                    'enable_webhooks' => $preferences->enable_webhooks,
                ],
                'discovery' => [
                    'personalized_recommendations' => $preferences->personalized_recommendations,
                    'saved_filters_count' => count($preferences->saved_filters ?? []),
                ],
                'accessibility' => [
                    'high_contrast_mode' => $preferences->high_contrast_mode,
                    'reduce_motion' => $preferences->reduce_motion,
                    'large_text_mode' => $preferences->large_text_mode,
                ],
                'account' => [
                    'two_factor_enabled' => $preferences->two_factor_enabled,
                    'timezone' => $preferences->timezone,
                ],
                'created_at' => $preferences->created_at,
                'updated_at' => $preferences->updated_at,
            ],
        ], 200);
    }

    /**
     * Update user settings.
     * POST /api/settings
     */
    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            // Privacy
            'privacy.level' => ['sometimes', Rule::in(['public', 'private', 'friends_only'])],
            'privacy.show_email' => 'sometimes|boolean',
            'privacy.show_activity' => 'sometimes|boolean',

            // Display
            'display.theme' => ['sometimes', Rule::in(['light', 'dark', 'system'])],
            'display.language' => ['sometimes', Rule::in(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'])],
            'display.items_per_page' => 'sometimes|integer|min:5|max:100',

            // Notifications
            'notifications.email_digest_frequency' => ['sometimes', Rule::in(['off', 'daily', 'weekly', 'monthly'])],
            'notifications.email_on_comment' => 'sometimes|boolean',
            'notifications.email_on_mention' => 'sometimes|boolean',
            'notifications.email_on_rating' => 'sometimes|boolean',
            'notifications.email_marketing' => 'sometimes|boolean',

            // Integrations
            'integrations.enable_api_access' => 'sometimes|boolean',
            'integrations.enable_webhooks' => 'sometimes|boolean',

            // Discovery
            'discovery.personalized_recommendations' => 'sometimes|boolean',

            // Accessibility
            'accessibility.high_contrast_mode' => 'sometimes|boolean',
            'accessibility.reduce_motion' => 'sometimes|boolean',
            'accessibility.large_text_mode' => 'sometimes|boolean',

            // Account
            'account.timezone' => 'sometimes|timezone',
            'account.two_factor_enabled' => 'sometimes|boolean',
        ]);

        // Update privacy settings
        if (isset($validated['privacy'])) {
            $this->settingsService->updatePrivacySettings(
                $user,
                $validated['privacy']['level'] ?? null,
                $validated['privacy']['show_email'] ?? null,
                $validated['privacy']['show_activity'] ?? null
            );
        }

        // Update display settings
        if (isset($validated['display']['theme'])) {
            $this->settingsService->updateTheme($user, $validated['display']['theme']);
        }
        if (isset($validated['display']['language'])) {
            $this->settingsService->updateLanguage($user, $validated['display']['language']);
        }
        if (isset($validated['display']['items_per_page'])) {
            $this->settingsService->updateItemsPerPage($user, $validated['display']['items_per_page']);
        }

        // Update notification settings
        if (isset($validated['notifications'])) {
            $this->settingsService->updateEmailNotifications(
                $user,
                $validated['notifications']['email_digest_frequency'] ?? null,
                $validated['notifications']['email_on_comment'] ?? null,
                $validated['notifications']['email_on_mention'] ?? null,
                $validated['notifications']['email_on_rating'] ?? null,
                $validated['notifications']['email_marketing'] ?? null
            );
        }

        // Update integration settings
        if (isset($validated['integrations'])) {
            $this->settingsService->updateIntegrationSettings(
                $user,
                $validated['integrations']['enable_api_access'] ?? null,
                $validated['integrations']['enable_webhooks'] ?? null
            );
        }

        // Update discovery settings
        if (isset($validated['discovery']['personalized_recommendations'])) {
            $this->settingsService->updateRecommendations($user, $validated['discovery']['personalized_recommendations']);
        }

        // Update accessibility settings
        if (isset($validated['accessibility'])) {
            $this->settingsService->updateAccessibilitySettings(
                $user,
                $validated['accessibility']['high_contrast_mode'] ?? null,
                $validated['accessibility']['reduce_motion'] ?? null,
                $validated['accessibility']['large_text_mode'] ?? null
            );
        }

        // Update account settings
        if (isset($validated['account']['timezone'])) {
            $this->settingsService->updateTimezone($user, $validated['account']['timezone']);
        }
        if (isset($validated['account']['two_factor_enabled'])) {
            $this->settingsService->updateTwoFactorAuth($user, $validated['account']['two_factor_enabled']);
        }

        $preferences = $this->settingsService->getPreferences($user);

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => [
                'id' => $preferences->id,
                'privacy' => [
                    'level' => $preferences->privacy_level,
                    'show_email' => $preferences->show_email,
                    'show_activity' => $preferences->show_activity,
                ],
                'display' => [
                    'theme' => $preferences->theme,
                    'language' => $preferences->language,
                    'items_per_page' => $preferences->items_per_page,
                ],
                'notifications' => [
                    'email_digest_frequency' => $preferences->email_digest_frequency,
                    'email_on_comment' => $preferences->email_on_comment,
                    'email_on_mention' => $preferences->email_on_mention,
                    'email_on_rating' => $preferences->email_on_rating,
                    'email_marketing' => $preferences->email_marketing,
                ],
                'integrations' => [
                    'enable_api_access' => $preferences->enable_api_access,
                    'enable_webhooks' => $preferences->enable_webhooks,
                ],
                'discovery' => [
                    'personalized_recommendations' => $preferences->personalized_recommendations,
                ],
                'accessibility' => [
                    'high_contrast_mode' => $preferences->high_contrast_mode,
                    'reduce_motion' => $preferences->reduce_motion,
                    'large_text_mode' => $preferences->large_text_mode,
                ],
                'account' => [
                    'timezone' => $preferences->timezone,
                    'two_factor_enabled' => $preferences->two_factor_enabled,
                ],
                'updated_at' => $preferences->updated_at,
            ],
        ], 200);
    }

    /**
     * Reset settings to defaults.
     * POST /api/settings/reset
     */
    public function reset(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $preferences = $this->settingsService->resetToDefaults($user);

        return response()->json([
            'message' => 'Settings reset to defaults',
            'data' => [
                'id' => $preferences->id,
                'privacy_level' => $preferences->privacy_level,
                'theme' => $preferences->theme,
                'language' => $preferences->language,
                'email_digest_frequency' => $preferences->email_digest_frequency,
                'timezone' => $preferences->timezone,
            ],
        ], 200);
    }

    /**
     * Get saved search filters.
     * GET /api/settings/filters
     */
    public function getFilters(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $filters = $this->settingsService->getSavedFilters($user);

        return response()->json([
            'data' => $filters,
            'count' => count($filters),
        ], 200);
    }

    /**
     * Save a search filter.
     * POST /api/settings/filters
     */
    public function saveFilter(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filter_data' => 'required|array',
        ]);

        $preferences = $this->settingsService->saveFilter(
            $user,
            $validated['name'],
            $validated['filter_data']
        );

        return response()->json([
            'message' => 'Filter saved successfully',
            'data' => [
                'name' => $validated['name'],
                'saved_at' => $preferences->updated_at,
            ],
        ], 201);
    }

    /**
     * Delete a saved filter.
     * DELETE /api/settings/filters/{name}
     */
    public function deleteFilter(Request $request, string $name): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->settingsService->deleteFilter($user, $name);

        return response()->json([
            'message' => 'Filter deleted successfully',
        ], 200);
    }
}

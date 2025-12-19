<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserPreference;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * Settings Service Tests
 * Tests for user preferences and settings management
 */
class SettingsServiceTest extends TestCase
{
    use DatabaseTransactions;

    private SettingsService $settingsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->settingsService = app(SettingsService::class);
    }

    /** @test */
    public function it_creates_default_preferences_for_new_user(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->getOrCreatePreferences($user);

        $this->assertInstanceOf(UserPreference::class, $preferences);
        $this->assertEquals('public', $preferences->privacy_level);
        $this->assertEquals('system', $preferences->theme);
        $this->assertEquals('en', $preferences->language);
        $this->assertEquals('weekly', $preferences->email_digest_frequency);
        $this->assertTrue($preferences->email_on_comment);
        $this->assertTrue($preferences->email_on_mention);
    }

    /** @test */
    public function it_returns_existing_preferences(): void
    {
        $user = User::factory()->create();
        $original = $this->settingsService->getOrCreatePreferences($user);

        $retrieved = $this->settingsService->getPreferences($user);

        $this->assertEquals($original->id, $retrieved->id);
    }

    /** @test */
    public function it_updates_privacy_settings(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updatePrivacySettings(
            $user,
            'private',
            true,
            false
        );

        $this->assertEquals('private', $preferences->privacy_level);
        $this->assertTrue($preferences->show_email);
        $this->assertFalse($preferences->show_activity);
    }

    /** @test */
    public function it_updates_theme(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateTheme($user, 'dark');

        $this->assertEquals('dark', $preferences->theme);
    }

    /** @test */
    public function it_updates_language(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateLanguage($user, 'es');

        $this->assertEquals('es', $preferences->language);
    }

    /** @test */
    public function it_updates_email_notifications(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateEmailNotifications(
            $user,
            'daily',
            false,
            true,
            false,
            true
        );

        $this->assertEquals('daily', $preferences->email_digest_frequency);
        $this->assertFalse($preferences->email_on_comment);
        $this->assertTrue($preferences->email_on_mention);
        $this->assertFalse($preferences->email_on_rating);
        $this->assertTrue($preferences->email_marketing);
    }

    /** @test */
    public function it_updates_accessibility_settings(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateAccessibilitySettings(
            $user,
            true,
            true,
            false
        );

        $this->assertTrue($preferences->high_contrast_mode);
        $this->assertTrue($preferences->reduce_motion);
        $this->assertFalse($preferences->large_text_mode);
    }

    /** @test */
    public function it_updates_integration_settings(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateIntegrationSettings(
            $user,
            true,
            true
        );

        $this->assertTrue($preferences->enable_api_access);
        $this->assertTrue($preferences->enable_webhooks);
    }

    /** @test */
    public function it_updates_items_per_page(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateItemsPerPage($user, 50);

        $this->assertEquals(50, $preferences->items_per_page);
    }

    /** @test */
    public function it_updates_timezone(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateTimezone($user, 'America/New_York');

        $this->assertEquals('America/New_York', $preferences->timezone);
    }

    /** @test */
    public function it_updates_recommendations(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateRecommendations($user, false);

        $this->assertFalse($preferences->personalized_recommendations);
    }

    /** @test */
    public function it_updates_two_factor_auth(): void
    {
        $user = User::factory()->create();

        $preferences = $this->settingsService->updateTwoFactorAuth($user, true);

        $this->assertTrue($preferences->two_factor_enabled);
    }

    /** @test */
    public function it_saves_search_filters(): void
    {
        $user = User::factory()->create();

        $filterData = ['category' => 'tools', 'rating' => 4];
        $preferences = $this->settingsService->saveFilter($user, 'top_tools', $filterData);

        $this->assertNotNull($preferences->saved_filters);
        $this->assertArrayHasKey('top_tools', $preferences->saved_filters);
    }

    /** @test */
    public function it_retrieves_saved_filters(): void
    {
        $user = User::factory()->create();

        $filterData = ['category' => 'tools'];
        $this->settingsService->saveFilter($user, 'my_filter', $filterData);
        $filters = $this->settingsService->getSavedFilters($user);

        $this->assertArrayHasKey('my_filter', $filters);
    }

    /** @test */
    public function it_deletes_saved_filters(): void
    {
        $user = User::factory()->create();

        $this->settingsService->saveFilter($user, 'temp_filter', ['test' => 'data']);
        $this->settingsService->deleteFilter($user, 'temp_filter');
        $filters = $this->settingsService->getSavedFilters($user);

        $this->assertArrayNotHasKey('temp_filter', $filters);
    }

    /** @test */
    public function it_resets_settings_to_defaults(): void
    {
        $user = User::factory()->create();
        $this->settingsService->updateTheme($user, 'dark');
        $this->settingsService->updateLanguage($user, 'es');

        $preferences = $this->settingsService->resetToDefaults($user);

        $this->assertEquals('system', $preferences->theme);
        $this->assertEquals('en', $preferences->language);
        $this->assertEquals('public', $preferences->privacy_level);
    }

    /** @test */
    public function it_updates_all_settings_at_once(): void
    {
        $user = User::factory()->create();

        $settings = [
            'theme' => 'dark',
            'language' => 'fr',
            'privacy_level' => 'private',
            'items_per_page' => 30,
        ];
        $preferences = $this->settingsService->updateAllSettings($user, $settings);

        $this->assertEquals('dark', $preferences->theme);
        $this->assertEquals('fr', $preferences->language);
        $this->assertEquals('private', $preferences->privacy_level);
        $this->assertEquals(30, $preferences->items_per_page);
    }

    /** @test */
    public function it_gets_a_specific_setting(): void
    {
        $user = User::factory()->create();

        $theme = $this->settingsService->getSetting($user, 'theme');

        $this->assertIsString($theme);
    }

    /** @test */
    public function it_verifies_setting_values(): void
    {
        $user = User::factory()->create();

        $isDefault = $this->settingsService->verifySetting($user, 'theme', 'system');

        $this->assertTrue($isDefault);
    }

    /** @test */
    public function it_gets_privacy_profile(): void
    {
        $user = User::factory()->create();
        $this->settingsService->updatePrivacySettings($user, 'private', true, true);

        $profile = $this->settingsService->getPrivacyProfile($user);

        $this->assertEquals('private', $profile['privacy_level']);
        $this->assertTrue($profile['show_email']);
        $this->assertFalse($profile['show_activity']);
    }
}

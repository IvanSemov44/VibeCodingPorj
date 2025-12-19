<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * Settings Endpoint Tests
 * Tests for user preferences API endpoints
 */
class SettingsEndpointTest extends TestCase
{
    use DatabaseTransactions;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function it_requires_authentication_for_settings_endpoint(): void
    {
        $response = $this->getJson('/api/settings');

        $response->assertUnauthorized();
    }

    /** @test */
    public function it_returns_user_settings(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/settings');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'user_id',
                    'privacy',
                    'display',
                    'notifications',
                    'integrations',
                    'discovery',
                    'accessibility',
                    'account',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    /** @test */
    public function it_updates_privacy_settings(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'privacy' => [
                    'level' => 'private',
                    'show_email' => true,
                    'show_activity' => false,
                ],
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'privacy' => [
                        'level' => 'private',
                        'show_email' => true,
                        'show_activity' => false,
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_updates_display_settings(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'display' => [
                    'theme' => 'dark',
                    'language' => 'es',
                    'items_per_page' => 50,
                ],
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'display' => [
                        'theme' => 'dark',
                        'language' => 'es',
                        'items_per_page' => 50,
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_updates_notification_settings(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'notifications' => [
                    'email_digest_frequency' => 'daily',
                    'email_on_comment' => false,
                    'email_on_mention' => true,
                    'email_on_rating' => false,
                    'email_marketing' => true,
                ],
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'notifications' => [
                        'email_digest_frequency' => 'daily',
                        'email_on_comment' => false,
                        'email_on_mention' => true,
                        'email_on_rating' => false,
                        'email_marketing' => true,
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_updates_accessibility_settings(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'accessibility' => [
                    'high_contrast_mode' => true,
                    'reduce_motion' => true,
                    'large_text_mode' => false,
                ],
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'accessibility' => [
                        'high_contrast_mode' => true,
                        'reduce_motion' => true,
                        'large_text_mode' => false,
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_updates_account_settings(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'account' => [
                    'timezone' => 'America/New_York',
                    'two_factor_enabled' => true,
                ],
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'account' => [
                        'timezone' => 'America/New_York',
                        'two_factor_enabled' => true,
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_validates_privacy_level(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'privacy' => [
                    'level' => 'invalid_level',
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('privacy.level');
    }

    /** @test */
    public function it_validates_theme_value(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'display' => [
                    'theme' => 'neon',
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('display.theme');
    }

    /** @test */
    public function it_validates_language_value(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'display' => [
                    'language' => 'klingon',
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('display.language');
    }

    /** @test */
    public function it_validates_email_digest_frequency(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'notifications' => [
                    'email_digest_frequency' => 'hourly',
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('notifications.email_digest_frequency');
    }

    /** @test */
    public function it_validates_timezone(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'account' => [
                    'timezone' => 'Invalid/Timezone',
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('account.timezone');
    }

    /** @test */
    public function it_validates_items_per_page_bounds(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'display' => [
                    'items_per_page' => 200,
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('display.items_per_page');
    }

    /** @test */
    public function it_resets_settings_to_defaults(): void
    {
        // First update some settings
        $this->actingAs($this->user)
            ->postJson('/api/settings', [
                'display' => ['theme' => 'dark'],
                'privacy' => ['level' => 'private'],
            ]);

        // Then reset
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings/reset');

        $response->assertOk()
            ->assertJson([
                'message' => 'Settings reset to defaults',
            ]);
    }

    /** @test */
    public function it_saves_search_filters(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings/filters', [
                'name' => 'top_rated',
                'filter_data' => [
                    'category' => 'tools',
                    'min_rating' => 4,
                ],
            ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Filter saved successfully',
            ]);
    }

    /** @test */
    public function it_retrieves_saved_filters(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/settings/filters', [
                'name' => 'my_filter',
                'filter_data' => ['test' => 'data'],
            ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/settings/filters');

        $response->assertOk()
            ->assertJson([
                'count' => 1,
            ]);
    }

    /** @test */
    public function it_deletes_saved_filters(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/settings/filters', [
                'name' => 'temp',
                'filter_data' => ['test' => 'data'],
            ]);

        $response = $this->actingAs($this->user)
            ->deleteJson('/api/settings/filters/temp');

        $response->assertOk()
            ->assertJson([
                'message' => 'Filter deleted successfully',
            ]);
    }

    /** @test */
    public function it_validates_filter_name_is_required(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings/filters', [
                'filter_data' => ['test' => 'data'],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    /** @test */
    public function it_validates_filter_data_is_required(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/settings/filters', [
                'name' => 'test',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('filter_data');
    }
}

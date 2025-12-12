<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService();
    }

    public function test_register_creates_new_user(): void
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $user = $this->authService->register($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    public function test_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $authenticatedUser = $this->authService->login([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $this->assertEquals($user->id, $authenticatedUser->id);
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->expectException(ValidationException::class);

        $this->authService->login([
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);
    }

    public function test_is_account_accessible_returns_true_for_active_user(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $result = $this->authService->isAccountAccessible($user);

        $this->assertTrue($result);
    }

    public function test_is_account_accessible_returns_false_for_inactive_user(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $result = $this->authService->isAccountAccessible($user);

        $this->assertFalse($result);
    }

    public function test_is_account_accessible_returns_false_for_locked_user(): void
    {
        $user = User::factory()->create([
            'locked_until' => now()->addHour(),
        ]);

        $result = $this->authService->isAccountAccessible($user);

        $this->assertFalse($result);
    }

    public function test_handle_failed_login_increments_attempts(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'failed_login_attempts' => 2,
        ]);

        $this->authService->handleFailedLogin('test@example.com');

        $user->refresh();
        $this->assertEquals(3, $user->failed_login_attempts);
    }

    public function test_handle_failed_login_locks_account_after_five_attempts(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'failed_login_attempts' => 4,
        ]);

        $this->authService->handleFailedLogin('test@example.com');

        // Reload from database to get updated values
        $updatedUser = User::where('email', 'test@example.com')->first();
        
        $this->assertEquals(5, $updatedUser->failed_login_attempts);
        $this->assertNotNull($updatedUser->locked_until);
        $this->assertTrue($updatedUser->locked_until->isFuture());
    }
}

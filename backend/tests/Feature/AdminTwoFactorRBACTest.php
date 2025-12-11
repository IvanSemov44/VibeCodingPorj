<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminTwoFactorRBACTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_set_2fa_for_user()
    {
        // Create owner role and assign to actor
        Role::firstOrCreate(['name' => 'owner']);

        $owner = User::factory()->create();
        $owner->assignRole('owner');

        $target = User::factory()->create();

        // Debug: dump role names and pivot count to log to diagnose middleware denial
        try {
            $info = [
                'owner_roles' => $owner->getRoleNames()->toArray(),
                'pivot_count' => \Illuminate\Support\Facades\DB::table('model_has_roles')->where('model_id', $owner->id)->count(),
            ];
            file_put_contents(storage_path('logs/test_role_debug.log'), json_encode($info) . PHP_EOL, FILE_APPEND);
        } catch (\Exception $e) {
            file_put_contents(storage_path('logs/test_role_debug.log'), 'debug_error:' . $e->getMessage() . PHP_EOL, FILE_APPEND);
        }

        $response = $this->actingAs($owner, 'sanctum')->postJson("/api/admin/users/{$target->id}/2fa", [
            'type' => 'totp',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $target->id, 'two_factor_type' => 'totp']);
    }

    public function test_non_owner_is_forbidden_from_setting_2fa()
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/admin/users/{$target->id}/2fa", [
            'type' => 'email',
        ]);

        $response->assertStatus(403);
    }
}

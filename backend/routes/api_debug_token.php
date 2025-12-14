<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/debug/token', function () {
    $user = User::where('email', 'ivan@admin.local')->first();
    if (! $user) {
        return response()->json(['message' => 'test user not found'], 404);
    }
    $token = $user->createToken('debug-token')->plainTextToken;

    return response()->json(['token' => $token]);
});

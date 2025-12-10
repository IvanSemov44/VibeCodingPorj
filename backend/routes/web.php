<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return view('welcome');
});
// Any web-only routes (views) can continue to live here. Keep API
// endpoints out of `web.php` to avoid middleware collisions that
// redirect unauthenticated API requests to `/login`.

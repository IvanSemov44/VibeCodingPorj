<?php

use Illuminate\Support\Facades\Route;

// API-only backend: disable web/front-end routes.
Route::get('/', function () {
    abort(404);
});

// Any web-only routes should be removed or moved to a separate
// frontend project. Keep API routes in `routes/api.php`.

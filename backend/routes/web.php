<?php

use Illuminate\Support\Facades\Route;

// Root route used by basic example test.
Route::get('/', function () {
    return response('OK', 200);
});

// Any web-only routes should be removed or moved to a separate
// frontend project. Keep API routes in `routes/api.php`.

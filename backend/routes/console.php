<?php

use App\Jobs\CleanupActivityLogs;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule cleanup job to run daily
Schedule::job(new CleanupActivityLogs(90))->daily()->at('02:00');

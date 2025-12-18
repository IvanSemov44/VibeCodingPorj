<?php

namespace App\Console\Commands;

use App\Models\Rating;
use App\Models\Tool;
use Illuminate\Console\Command;

class CheckRatings extends Command
{
    protected $signature = 'check:ratings';

    protected $description = 'Check and update tool ratings';

    public function handle()
    {
        $this->info('Checking ratings...');

        $totalRatings = Rating::count();
        $this->info("Total ratings in DB: {$totalRatings}");

        $tools = Tool::limit(5)->get();

        foreach ($tools as $tool) {
            $actualCount = $tool->ratings()->count();
            $actualAvg = $tool->ratings()->avg('score');

            $this->line("Tool: {$tool->name}");
            $this->line("  DB average_rating: {$tool->average_rating}");
            $this->line("  DB rating_count: {$tool->rating_count}");
            $this->line("  Actual ratings: {$actualCount}");
            $this->line("  Actual average: {$actualAvg}");
            $this->line('');
        }

        // Update all ratings
        $this->info('Updating all tool ratings...');
        foreach (Tool::all() as $tool) {
            $tool->updateAverageRating();
        }
        $this->info('Done!');
    }
}

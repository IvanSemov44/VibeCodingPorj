<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Rating;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentRatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $tools = Tool::all();

        if ($users->isEmpty() || $tools->isEmpty()) {
            $this->command->warn('No users or tools found. Please seed users and tools first.');

            return;
        }

        $this->command->info('Seeding comments and ratings...');

        $commentTexts = [
            'This tool is absolutely fantastic! Saved me hours of work.',
            'Great tool, but could use better documentation.',
            'Amazing! Works exactly as expected.',
            'Very useful, highly recommend it.',
            'Not bad, but there are better alternatives.',
            'Excellent tool for beginners and experts alike.',
            'The best tool I\'ve used for this purpose.',
            'Good concept, but needs some improvements.',
            'Perfect for my use case!',
            'Simple, efficient, and reliable.',
            'I use this every day. Can\'t live without it.',
            'Nice tool, but a bit slow on large datasets.',
            'Exactly what I was looking for!',
            'Works well, but the UI could be more intuitive.',
            'Outstanding tool with great features.',
            'Solid tool, does what it promises.',
            'Love it! Makes my workflow so much easier.',
            'Impressive functionality and performance.',
        ];

        $replyTexts = [
            'I totally agree!',
            'Thanks for sharing your experience.',
            'Have you tried the latest version? It\'s even better.',
            'Same here, using it daily.',
            'Good point!',
            'Couldn\'t agree more.',
            'Thanks for the tip!',
            'I had the same issue initially, but it gets better.',
            'Great feedback!',
            'Exactly my thoughts!',
        ];

        foreach ($tools as $tool) {
            // Add 3-7 ratings per tool
            $ratingCount = rand(3, 7);
            $ratedUsers = $users->random(min($ratingCount, $users->count()));

            foreach ($ratedUsers as $user) {
                Rating::create([
                    'tool_id' => $tool->id,
                    'user_id' => $user->id,
                    'score' => rand(3, 5), // Mostly positive ratings
                    'review' => rand(0, 1) ? $commentTexts[array_rand($commentTexts)] : null,
                ]);
            }

            // Add 4-10 comments per tool
            $commentCount = rand(4, 10);
            $commentUsers = $users->random(min($commentCount, $users->count()));

            $topLevelComments = [];

            foreach ($commentUsers as $index => $user) {
                $comment = Comment::create([
                    'tool_id' => $tool->id,
                    'user_id' => $user->id,
                    'content' => $commentTexts[array_rand($commentTexts)],
                    'status' => 'approved',
                    'upvotes' => rand(0, 15),
                    'downvotes' => rand(0, 3),
                ]);

                $topLevelComments[] = $comment;

                // Add 0-2 replies to some comments (50% chance)
                if (rand(0, 1) && $users->count() > 1) {
                    $replyCount = rand(0, 2);
                    for ($i = 0; $i < $replyCount; $i++) {
                        $replyUser = $users->where('id', '!=', $user->id)->random();
                        Comment::create([
                            'tool_id' => $tool->id,
                            'user_id' => $replyUser->id,
                            'parent_id' => $comment->id,
                            'content' => $replyTexts[array_rand($replyTexts)],
                            'status' => 'approved',
                            'upvotes' => rand(0, 8),
                            'downvotes' => rand(0, 2),
                        ]);
                    }
                }
            }

            // Update tool's average rating
            $tool->updateAverageRating();

            $this->command->info("Seeded {$ratingCount} ratings and {$commentCount} comments for tool: {$tool->name}");
        }

        $this->command->info('✓ Comments and ratings seeded successfully!');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JournalEntry;
use App\Models\User;
use Carbon\Carbon;

class JournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            $this->command->warn('No users found. Please create a user first.');
            return;
        }

        JournalEntry::create([
            'user_id' => $user->id,
            'title' => '🚀 Epic Day at VibeCoding Academy!',
            'content' => "What an incredible day of development! Today I focused on building out the complete VibeCoding Academy platform with several major accomplishments:\n\n🎨 **Theme System**: Implemented a beautiful dark mode theme system with CSS variables throughout the entire application. The interface now seamlessly transitions between light and dark modes with smooth animations and proper color contrast.\n\n👤 **User Registration**: Built a complete registration system with proper validation, error handling, and user feedback. New users can now join the academy and start their coding journey!\n\n🔧 **Code Quality**: Refactored multiple components to improve maintainability and readability. Added proper error handling, loading states, and edge case management throughout the application.\n\n📚 **Documentation**: Created comprehensive documentation including QUICK_REFERENCE.md with common commands and workflows, making it easier for the team to work with the codebase.\n\n📖 **Journal System**: Designed and implemented this amazing Adventure Journal feature to track daily progress, moods, and achievements. It includes XP tracking, mood indicators, tagging system, and statistics dashboard.\n\nThe journey continues tomorrow with even more exciting features! 💪",
            'mood' => 'victorious',
            'tags' => ['Backend', 'Frontend', 'Refactor', 'Docs', 'Feature Quest'],
            'xp' => 85,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->command->info('Journal entry seeded successfully for user: ' . $user->name);
    }
}

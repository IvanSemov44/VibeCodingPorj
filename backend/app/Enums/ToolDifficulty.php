<?php

declare(strict_types=1);

namespace App\Enums;

enum ToolDifficulty: string
{
    case BEGINNER = 'beginner';
    case INTERMEDIATE = 'intermediate';
    case ADVANCED = 'advanced';
    case EXPERT = 'expert';

    public function label(): string
    {
        return match ($this) {
            self::BEGINNER => 'Beginner',
            self::INTERMEDIATE => 'Intermediate',
            self::ADVANCED => 'Advanced',
            self::EXPERT => 'Expert',
        };
    }

    public function level(): int
    {
        return match ($this) {
            self::BEGINNER => 1,
            self::INTERMEDIATE => 2,
            self::ADVANCED => 3,
            self::EXPERT => 4,
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::BEGINNER => 'green',
            self::INTERMEDIATE => 'blue',
            self::ADVANCED => 'orange',
            self::EXPERT => 'red',
        };
    }
}

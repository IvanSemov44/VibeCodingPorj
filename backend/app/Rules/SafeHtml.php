<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates that HTML content only contains allowed tags.
 */
final class SafeHtml implements ValidationRule
{
    /**
     * Allowed HTML tags.
     *
     * @var array<string>
     */
    private array $allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre'];

    /**
     * Create a new rule instance with optional custom allowed tags.
     *
     * @param array<string>|null $allowedTags
     */
    public function __construct(?array $allowedTags = null)
    {
        if ($allowedTags !== null) {
            $this->allowedTags = $allowedTags;
        }
    }

    /**
     * Run the validation rule.
     *
     * @param string $attribute
     * @param mixed $value
     * @param Closure $fail
     * @return void
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('The :attribute must be a string.');
            return;
        }

        // Build allowed tags string for strip_tags
        $allowedTagsString = '<' . implode('><', $this->allowedTags) . '>';
        $stripped = strip_tags($value, $allowedTagsString);

        if ($stripped !== $value) {
            $fail('The :attribute contains disallowed HTML tags.');
        }
    }
}

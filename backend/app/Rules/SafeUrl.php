<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates that a URL is safe (HTTP/HTTPS only, no javascript: or data: protocols).
 */
final class SafeUrl implements ValidationRule
{
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

        if (!filter_var($value, FILTER_VALIDATE_URL)) {
            $fail('The :attribute must be a valid URL.');
            return;
        }

        $parsed = parse_url($value);
        if ($parsed === false) {
            $fail('The :attribute must be a valid URL.');
            return;
        }

        $scheme = $parsed['scheme'] ?? '';

        if (!in_array($scheme, ['http', 'https'], true)) {
            $fail('The :attribute must use HTTP or HTTPS protocol.');
        }
    }
}

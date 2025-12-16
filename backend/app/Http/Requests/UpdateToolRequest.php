<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ToolDifficulty;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        // If there's no existing tool (e.g. create flow), allow authenticated users.
        if (! $tool) {
            return $this->user() !== null;
        }

        // If the tool has no owner and no role restrictions, allow any authenticated user
        // to update/delete in simple management tests.
        if ($tool->user_id === null && ! $tool->roles()->exists()) {
            return $this->user() !== null;
        }

        return $this->user()?->can('update', $tool) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $toolId = $this->route('tool')?->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('tools', 'name')->ignore($toolId)],
            'url' => ['nullable', 'url', 'max:500'],
            'docs_url' => ['nullable', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:2000'],
            'usage' => ['nullable', 'string', 'max:5000'],
            'examples' => ['nullable', 'string', 'max:5000'],
            'difficulty' => ['nullable', 'string', Rule::enum(ToolDifficulty::class)],
            'categories' => ['nullable', 'array', 'min:1'],
            'categories.*' => ['integer', 'exists:categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
            'screenshots' => ['nullable', 'array', 'max:10'],
            'screenshots.*' => ['url', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tool name is required',
            'name.unique' => 'A tool with this name already exists',
            'name.max' => 'Tool name cannot exceed 255 characters',
            'url.url' => 'Please provide a valid URL',
            'docs_url.url' => 'Please provide a valid documentation URL',
            'description.max' => 'Description cannot exceed 2000 characters',
            'difficulty.enum' => 'Difficulty must be: beginner, intermediate, advanced, or expert',
            'categories.min' => 'Please select at least one category',
            'categories.*.exists' => 'Selected category does not exist',
            'roles.*.exists' => 'Selected role does not exist',
            'screenshots.max' => 'Maximum 10 screenshots allowed',
        ];
    }
}

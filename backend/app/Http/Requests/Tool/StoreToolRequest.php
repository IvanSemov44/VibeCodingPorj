<?php

namespace App\Http\Requests\Tool;

use Illuminate\Foundation\Http\FormRequest;

class StoreToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Use the FormRequest user() helper which is type-safe for authorization checks
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:tools,name',
            'url' => 'nullable|url|max:500',
            'docs_url' => 'nullable|url|max:500',
            'description' => 'nullable|string|max:2000',
            'usage' => 'nullable|string|max:5000',
            'examples' => 'nullable|string|max:5000',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced,expert',
            'categories' => 'nullable|array|min:1',
            'categories.*' => 'integer|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'roles' => 'nullable|array',
            'roles.*' => 'integer|exists:roles,id',
            'screenshots' => 'nullable|array|max:10',
            'screenshots.*' => 'url|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
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
            'difficulty.in' => 'Difficulty must be: beginner, intermediate, advanced, or expert',
            'categories.min' => 'Please select at least one category',
            'categories.*.exists' => 'Selected category does not exist',
            'roles.*.exists' => 'Selected role does not exist',
            'screenshots.max' => 'Maximum 10 screenshots allowed',
        ];
    }
}

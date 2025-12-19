<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateJournalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string|max:10000',
            'mood' => 'sometimes|required|string|in:happy,sad,neutral,excited,angry',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'journal entry title',
            'content' => 'journal entry content',
            'mood' => 'mood',
            'tags' => 'tags',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Journal title cannot exceed 255 characters.',
            'content.max' => 'Journal content cannot exceed 10000 characters.',
            'mood.in' => 'Invalid mood. Allowed: happy, sad, neutral, excited, angry.',
            'tags.max' => 'You can add up to 10 tags.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
        ];
    }
}

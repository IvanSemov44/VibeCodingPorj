<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\Tool\StoreToolRequest;
use App\Models\Category;
use App\Models\Tool;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreToolRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_data_passes_validation(): void
    {
        $category = Category::factory()->create();

        $data = [
            'name' => 'My Tool',
            'url' => 'https://example.com',
            'description' => 'A useful tool',
            'difficulty' => 'beginner',
            'categories' => [$category->id],
            'tags' => ['devops', 'ci'],
            'screenshots' => ['https://example.com/1.png'],
        ];

        $validator = Validator::make($data, (new StoreToolRequest)->rules());

        $this->assertFalse($validator->fails(), (string) json_encode($validator->errors()->toArray()));
    }

    public function test_name_is_required(): void
    {
        $data = [
            'url' => 'https://example.com',
        ];

        $validator = Validator::make($data, (new StoreToolRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('name'));
    }

    public function test_name_must_be_unique(): void
    {
        Tool::factory()->create(['name' => 'Existing Tool']);

        $data = ['name' => 'Existing Tool'];
        $validator = Validator::make($data, (new StoreToolRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('name'));
    }

    public function test_invalid_url_fails_validation(): void
    {
        $data = ['name' => 'Tool X', 'url' => 'not-a-url'];

        $validator = Validator::make($data, (new StoreToolRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('url'));
    }

    public function test_categories_must_exist(): void
    {
        $data = ['name' => 'Tool X', 'categories' => [99999]];

        $validator = Validator::make($data, (new StoreToolRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('categories.0'));
    }

    public function test_screenshots_array_max_limit(): void
    {
        $screens = [];
        for ($i = 0; $i < 11; $i++) {
            $screens[] = 'https://example.com/'.$i.'.png';
        }

        $data = ['name' => 'Tool X', 'screenshots' => $screens];

        $validator = Validator::make($data, (new StoreToolRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('screenshots'));
    }
}

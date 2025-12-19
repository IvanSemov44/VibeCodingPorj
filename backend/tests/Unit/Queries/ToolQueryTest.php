<?php

declare(strict_types=1);

namespace Tests\Unit\Queries;

use App\Enums\ToolStatus;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Tool;
use App\Queries\ToolQuery;
use Tests\TestCase;
use Tests\Traits\CreatesTools;

class ToolQueryTest extends TestCase
{
    use CreatesTools;

    public function test_can_filter_by_status(): void
    {
        $approved = $this->createApprovedTools(2);
        $pending = $this->createPendingTools(2);

        $tools = ToolQuery::make()
            ->approved()
            ->getQuery()
            ->get();

        $this->assertCount(2, $tools);
        $this->assertTrue($tools->every(fn ($t) => $t->status === ToolStatus::APPROVED));
    }

    public function test_can_filter_by_category(): void
    {
        $category = Category::factory()->create(['slug' => 'web-dev']);
        $tool = $this->createApprovedTool();
        $tool->categories()->attach($category);

        $tools = ToolQuery::make()
            ->approved()
            ->withCategory('web-dev')
            ->getQuery()
            ->get();

        $this->assertCount(1, $tools);
        $this->assertTrue($tools->first()->categories->contains($category));
    }

    public function test_can_filter_by_tag(): void
    {
        $tag = Tag::factory()->create(['slug' => 'javascript']);
        $tool = $this->createApprovedTool();
        $tool->tags()->attach($tag);

        $tools = ToolQuery::make()
            ->approved()
            ->withTag('javascript')
            ->getQuery()
            ->get();

        $this->assertCount(1, $tools);
        $this->assertTrue($tools->first()->tags->contains($tag));
    }

    public function test_can_filter_by_multiple_tags(): void
    {
        $tag1 = Tag::factory()->create(['slug' => 'javascript']);
        $tag2 = Tag::factory()->create(['slug' => 'frontend']);

        $tool1 = $this->createApprovedTool();
        $tool1->tags()->attach([$tag1, $tag2]);

        $tools = ToolQuery::make()
            ->approved()
            ->withTags(['javascript', 'frontend'])
            ->getQuery()
            ->get();

        $this->assertCount(1, $tools);
    }

    public function test_can_order_by_name(): void
    {
        $this->createApprovedTool(['name' => 'Zebra']);
        $this->createApprovedTool(['name' => 'Alpha']);
        $this->createApprovedTool(['name' => 'Beta']);

        $tools = ToolQuery::make()
            ->approved()
            ->orderByName()
            ->getQuery()
            ->get();

        $this->assertEquals('Alpha', $tools->first()->name);
        $this->assertEquals('Zebra', $tools->last()->name);
    }

    public function test_can_chain_multiple_filters(): void
    {
        $category = Category::factory()->create();
        $tag = Tag::factory()->create();

        $tool = $this->createApprovedTool(['name' => 'Test Tool']);
        $tool->categories()->attach($category);
        $tool->tags()->attach($tag);

        $this->createApprovedTool(); // Other tool

        $tools = ToolQuery::make()
            ->approved()
            ->withCategory($category->slug)
            ->withTag($tag->slug)
            ->orderByName()
            ->getQuery()
            ->get();

        $this->assertCount(1, $tools);
        $this->assertEquals('Test Tool', $tools->first()->name);
    }

    public function test_pending_scope(): void
    {
        $this->createPendingTools(3);
        $this->createApprovedTools(2);

        $tools = ToolQuery::make()
            ->pending()
            ->getQuery()
            ->get();

        $this->assertCount(3, $tools);
    }
}

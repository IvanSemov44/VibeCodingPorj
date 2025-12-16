<?php

namespace Database\Seeders;

use App\Models\Tool;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ToolSeeder extends Seeder
{
    public function run(): void
    {
        // Avoid running sample-heavy seeders in production by default
        if (app()->environment('production') && ! filter_var(env('ALLOW_SEED_IN_PRODUCTION', 'false'), FILTER_VALIDATE_BOOLEAN)) {
            return;
        }

        // Create example tools (includes many entries to exercise pagination)
        DB::transaction(function () {
            $this->runTools();
        });
    }

    protected function runTools(): void
    {
        $tools = [
            ['name' => 'OpenAI Playground', 'url' => 'https://platform.openai.com/playground', 'docs_url' => 'https://platform.openai.com/docs', 'description' => 'Interactive environment to test OpenAI models', 'usage' => 'Use to test prompts and model behavior'],
            ['name' => 'Hugging Face', 'url' => 'https://huggingface.co', 'docs_url' => 'https://huggingface.co/docs', 'description' => 'Model hub and inference API', 'usage' => 'Search and host models'],
            ['name' => 'Cohere', 'url' => 'https://cohere.ai', 'docs_url' => 'https://docs.cohere.ai', 'description' => 'NLP models and embeddings API', 'usage' => 'Text generation and embeddings'],
            ['name' => 'Anthropic Claude', 'url' => 'https://www.anthropic.com', 'docs_url' => 'https://console.anthropic.com/docs', 'description' => 'Claude family of assistant models', 'usage' => 'Conversational AI and assistants'],
            ['name' => 'Replicate', 'url' => 'https://replicate.com', 'docs_url' => 'https://replicate.com/docs', 'description' => 'Run machine learning models in the cloud', 'usage' => 'Deploy and run community models'],
            ['name' => 'Runway', 'url' => 'https://runwayml.com', 'docs_url' => 'https://docs.runwayml.com', 'description' => 'Creative tools for video and images using ML', 'usage' => 'Video editing and generative media'],
            ['name' => 'Stability AI', 'url' => 'https://stability.ai', 'docs_url' => 'https://platform.stability.ai/docs', 'description' => 'Generative image models and tools', 'usage' => 'Image generation and research'],
            ['name' => 'Midjourney', 'url' => 'https://www.midjourney.com', 'docs_url' => '', 'description' => 'AI image generation via Discord bot', 'usage' => 'Creative image prompts and generation'],
            ['name' => 'DALL-E', 'url' => 'https://openai.com/dall-e-2', 'docs_url' => 'https://platform.openai.com/docs/guides/images', 'description' => 'Image generation from text prompts', 'usage' => 'Create images from prompts'],
            ['name' => 'DeepL', 'url' => 'https://www.deepl.com', 'docs_url' => 'https://www.deepl.com/docs-api', 'description' => 'High-quality machine translation', 'usage' => 'Translate text with neural models'],
            ['name' => 'LangChain', 'url' => 'https://langchain.com', 'docs_url' => 'https://python.langchain.com/en/latest/', 'description' => 'Framework for building LLM applications', 'usage' => 'Chain prompts, agents, and tools'],
            ['name' => 'Pinecone', 'url' => 'https://www.pinecone.io', 'docs_url' => 'https://docs.pinecone.io', 'description' => 'Managed vector database for embeddings', 'usage' => 'Index and search vector embeddings'],
            ['name' => 'Qdrant', 'url' => 'https://qdrant.tech', 'docs_url' => 'https://qdrant.tech/documentation', 'description' => 'Open-source vector search engine', 'usage' => 'Similarity search for embeddings'],
            ['name' => 'Weaviate', 'url' => 'https://www.semi.technology', 'docs_url' => 'https://weaviate.io/developers', 'description' => 'Vector search engine with graph capabilities', 'usage' => 'Semantic search and knowledge graphs'],
            ['name' => 'Paperspace', 'url' => 'https://www.paperspace.com', 'docs_url' => 'https://docs.paperspace.com', 'description' => 'Cloud GPU instances and ML infrastructure', 'usage' => 'Train models and run notebooks'],
            ['name' => 'Gradio', 'url' => 'https://gradio.app', 'docs_url' => 'https://gradio.app/docs/', 'description' => 'Easy UI for ML demos', 'usage' => 'Build shareable model interfaces'],
            ['name' => 'Streamlit', 'url' => 'https://streamlit.io', 'docs_url' => 'https://docs.streamlit.io', 'description' => 'Apps for ML and data apps', 'usage' => 'Quick web apps for models'],
            ['name' => 'Roboflow', 'url' => 'https://roboflow.com', 'docs_url' => 'https://docs.roboflow.com', 'description' => 'Computer vision dataset tooling', 'usage' => 'Label, preprocess, and serve CV models'],
            ['name' => 'Labelbox', 'url' => 'https://labelbox.com', 'docs_url' => 'https://docs.labelbox.com', 'description' => 'Data labeling platform', 'usage' => 'Manage labeled datasets for ML training'],
            ['name' => 'Supervise.ly', 'url' => 'https://supervise.ly', 'docs_url' => 'https://docs.supervise.ly', 'description' => 'Annotation and model training platform', 'usage' => 'CV dataset annotation and training'],
            ['name' => 'LlamaIndex', 'url' => 'https://llamaindex.ai', 'docs_url' => 'https://gpt-index.readthedocs.io', 'description' => 'Indexing and retrieval for LLMs', 'usage' => 'Connect documents to LLM queries'],
            ['name' => 'Papers With Code', 'url' => 'https://paperswithcode.com', 'docs_url' => '', 'description' => 'Research papers connected to code and benchmarks', 'usage' => 'Discover ML research and code'],
            ['name' => 'TensorFlow Hub', 'url' => 'https://tfhub.dev', 'docs_url' => 'https://www.tensorflow.org/hub', 'description' => 'Repository of reusable ML modules', 'usage' => 'Find pretrained models for TensorFlow'],
            ['name' => 'PyTorch Hub', 'url' => 'https://pytorch.org/hub', 'docs_url' => 'https://pytorch.org/hub', 'description' => 'Pretrained models for PyTorch', 'usage' => 'Load community models easily'],
            ['name' => 'MLflow', 'url' => 'https://mlflow.org', 'docs_url' => 'https://www.mlflow.org/docs', 'description' => 'Experiment tracking and model registry', 'usage' => 'Track experiments and deploy models'],
            ['name' => 'DataRobot', 'url' => 'https://www.datarobot.com', 'docs_url' => 'https://docs.datarobot.com', 'description' => 'Enterprise AutoML platform', 'usage' => 'Automate model building and deployment'],
            ['name' => 'Dataiku', 'url' => 'https://www.dataiku.com', 'docs_url' => 'https://doc.dataiku.com', 'description' => 'Collaborative data science platform', 'usage' => 'End-to-end ML pipelines and governance'],
            ['name' => 'Algorithmia', 'url' => 'https://algorithmia.com', 'docs_url' => 'https://algorithmia.com/developers', 'description' => 'Model deployment and serving', 'usage' => 'Serve ML models at scale'],
            ['name' => 'SuperAnnotate', 'url' => 'https://superannotate.com', 'docs_url' => 'https://docs.superannotate.com', 'description' => 'Annotation platform for computer vision', 'usage' => 'High-quality labeling workflows'],
            ['name' => 'Vectara', 'url' => 'https://vectara.com', 'docs_url' => 'https://docs.vectara.com', 'description' => 'Semantic search and retrieval-as-a-service', 'usage' => 'Natural language search over documents'],
            ['name' => 'Qwak', 'url' => 'https://www.qwak.com', 'docs_url' => 'https://docs.qwak.ai', 'description' => 'Infrastructure for ML model deployments', 'usage' => 'Deploy, monitor, and iterate models'],
        ];

        // Ensure categories, tags and roles exist before attaching
        $categoryIds = \App\Models\Category::pluck('id')->toArray();
        $tagIds = \App\Models\Tag::pluck('id')->toArray();
        $roleIds = \Spatie\Permission\Models\Role::pluck('id')->toArray();

        foreach ($tools as $t) {
            // Add 1-2 screenshot URLs using picsum seeded by slug
            $slug = \Illuminate\Support\Str::slug($t['name']);
            $t['screenshots'] = [
                "https://picsum.photos/seed/{$slug}-1/800/480",
            ];
            if (rand(0, 1) === 1) {
                $t['screenshots'][] = "https://picsum.photos/seed/{$slug}-2/800/480";
            }
            $tool = Tool::firstOrCreate(['name' => $t['name']], $t);

            // Attach a random category (or none) without detaching existing relations
            if (! empty($categoryIds)) {
                $randCat = [$categoryIds[array_rand($categoryIds)]];
                $tool->categories()->syncWithoutDetaching($randCat);
            }

            // Attach 0-3 random tags without detaching existing ones
            if (! empty($tagIds)) {
                shuffle($tagIds);
                $take = rand(0, min(3, count($tagIds)));
                $tool->tags()->syncWithoutDetaching(array_slice($tagIds, 0, $take));
            }

            // Attach 0-2 random roles without detaching existing ones
            if (! empty($roleIds)) {
                shuffle($roleIds);
                $rTake = rand(0, min(2, count($roleIds)));
                $tool->roles()->syncWithoutDetaching(array_slice($roleIds, 0, $rTake));
            }
            // Ensure each tool has an owner if one is not already set.
            if (empty($tool->submitted_by)) {
                // Prefer a user with the 'owner' role, fall back to any user.
                $owner = null;
                try {
                    $owner = \App\Models\User::role('owner')->inRandomOrder()->first();
                } catch (\Throwable $e) {
                    // If roles are not available or the role query fails, ignore and fallback
                }

                if (! $owner) {
                    $owner = \App\Models\User::inRandomOrder()->first();
                }

                if ($owner) {
                    $tool->user()->associate($owner);
                    $tool->save();
                }
            }
        }
    }
}

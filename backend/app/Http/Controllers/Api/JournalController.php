<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\JournalEntryData;
use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Http\Resources\JournalEntryResource;
use App\Models\JournalEntry;
use App\Services\JournalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class JournalController
{
    public function __construct(
        private JournalService $service,
    ) {}

    /**
     * Display user's journal entries.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $entries = auth()->user()->journalEntries()
            ->when($request->input('mood'), fn ($q) =>
                $q->where('mood', $request->input('mood'))
            )
            ->when($request->input('tag'), fn ($q) =>
                $q->whereJsonContains('tags', $request->input('tag'))
            )
            ->latest()
            ->paginate($request->input('per_page', 15));

        return JournalEntryResource::collection($entries);
    }

    /**
     * Store a new journal entry.
     *
     * @param StoreJournalRequest $request
     * @return JsonResponse
     */
    public function store(StoreJournalRequest $request): JsonResponse
    {
        $this->authorize('create', JournalEntry::class);

        $data = JournalEntryData::fromRequest(array_merge(
            $request->validated(),
            ['user_id' => auth()->id()]
        ));

        $entry = $this->service->create($data, auth()->user());

        return response()->json(
            new JournalEntryResource($entry),
            201
        );
    }

    /**
     * Display the specified entry.
     *
     * @param JournalEntry $entry
     * @return JournalEntryResource
     */
    public function show(JournalEntry $entry): JournalEntryResource
    {
        $this->authorize('view', $entry);

        return new JournalEntryResource($entry);
    }

    /**
     * Update the specified entry.
     *
     * @param JournalEntry $entry
     * @param UpdateJournalRequest $request
     * @return JournalEntryResource
     */
    public function update(
        JournalEntry $entry,
        UpdateJournalRequest $request
    ): JournalEntryResource {
        $this->authorize('update', $entry);

        $data = JournalEntryData::fromRequest($request->validated());
        $updated = $this->service->update($entry, $data, auth()->user());

        return new JournalEntryResource($updated);
    }

    /**
     * Delete the specified entry.
     *
     * @param JournalEntry $entry
     * @return JsonResponse
     */
    public function destroy(JournalEntry $entry): JsonResponse
    {
        $this->authorize('delete', $entry);

        $this->service->delete($entry, auth()->user());

        return response()->json(null, 204);
    }

    /**
     * Get journal statistics.
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        $entries = auth()->user()->journalEntries();

        return response()->json([
            'total_entries' => $entries->count(),
            'mood_breakdown' => [
                'happy' => $entries->where('mood', 'happy')->count(),
                'sad' => $entries->where('mood', 'sad')->count(),
                'neutral' => $entries->where('mood', 'neutral')->count(),
                'excited' => $entries->where('mood', 'excited')->count(),
                'angry' => $entries->where('mood', 'angry')->count(),
            ],
            'this_week' => $entries->where('created_at', '>=', now()->subWeek())->count(),
            'this_month' => $entries->where('created_at', '>=', now()->subMonth())->count(),
        ]);
    }
}

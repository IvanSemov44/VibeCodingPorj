<?php

namespace App\Http\Middleware;

use App\Models\Tool;
use App\Models\ToolView;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackToolView
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only track views on tool show page (GET /tools/{id})
        if ($request->isMethod('GET') && preg_match('#^/api/tools/(\d+)$#', $request->getPathInfo(), $matches)) {
            $toolId = (int) $matches[1];

            // Verify tool exists
            if (Tool::find($toolId)) {
                // Queue the view tracking to avoid slowing down request
                dispatch(function () use ($toolId, $request) {
                    ToolView::create([
                        'tool_id' => $toolId,
                        'user_id' => auth()->id(),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'referer' => $request->header('referer'),
                        'viewed_at' => now(),
                    ]);

                    // Update tool's view count and last viewed timestamp
                    $tool = Tool::find($toolId);
                    if ($tool) {
                        $tool->update([
                            'view_count' => $tool->view_count + 1,
                            'last_viewed_at' => now(),
                        ]);
                    }
                });
            }
        }

        return $response;
    }
}

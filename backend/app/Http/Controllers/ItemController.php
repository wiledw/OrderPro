<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class ItemController extends Controller
{
    /**
     * Number of items per page
     */
    private const PER_PAGE = 10;

    /**
     * Get paginated and sorted items
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Item::query();

            // Handle sorting
            $sortDirection = $request->query('sort', 'asc');
            if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
                $sortDirection = 'asc';
            }
            $query->orderBy('price', $sortDirection);

            // Handle pagination
            $page = max(1, intval($request->query('page', 1)));
            $perPage = max(1, intval($request->query('per_page', self::PER_PAGE)));
            
            $items = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $items->items(),
                    'pagination' => [
                        'current_page' => $items->currentPage(),
                        'per_page' => $items->perPage(),
                        'total' => $items->total(),
                        'last_page' => $items->lastPage(),
                        'has_more' => $items->hasMorePages()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch items', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch items',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a new item
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Check if the authenticated user is an admin
        $user = Auth::user();
        if (!$user || !$user->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: You do not have permission to add items.'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0'
            ]);

            // Create a new item
            $item = Item::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Item created successfully',
                'data' => $item
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            Log::error('Failed to create item', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create item',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Item;
use App\Models\User;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    /**
     * Order status transition map
     * Defines allowed transitions between order statuses
     * 
     * @var array<string, string>
     */
    private const STATUS_TRANSITIONS = [
        'pending' => 'processing',
        'processing' => 'shipped',
        'shipped' => 'delivered',
    ];

    /**
     * Valid order statuses
     * 
     * @var array<string>
     */
    private const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

    /**
     * Retrieve orders based on user role
     * For admin users: Returns all orders with items and user details
     * For regular users: Returns only their own orders with items
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                throw new \RuntimeException('User not authenticated');
            }

            $orders = $this->getOrdersByUserRole($user);

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve orders', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new order with the given items
     * Validates items existence and quantities
     * Calculates total amount and creates order with items
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Order creation initiated', ['request_data' => $request->all()]);

            $validatedData = $this->validateOrderRequest($request);
            $user = $this->getAuthenticatedUser();
            
            $order = $this->createOrder($user, $validatedData['items']);

            Log::info('Order created successfully', [
                'order_id' => $order->id,
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order->load('items')
            ], Response::HTTP_CREATED);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update order status with validation of status transitions
     * Only admin users can update order status
     * Status can only progress forward according to STATUS_TRANSITIONS
     *
     * @param Request $request
     * @param int $orderId
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $orderId): JsonResponse
    {
        try {
            Log::info('Status update initiated', [
                'order_id' => $orderId,
                'requested_status' => $request->status
            ]);

            $this->validateStatusUpdateRequest($request);
            $user = $this->getAuthenticatedUser();
            
            if (!$user->is_admin) {
                throw new \RuntimeException('Unauthorized access: Admin privileges required');
            }

            $order = $this->getOrderById($orderId);
            $this->validateStatusTransition($order, $request->status);
            
            // Update status and log change
            $this->updateOrderStatus($order, $request->status);

            return response()->json([
                'success' => true,
                'message' => "Order status updated to '{$order->status}'",
                'data' => $order->load(['items', 'statusHistories'])
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_FORBIDDEN);

        } catch (\Exception $e) {
            Log::error('Status update failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get orders based on user role
     *
     * @param User $user
     * @return Collection
     */
    private function getOrdersByUserRole(User $user): Collection
    {
        if ($user->is_admin) {
            return Order::with(['items', 'user'])->get();
        }
        return $user->orders()->with('items')->get();
    }

    /**
     * Validate order creation request
     *
     * @param Request $request
     * @return array
     * @throws ValidationException
     */
    private function validateOrderRequest(Request $request): array
    {
        return $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);
    }

    /**
     * Create order with items and calculate total
     * Also logs initial status history
     *
     * @param User $user
     * @param array $items
     * @return Order
     */
    private function createOrder(User $user, array $items): Order
    {
        try {
            $total = 0;
            $order = $user->orders()->create([
                'total_amount' => 0,
                'status' => 'pending',
            ]);

            // Log initial status
            $this->logStatusChange($order, null, 'pending', $user->id);

            foreach ($items as $orderItem) {
                $item = Item::findOrFail($orderItem['id']);
                $quantity = $orderItem['quantity'];
                $total += $item->price * $quantity;

                $order->items()->attach($item->id, ['quantity' => $quantity]);
            }

            $order->update(['total_amount' => $total]);
            return $order;

        } catch (\Exception $e) {
            Log::error('Failed to create order and log status', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Update order status and log the change
     *
     * @param Order $order
     * @param string $newStatus
     * @return void
     */
    private function updateOrderStatus(Order $order, string $newStatus): void
    {
        try {
            $oldStatus = $order->status;
            
            $order->update(['status' => $newStatus]);
            
            $this->logStatusChange($order, $oldStatus, $newStatus, Auth::id());

        } catch (\Exception $e) {
            Log::error('Failed to update order status and log change', [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Log status change in order history
     *
     * @param Order $order
     * @param string|null $fromStatus
     * @param string $toStatus
     * @param int $changedBy
     * @return void
     */
    private function logStatusChange(Order $order, ?string $fromStatus, string $toStatus, int $changedBy): void
    {
        try {
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'changed_by' => $changedBy,
            ]);

            Log::info('Order status change logged', [
                'order_id' => $order->id,
                'from' => $fromStatus ?? 'null',
                'to' => $toStatus,
                'changed_by' => $changedBy
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to log status change', [
                'order_id' => $order->id,
                'from' => $fromStatus ?? 'null',
                'to' => $toStatus,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Validate status update request
     *
     * @param Request $request
     * @throws ValidationException
     */
    private function validateStatusUpdateRequest(Request $request): void
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', self::VALID_STATUSES),
        ]);
    }

    /**
     * Get authenticated user or throw exception
     *
     * @return User
     * @throws \RuntimeException
     */
    private function getAuthenticatedUser(): User
    {
        $user = Auth::user();
        if (!$user) {
            throw new \RuntimeException('User not authenticated');
        }
        return $user;
    }

    /**
     * Get order by ID or throw exception
     *
     * @param int $orderId
     * @return Order
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    private function getOrderById(int $orderId): Order
    {
        return Order::findOrFail($orderId);
    }

    /**
     * Validate order status transition
     *
     * @param Order $order
     * @param string $newStatus
     * @throws \RuntimeException
     */
    private function validateStatusTransition(Order $order, string $newStatus): void
    {
        if (!isset(self::STATUS_TRANSITIONS[$order->status]) || 
            self::STATUS_TRANSITIONS[$order->status] !== $newStatus) {
            throw new \RuntimeException(
                "Invalid status transition from '{$order->status}' to '{$newStatus}'"
            );
        }
    }

    /**
     * Get order tracking history with status changes
     * Only accessible by order owner or admin users
     *
     * @param int $id
     * @return JsonResponse
     */
    public function getTracking(int $id): JsonResponse
    {
        try {
            Log::info('Tracking information requested', ['order_id' => $id]);

            $order = Order::with('statusHistories.user')
                         ->findOrFail($id);

            $user = $this->getAuthenticatedUser();
            
            // Authorize access
            if ($user->id !== $order->user_id && !$user->is_admin) {
                Log::warning('Unauthorized tracking access attempt', [
                    'order_id' => $id,
                    'user_id' => $user->id
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view this order\'s tracking information'
                ], Response::HTTP_FORBIDDEN);
            }

            Log::info('Tracking information retrieved', [
                'order_id' => $id,
                'status_count' => $order->statusHistories->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'current_status' => $order->status,
                    'tracking_history' => $order->statusHistories->map(function ($history) {
                        return [
                            'from_status' => $history->from_status,
                            'to_status' => $history->to_status,
                            'changed_by' => [
                                'id' => $history->user->id,
                                'name' => $history->user->name
                            ],
                            'changed_at' => $history->created_at
                        ];
                    })
                ]
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Order not found for tracking', ['order_id' => $id]);
            
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], Response::HTTP_NOT_FOUND);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve tracking information', [
                'order_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tracking information',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

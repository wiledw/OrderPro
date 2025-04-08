<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Validation rules for registration
     *
     * @var array<string, string>
     */
    private const REGISTRATION_RULES = [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6|confirmed',
    ];

    /**
     * Validation rules for login
     *
     * @var array<string, string>
     */
    private const LOGIN_RULES = [
        'email' => 'required|email',
        'password' => 'required',
    ];

    /**
     * Register a new user
     * Creates a new user account and returns an authentication token
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            Log::info('User registration initiated', ['email' => $request->email]);

            $validatedData = $this->validateRegistrationRequest($request);
            $user = $this->createUser($validatedData);
            $token = $this->generateAuthToken($user);

            Log::info('User registered successfully', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], Response::HTTP_CREATED);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Authenticate user and issue token
     * Validates credentials and returns an authentication token
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        try {
            Log::info('Login attempt', ['email' => $request->email]);

            $validatedData = $this->validateLoginRequest($request);
            $user = $this->authenticateUser($validatedData);
            $token = $this->generateAuthToken($user);

            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
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
                'message' => 'Invalid credentials'
            ], Response::HTTP_UNAUTHORIZED);

        } catch (\Exception $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get authenticated user's information
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $this->getAuthenticatedUser();

            return response()->json([
                'success' => true,
                'data' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve user information', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user information',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Logout user by revoking all tokens
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $this->getAuthenticatedUser();
            $this->revokeUserTokens($user);

            Log::info('User logged out successfully', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Logout failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Validate registration request data
     *
     * @param Request $request
     * @return array
     * @throws ValidationException
     */
    private function validateRegistrationRequest(Request $request): array
    {
        return $request->validate(self::REGISTRATION_RULES);
    }

    /**
     * Validate login request data
     *
     * @param Request $request
     * @return array
     * @throws ValidationException
     */
    private function validateLoginRequest(Request $request): array
    {
        return $request->validate(self::LOGIN_RULES);
    }

    /**
     * Create a new user
     *
     * @param array $data
     * @return User
     */
    private function createUser(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'is_admin' => false // Ensure new users are not admins by default
        ]);
    }

    /**
     * Authenticate user with provided credentials
     *
     * @param array $credentials
     * @return User
     * @throws \RuntimeException
     */
    private function authenticateUser(array $credentials): User
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new \RuntimeException('Invalid credentials');
        }

        return $user;
    }

    /**
     * Generate authentication token for user
     *
     * @param User $user
     * @return string
     */
    private function generateAuthToken(User $user): string
    {
        return $user->createToken('auth_token')->plainTextToken;
    }

    /**
     * Get authenticated user
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
     * Revoke all tokens for a user
     *
     * @param User $user
     * @return void
     */
    private function revokeUserTokens(User $user): void
    {
        $user->tokens()->delete();
    }
}

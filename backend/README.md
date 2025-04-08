<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

## Order Management System – Backend (Laravel)

This is the backend API for an order management system built with **Laravel** and **MySQL** database. It supports user authentication, order creation, admin management of orders, and order tracking history.


## 📦 Features

### ✅ Authentication
- **Register / Login** using email and password
- **Authentication** via Laravel Sanctum
- `is_admin` flag in users table to distinguish admin from normal users

### 🛒 Orders
- Authenticated users can:
  - Create orders with multiple items
  - View their own orders
  - View order status changes
- Admin users can:
  - View all orders
  - Update order status

### 🧾 Order Status Tracking
- Order status history is logged whenever status changes:
  - `pending` → `processing` → `shipped` → `delivered`
  - Status cannot go backward
- Tracks:
  - Who made the change
  - When it happened

---
## 🛠️ Setup Instructions
```bash
git clone https://github.com/[username]/PillwayAssesment.git
cd PillwayAssesment
```
Install dependencies
```bash
composer install
```

Setup environment variables for MySQL
```bash
cp .env.example .env
```

Update `.env` with your DB settings:
```bash
DB_DATABASE=your_db_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Generate keys & migrate DB (This will create tables and insert dummy item seed data)
```bash
php artisan key:generate
php artisan migrate --seed
```

## API Endpoints

🔐 Auth Endpoints

### Register
```bash
POST /api/register
```
Request Body:
```bash
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```
Response:
```bash
{
    "user": {
        "name": "Admin User",
        "email": "admin@example.com",
        "updated_at": "2025-04-08T05:48:38.000000Z",
        "created_at": "2025-04-08T05:48:38.000000Z",
        "id": 3
    },
    "token": "5|O9uZV4lJDd3aZjxpX6mY69y51fIHlR41pwph6dgY9294f69b"
}
```

### Login
```bash
POST /api/login
```
Request Body:
```bash
{
  "email": "john@example.com",
  "password": "password"
}
```
Response:
```bash
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 2,
            "name": "John Doe",
            "email": "John@example.com",
            "email_verified_at": null,
            "created_at": "2025-04-08T04:53:00.000000Z",
            "updated_at": "2025-04-08T04:53:00.000000Z",
            "is_admin": 0
        },
        "token": "6|kdBssYiFFwgDnl8KMencQ9D2a3iNFGVnZP9AaUy01891c1ad"
    }
}
```
### 👨‍🔧 Admin Setup
Set is_admin to 1 for a user in the DB:
```bash
UPDATE users SET is_admin = 1 WHERE email = 'admin@example.com';
```

### Logout
```bash
POST /api/logout

Bearer {Token}
```

Response:
```bash
{
    "success": true,
    "message": "Logged out successfully from current device"
}
```

## Order Endpoints
All endpoints below require Authorization header:

Authorization: Bearer {token}

### Fetch Items
```bash
GET /api/items                    // Default sorting (asc) and pagination (10 items)
GET /api/items?sort=desc         // Sort by price descending
GET /api/items?page=2            // Get second page
GET /api/items?per_page=20       // Show 20 items per page
GET /api/items?sort=desc&page=2   // Combine parameters
```
Response body
```bash
{
    "success": true,
    "data": {
        "items": [
            {
                "id": 4,
                "name": "USB-C Hub",
                "price": "29.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z"
            },
            {
                "id": 1,
                "name": "Gaming Mouse",
                "price": "49.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z"
            },
            {
                "id": 2,
                "name": "Mechanical Keyboard",
                "price": "89.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z"
            },
            {
                "id": 5,
                "name": "Wireless Headset",
                "price": "119.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z"
            },
            {
                "id": 3,
                "name": "4K Monitor",
                "price": "299.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "per_page": 10,
            "total": 5,
            "last_page": 1,
            "has_more": false
        }
    }
}
```

### Create Order (User only)
```bash
POST /api/orders
```
Request Body:
```bash
{
  "items": [
    { "id": 1, "quantity": 2 },
    { "id": 3, "quantity": 1 }
  ]
}

```
Response:
```bash
{
    "success": true,
    "message": "Order created successfully",
    "data": {
        "total_amount": 399.97,
        "status": "pending",
        "user_id": 2,
        "updated_at": "2025-04-08T06:43:23.000000Z",
        "created_at": "2025-04-08T06:43:22.000000Z",
        "id": 3,
        "items": [
            {
                "id": 1,
                "name": "Gaming Mouse",
                "price": "49.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z",
                "pivot": {
                    "order_id": 3,
                    "item_id": 1,
                    "quantity": 2,
                    "created_at": "2025-04-08T06:43:23.000000Z",
                    "updated_at": "2025-04-08T06:43:23.000000Z"
                }
            },
            {
                "id": 3,
                "name": "4K Monitor",
                "price": "299.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z",
                "pivot": {
                    "order_id": 3,
                    "item_id": 3,
                    "quantity": 1,
                    "created_at": "2025-04-08T06:43:23.000000Z",
                    "updated_at": "2025-04-08T06:43:23.000000Z"
                }
            }
        ]
    }
}
```

### Get Current User Orders
```bash
GET /api/orders?status={status}
```

Response:
```bash
{
    "success": true,
    "data": [
        {
            "id": 3,
            "user_id": 2,
            "total_amount": "399.97",
            "status": "processing",
            "created_at": "2025-04-08T06:43:22.000000Z",
            "updated_at": "2025-04-08T06:53:45.000000Z",
            "items": [
                {
                    "id": 1,
                    "name": "Gaming Mouse",
                    "price": "49.99",
                    "created_at": "2025-04-08T04:50:55.000000Z",
                    "updated_at": "2025-04-08T04:50:55.000000Z",
                    "pivot": {
                        "order_id": 3,
                        "item_id": 1,
                        "quantity": 2,
                        "created_at": "2025-04-08T06:43:23.000000Z",
                        "updated_at": "2025-04-08T06:43:23.000000Z"
                    }
                },
                {
                    "id": 3,
                    "name": "4K Monitor",
                    "price": "299.99",
                    "created_at": "2025-04-08T04:50:55.000000Z",
                    "updated_at": "2025-04-08T04:50:55.000000Z",
                    "pivot": {
                        "order_id": 3,
                        "item_id": 3,
                        "quantity": 1,
                        "created_at": "2025-04-08T06:43:23.000000Z",
                        "updated_at": "2025-04-08T06:43:23.000000Z"
                    }
                }
            ]
        }
    ]
}
```

### Get Current All Orders (Admin only)
```bash
GET /api/orders
```
### Update Order Status (Admin only)
⚠️ Status can only move forward in this order: pending → processing → shipped → delivered
```bash
PATCH /api/orders/{id}/status
```

Request Body:
```bash
{
  "status": "processing"
}
```

Response Body:
```bash
{
    "success": true,
    "message": "Order status updated to 'processing'",
    "data": {
        "id": 3,
        "user_id": 2,
        "total_amount": "399.97",
        "status": "processing",
        "created_at": "2025-04-08T06:43:22.000000Z",
        "updated_at": "2025-04-08T06:53:45.000000Z",
        "items": [
            {
                "id": 1,
                "name": "Gaming Mouse",
                "price": "49.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z",
                "pivot": {
                    "order_id": 3,
                    "item_id": 1,
                    "quantity": 2,
                    "created_at": "2025-04-08T06:43:23.000000Z",
                    "updated_at": "2025-04-08T06:43:23.000000Z"
                }
            },
            {
                "id": 3,
                "name": "4K Monitor",
                "price": "299.99",
                "created_at": "2025-04-08T04:50:55.000000Z",
                "updated_at": "2025-04-08T04:50:55.000000Z",
                "pivot": {
                    "order_id": 3,
                    "item_id": 3,
                    "quantity": 1,
                    "created_at": "2025-04-08T06:43:23.000000Z",
                    "updated_at": "2025-04-08T06:43:23.000000Z"
                }
            }
        ],
        "status_histories": [
            {
                "id": 1,
                "order_id": 3,
                "from_status": null,
                "to_status": "pending",
                "changed_by": 2,
                "created_at": "2025-04-08T06:43:22.000000Z",
                "updated_at": "2025-04-08T06:43:22.000000Z"
            },
            {
                "id": 2,
                "order_id": 3,
                "from_status": "pending",
                "to_status": "processing",
                "changed_by": 3,
                "created_at": "2025-04-08T06:53:45.000000Z",
                "updated_at": "2025-04-08T06:53:45.000000Z"
            }
        ]
    }
}
```

## 🔄 Order Status History
Each order contains a status_histories array with:

1.     from_status

2.     to_status

3.     changed_by

4.     created_at

This allows both users and admins to view the order's status timeline.

### Tracking Order Status
```bash
PATCH /api/orders/[id]/tracking
```

Response Body:
```bash
{
    "success": true,
    "data": {
        "order_id": 3,
        "current_status": "processing",
        "tracking_history": [
            {
                "from_status": null,
                "to_status": "pending",
                "changed_by": {
                    "id": 2,
                    "name": "John Doe"
                },
                "changed_at": "2025-04-08T06:43:22.000000Z"
            },
            {
                "from_status": "pending",
                "to_status": "processing",
                "changed_by": {
                    "id": 3,
                    "name": "Admin User"
                },
                "changed_at": "2025-04-08T06:53:45.000000Z"
            }
        ]
    }
}
```


## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

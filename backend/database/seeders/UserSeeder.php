<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create a new customer user
        User::create([
            'name' => 'Customer User',
            'email' => 'user1@example.com',
            'password' => bcrypt('password'),
            'is_admin' => false,
        ]);

        // Create a new admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin1@example.com',
            'password' => bcrypt('password'),
            'is_admin' => 1,
        ]);
    }
}
<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['id' => 1, 'name' => 'Gaming Mouse', 'price' => 49.99],
            ['id' => 2, 'name' => 'Mechanical Keyboard', 'price' => 89.99],
            ['id' => 3, 'name' => '4K Monitor', 'price' => 299.99],
            ['id' => 4, 'name' => 'USB-C Hub', 'price' => 29.99],
            ['id' => 5, 'name' => 'Wireless Headset', 'price' => 119.99],
        ];

        foreach ($items as $item) {
            Item::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}

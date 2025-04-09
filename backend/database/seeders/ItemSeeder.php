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
            ['id' => 6, 'name' => 'Ipad Pro', 'price' => 999.99],
            ['id' => 7, 'name' => 'Wireless Mouse', 'price' => 219.99],
            ['id' => 8, 'name' => 'Wireless Keyboard', 'price' => 189.99],
            ['id' => 9, 'name' => 'Gaming Mic', 'price' => 69.99],
            ['id' => 10, 'name' => 'Mac Book Pro', 'price' => 1899.99],
            ['id' => 11, 'name' => 'Airpods', 'price' => 259.99],
            ['id' => 12, 'name' => 'Samsung Phone', 'price' => 899.99],
        ];

        foreach ($items as $item) {
            Item::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}

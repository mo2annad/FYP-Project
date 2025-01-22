<?php

namespace App\Http\Controllers\Admin;

use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'discount_percentage' => 'required|numeric|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        Promotion::create($validated);
        return redirect()->back()->with('success', 'Promotion added successfully');
    }
}
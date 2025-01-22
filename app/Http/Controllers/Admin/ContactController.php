<?php

namespace App\Http\Controllers\Admin;

use App\Models\ContactQuery;
use Illuminate\Http\Request;

class ContactController
{
    public function index()
    {
        $queries = ContactQuery::latest()->paginate(10);
        return view('admin.queries.index', compact('queries'));
    }

    public function updateStatus(Request $request, $id)
    {
        $query = ContactQuery::findOrFail($id);
        $query->update(['status' => $request->status]);
        return response()->json(['success' => true]);
    }
} 
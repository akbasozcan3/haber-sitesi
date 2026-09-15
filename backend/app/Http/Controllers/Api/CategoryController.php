<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return CategoryResource::collection(
            Category::query()->orderByDesc('is_featured')->orderBy('name')->get()
        );
    }

    public function show(string $identifier)
    {
        $category = Category::find($identifier) ?: Category::where('slug', $identifier)->firstOrFail();

        return new CategoryResource($category);
    }

    public function store(Request $request)
    {
        $category = Category::create($request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:40',
            'is_featured' => 'boolean',
            'show_in_navbar' => 'boolean',
        ]));

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(Request $request, Category $category)
    {
        $category->update($request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:40',
            'is_featured' => 'boolean',
            'show_in_navbar' => 'boolean',
        ]));

        return new CategoryResource($category->refresh());
    }

    public function destroy(Category $category)
    {
        if ($category->news()->exists()) {
            return response()->json(['message' => 'Haberi olan kategori silinemez.'], 409);
        }

        $category->delete();

        return response()->json(['message' => 'Kategori silindi.']);
    }
}
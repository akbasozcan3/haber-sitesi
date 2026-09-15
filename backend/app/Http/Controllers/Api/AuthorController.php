<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthorResource;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index()
    {
        return AuthorResource::collection(Author::query()->orderBy('name')->get());
    }

    public function show(string $identifier)
    {
        $author = Author::find($identifier) ?: Author::where('slug', $identifier)->firstOrFail();

        return new AuthorResource($author);
    }

    public function store(Request $request)
    {
        $author = Author::create($request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:authors,slug',
            'email' => 'required|email|max:255|unique:authors,email',
            'bio' => 'nullable|string',
            'avatar' => 'nullable|string|max:255',
        ]));

        return (new AuthorResource($author))->response()->setStatusCode(201);
    }

    public function update(Request $request, Author $author)
    {
        $author->update($request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:authors,slug,' . $author->id,
            'email' => 'sometimes|required|email|max:255|unique:authors,email,' . $author->id,
            'bio' => 'nullable|string',
            'avatar' => 'nullable|string|max:255',
        ]));

        return new AuthorResource($author->refresh());
    }

    public function destroy(Author $author)
    {
        if ($author->news()->exists()) {
            return response()->json(['message' => 'Haberi olan yazar silinemez.'], 409);
        }

        $author->delete();

        return response()->json(['message' => 'Yazar silindi.']);
    }
}
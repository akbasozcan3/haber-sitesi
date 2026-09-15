<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\SettingController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:10,1');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{author}', [AuthorController::class, 'show']);
Route::get('/news', [NewsController::class, 'index']);
Route::post('/news/{id}/view', [NewsController::class, 'incrementView'])->middleware('throttle:60,1');
Route::get('/news/{id}', [NewsController::class, 'show']);
Route::get('/news/{id}/comments', [CommentController::class, 'indexForNews']);
Route::post('/news/{id}/comments', [CommentController::class, 'store'])->middleware('throttle:30,1');
Route::post('/comments/{id}/like', [CommentController::class, 'like'])->middleware('throttle:60,1');

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/uploads/image', [UploadController::class, 'image']);
    Route::post('/news', [NewsController::class, 'store']);
    Route::put('/news/{id}', [NewsController::class, 'update']);
    Route::delete('/news/{id}', [NewsController::class, 'destroy']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('authors', AuthorController::class)->except(['index', 'show']);
    Route::apiResource('users', UserController::class);
    Route::get('/newsletter/subscribers', [NewsletterController::class, 'index']);
    Route::delete('/newsletter/subscribers/{subscriber}', [NewsletterController::class, 'destroy']);
    Route::get('/comments', [CommentController::class, 'indexAll']);
    Route::patch('/comments/{id}/toggle', [CommentController::class, 'toggleApproval']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::post('/settings/logo', [SettingController::class, 'uploadLogo']);
    Route::post('/settings/favicon', [SettingController::class, 'uploadFavicon']);
});

// Tanımsız API rotalarına 404 JSON döndür
Route::fallback(function () {
    return response()->json(['message' => 'Bu API endpoint bulunamadı.'], 404);
});
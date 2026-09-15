<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Category;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Category::where('slug', 'teknoloji')->orWhere('slug', 'like', '%test-%')->delete();
        Author::where('slug', 'test-yazar')->orWhere('slug', 'like', '%test-%')->orWhere('email', 'test@example.com')->delete();
        NewsletterSubscriber::where('email', 'like', '%@example.com')->delete();
        User::where('email', 'like', '%@example.com')->delete();
        parent::tearDown();
    }

    public function test_user_can_login_and_receive_a_token(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['token', 'user']);
    }

    public function test_login_is_rate_limited(): void
    {
        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/login', [
                'email' => 'unknown@example.com',
                'password' => 'wrong-password',
            ])->assertStatus(422);
        }

        $this->postJson('/api/login', [
            'email' => 'unknown@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(429);
    }

    public function test_newsletter_subscription_is_persisted_and_idempotent(): void
    {
        $email = 'reader_' . uniqid() . '@example.com';

        $this->postJson('/api/newsletter/subscribe', [
            'email' => $email,
        ])->assertCreated()->assertJson(['subscribed' => true]);

        $this->postJson('/api/newsletter/subscribe', [
            'email' => $email,
        ])->assertOk()->assertJson(['already_subscribed' => true]);

        $this->assertNotNull(NewsletterSubscriber::where('email', $email)->first());
    }

    public function test_category_can_be_created_and_listed(): void
    {
        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));

        $this->postJson('/api/categories', [
            'name' => 'Teknoloji',
            'slug' => 'teknoloji',
        ])->assertCreated();

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Teknoloji']);
    }

    public function test_author_can_be_created_and_listed(): void
    {
        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));

        $this->postJson('/api/authors', [
            'name' => 'Test Yazar',
            'slug' => 'test-yazar',
            'email' => 'test@example.com',
        ])->assertCreated();

        $this->getJson('/api/authors')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Test Yazar']);
    }

    public function test_category_and_author_writes_require_authentication(): void
    {
        $this->postJson('/api/categories', [
            'name' => 'Teknoloji',
            'slug' => 'teknoloji',
        ])->assertUnauthorized();

        $this->postJson('/api/authors', [
            'name' => 'Test Yazar',
            'slug' => 'test-yazar',
            'email' => 'test@example.com',
        ])->assertUnauthorized();
    }

    public function test_authenticated_non_admin_cannot_use_admin_endpoints(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/categories', [
            'name' => 'Teknoloji',
            'slug' => 'teknoloji',
        ])->assertForbidden();
    }

    public function test_authenticated_user_can_upload_a_news_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));

        $response = $this->postJson('/api/uploads/image', [
            'image' => UploadedFile::fake()->create('cover.jpg', 100, 'image/jpeg'),
        ]);

        $response->assertCreated()->assertJsonStructure(['url', 'path']);
        $this->assertTrue(Storage::disk('public')->exists($response->json('path')));
    }
}

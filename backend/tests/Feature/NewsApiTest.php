<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\Author;
use App\Models\Category;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Sanctum;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        if (isset($this->categoryId)) {
            Category::where('_id', $this->categoryId)->orWhere('id', $this->categoryId)->delete();
        }
        if (isset($this->authorId)) {
            Author::where('_id', $this->authorId)->orWhere('id', $this->authorId)->delete();
        }
        News::where('slug', 'like', '%test-%')
            ->orWhere('slug', 'gelecek-haber')
            ->orWhere('slug', 'taslak-haber')
            ->orWhere('slug', 'slug-haber')
            ->orWhere('slug', 'yeni-baslik')
            ->orWhere('slug', 'eski-baslik')
            ->orWhere('slug', 'silinecek-haber')
            ->orWhere('title', 'Yeni Başlık')
            ->orWhere('title', 'Slug Haber')
            ->delete();
        Category::where('slug', 'like', '%test-%')
            ->orWhere('slug', 'taslak-kategori')
            ->orWhere('slug', 'teknoloji')
            ->delete();
        Author::where('slug', 'like', '%test-%')
            ->orWhere('slug', 'taslak-yazar')
            ->orWhere('email', 'like', '%@example.com')
            ->delete();
        User::where('email', 'like', '%@example.com')->delete();
        parent::tearDown();
    }

    public function test_public_api_hides_drafts_and_caps_the_limit(): void
    {
        $category = Category::create(['name' => 'Taslak Kategori', 'slug' => 'taslak-kategori']);
        $author = Author::create([
            'name' => 'Taslak Yazar',
            'slug' => 'taslak-yazar',
            'email' => 'taslak@example.com',
        ]);
        News::create([
            'category_id' => $category->id,
            'author_id' => $author->id,
            'title' => 'Taslak Haber',
            'slug' => 'taslak-haber',
            'content' => 'Taslak içerik',
            'status' => 'draft',
        ]);
        Auth::forgetGuards();

        $this->getJson('/api/news?limit=999999')
            ->assertOk()
            ->assertJsonMissing(['slug' => 'taslak-haber']);

        $this->getJson('/api/news/taslak-haber')->assertNotFound();
    }

    public function test_public_api_hides_future_published_news(): void
    {
        $news = News::create([
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'title' => 'Gelecek Haber',
            'slug' => 'gelecek-haber',
            'content' => 'Gelecekte yayınlanacak içerik.',
            'status' => 'published',
            'published_at' => now()->addDay(),
        ]);
        Auth::forgetGuards();

        $this->getJson('/api/news/gelecek-haber')->assertNotFound();
        $this->postJson('/api/news/' . $news->id . '/view')->assertNotFound();
    }

    private string|int $categoryId;
    private string|int $authorId;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));

        $this->categoryId = Category::create([
            'name' => 'Teknoloji',
            'slug' => 'teknoloji',
        ])->id;

        $this->authorId = Author::create([
            'name' => 'Test Yazar',
            'slug' => 'test-yazar',
            'email' => 'test@example.com',
        ])->id;
    }

    public function test_news_can_be_created(): void
    {
        $response = $this->postJson('/api/news', [
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'title' => 'Test Haber',
            'slug' => 'test-haber',
            'excerpt' => 'Test açıklaması',
            'content' => 'Test haber içeriği.',
            'image' => 'test.jpg',
            'status' => 'published',
            'is_featured' => true,
        ]);

        $response->assertStatus(201);

        $created = News::where('slug', 'test-haber')->first();
        $this->assertNotNull($created);
        $this->assertEquals('Test Haber', $created->title);
    }

    public function test_news_can_be_listed(): void
    {
        News::create([
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'title' => 'Test Haber',
            'slug' => 'test-haber-listele',
            'excerpt' => 'Test açıklaması',
            'content' => 'Test içerik',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/news');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Test Haber',
        ]);
    }

    public function test_news_can_be_shown(): void
    {
        $news = News::create([
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'title' => 'Test Haber',
            'slug' => 'test-haber-gosterim',
            'excerpt' => 'Test açıklaması',
            'content' => 'Test içerik',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/news/' . $news->id);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Test Haber',
        ]);
    }

    public function test_published_news_can_be_shown_by_slug_and_its_view_count_can_be_incremented(): void
    {
        $news = News::create([
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'title' => 'Slug Haber',
            'slug' => 'slug-haber',
            'excerpt' => 'Slug özet',
            'content' => 'Slug içerik',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->getJson('/api/news/slug-haber')
            ->assertOk()
            ->assertJsonPath('data.slug', 'slug-haber');

        $this->postJson('/api/news/' . $news->id . '/view')
            ->assertOk()
            ->assertJson(['views' => 1]);
    }

    public function test_news_can_be_updated(): void
    {
        $news = News::create([
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'title' => 'Eski Başlık',
            'slug' => 'eski-baslik',
            'excerpt' => 'Eski özet',
            'content' => 'Eski içerik',
            'status' => 'draft',
        ]);

        $response = $this->putJson('/api/news/' . $news->id, [
            'title' => 'Yeni Başlık',
            'slug' => 'yeni-baslik',
            'content' => 'Yeni içerik',
            'status' => 'published',
        ]);

        $response->assertStatus(200);

        $updated = News::find($news->id);
        $this->assertNotNull($updated);
        $this->assertEquals('Yeni Başlık', $updated->title);
        $this->assertEquals('published', $updated->status);
    }

    public function test_news_can_be_deleted(): void
    {
        $news = News::create([
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'title' => 'Silinecek Haber',
            'slug' => 'silinecek-haber',
            'excerpt' => 'Silinecek özet',
            'content' => 'Test içerik',
            'status' => 'draft',
        ]);

        $response = $this->deleteJson('/api/news/' . $news->id);

        $response->assertStatus(200);

        $this->assertNull(News::find($news->id));
    }

    public function test_news_creation_requires_required_fields(): void
    {
        $response = $this->postJson('/api/news', []);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'title',
            'slug',
            'content',
            'status',
        ]);
    }
}
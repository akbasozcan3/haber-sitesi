<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Category;
use App\Models\Comment;
use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommentApiTest extends TestCase
{
    use RefreshDatabase;

    private News $news;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::create([
            'name' => 'Teknoloji',
            'slug' => 'teknoloji',
        ]);

        $author = Author::create([
            'name' => 'Test Yazar',
            'slug' => 'test-yazar',
            'email' => 'test@webhaber.com',
        ]);

        $this->news = News::create([
            'category_id' => $category->id,
            'author_id' => $author->id,
            'title' => 'Test Haberi',
            'slug' => 'test-haberi',
            'content' => 'Test içerik açıklaması burada yer alır.',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $this->admin = User::where('email', 'admin@habersitesi.com')->first()
            ?? User::factory()->create([
                'email' => 'admin@habersitesi.com',
                'is_admin' => true,
            ]);
    }

    protected function tearDown(): void
    {
        if (isset($this->news)) {
            Comment::where('news_id', $this->news->id)->delete();
            $this->news->delete();
        }
        Category::where('slug', 'teknoloji')->orWhere('slug', 'like', '%test-%')->delete();
        Author::where('slug', 'test-yazar')->orWhere('slug', 'like', '%test-%')->delete();
        parent::tearDown();
    }

    public function test_can_list_comments_for_news(): void
    {
        Comment::create([
            'news_id' => $this->news->id,
            'name' => 'Ahmet',
            'content' => 'Çok güzel bir haber.',
            'is_approved' => true,
        ]);

        Comment::create([
            'news_id' => $this->news->id,
            'name' => 'Gizli',
            'content' => 'Onaylanmamış yorum.',
            'is_approved' => false,
        ]);

        $response = $this->getJson("/api/news/{$this->news->id}/comments");

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['name' => 'Ahmet'])
            ->assertJsonMissing(['name' => 'Gizli']);
    }

    public function test_can_post_comment_to_news(): void
    {
        $payload = [
            'name' => 'Zeynep Kaya',
            'content' => 'Yapay zeka modellerinin gelişimi gerçekten büyüleyici.',
        ];

        $response = $this->postJson("/api/news/{$this->news->id}/comments", $payload);

        $response->assertCreated()
            ->assertJsonFragment(['name' => 'Zeynep Kaya']);

        $postedComment = Comment::where('news_id', $this->news->id)->where('name', 'Zeynep Kaya')->first();
        $this->assertNotNull($postedComment);
    }

    public function test_can_like_comment(): void
    {
        $comment = Comment::create([
            'news_id' => $this->news->id,
            'name' => 'Ali',
            'content' => 'Harika bir makale!',
            'likes' => 5,
            'is_approved' => true,
        ]);

        $response = $this->postJson("/api/comments/{$comment->id}/like");

        $response->assertOk()
            ->assertJson(['likes' => 6]);

        $updatedComment = Comment::find($comment->id);
        $this->assertNotNull($updatedComment);
        $this->assertEquals(6, $updatedComment->likes);
    }

    public function test_admin_can_toggle_and_delete_comment(): void
    {
        $comment = Comment::create([
            'news_id' => $this->news->id,
            'name' => 'Modere Edilecek',
            'content' => 'İçerik denetimi yapılacak.',
            'is_approved' => true,
        ]);

        Sanctum::actingAs($this->admin);

        // Toggle
        $this->patchJson("/api/comments/{$comment->id}/toggle")
            ->assertOk()
            ->assertJsonPath('comment.is_approved', false);

        // Delete
        $this->deleteJson("/api/comments/{$comment->id}")
            ->assertOk();

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }
}

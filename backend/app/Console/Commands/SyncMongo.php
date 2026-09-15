<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Author;
use App\Models\News;
use App\Models\User;
use App\Models\Comment;
use App\Models\NewsletterSubscriber;

class SyncMongo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mongo:sync {--test-connection : Sadece bağlantıyı test et}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'MySQL veritabanındaki tüm haber, kategori ve yazarları MongoDB veritabanına eksiksiz aktarır.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('--- MongoDB Bağlantı Testi Başlatılıyor ---');

        try {
            $mongo = DB::connection('mongodb');
            // Ping test
            $mongo->getMongoClient()->listDatabases();
            $this->info('✓ MongoDB bağlantısı başarılı!');
        } catch (\Throwable $e) {
            $this->error('MongoDB bağlantı hatası: ' . $e->getMessage());
            $this->warn('Lütfen .env dosyanızdaki MONGODB_URI bağlantı dizesini kontrol edin.');
            return 1;
        }

        if ($this->option('test-connection')) {
            return 0;
        }

        $this->info('--- Veriler MongoDB\'ye Aktarılıyor ---');

        // 1. Kategoriler
        $categories = Category::all();
        $this->line("Kategoriler aktarılıyor (" . $categories->count() . " adet)...");
        $catCollection = $mongo->table('categories');
        $catCollection->delete();
        foreach ($categories as $cat) {
            $catCollection->insert($cat->toArray());
        }
        $this->info("✓ Kategoriler başarıyla aktarıldı.");

        // 2. Yazarlar
        $authors = Author::all();
        $this->line("Yazarlar aktarılıyor (" . $authors->count() . " adet)...");
        $authCollection = $mongo->table('authors');
        $authCollection->delete();
        foreach ($authors as $author) {
            $authCollection->insert($author->toArray());
        }
        $this->info("✓ Yazarlar başarıyla aktarıldı.");

        // 3. Haberler
        $news = News::all();
        $this->line("Haberler aktarılıyor (" . $news->count() . " adet)...");
        $newsCollection = $mongo->table('news');
        $newsCollection->delete();
        foreach ($news as $item) {
            $newsCollection->insert($item->toArray());
        }
        $this->info("✓ Haberler başarıyla aktarıldı.");

        // 4. Kullanıcılar
        $users = User::all();
        $this->line("Kullanıcılar aktarılıyor (" . $users->count() . " adet)...");
        $userCollection = $mongo->table('users');
        $userCollection->delete();
        foreach ($users as $user) {
            $userCollection->insert($user->toArray());
        }
        $this->info("✓ Kullanıcılar başarıyla aktarıldı.");

        // 5. Yorumlar
        $comments = Comment::all();
        $this->line("Yorumlar aktarılıyor (" . $comments->count() . " adet)...");
        $commCollection = $mongo->table('comments');
        $commCollection->delete();
        foreach ($comments as $comm) {
            $commCollection->insert($comm->toArray());
        }
        $this->info("✓ Yorumlar başarıyla aktarıldı.");

        // 6. Bülten Aboneleri
        $subs = NewsletterSubscriber::all();
        $this->line("Bülten aboneleri aktarılıyor (" . $subs->count() . " adet)...");
        $subCollection = $mongo->table('newsletter_subscribers');
        $subCollection->delete();
        foreach ($subs as $sub) {
            $subCollection->insert($sub->toArray());
        }
        $this->info("✓ Bülten aboneleri başarıyla aktarıldı.");

        // 7. Site Ayarları
        $settings = \App\Models\Setting::all();
        $this->line("Site ayarları aktarılıyor (" . $settings->count() . " adet)...");
        $setCollection = $mongo->table('settings');
        $setCollection->delete();
        foreach ($settings as $setting) {
            $setCollection->insert($setting->toArray());
        }
        $this->info("✓ Site ayarları başarıyla aktarıldı.");

        $this->info('==========================================');
        $this->info('TEBRİKLER! Tüm veriler MongoDB\'ye başarıyla aktarıldı.');
        $this->info('==========================================');

        return 0;
    }
}

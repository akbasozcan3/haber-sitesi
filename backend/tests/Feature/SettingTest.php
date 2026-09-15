<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SettingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private array $originalSettings = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->originalSettings = Setting::all()->toArray();

        $this->admin = User::firstOrCreate(
            ['email' => 'admin@habersitesi.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password123'),
                'is_admin' => true,
            ]
        );
    }

    protected function tearDown(): void
    {
        if (!empty($this->originalSettings)) {
            Setting::truncate();
            foreach ($this->originalSettings as $setting) {
                unset($setting['_id']);
                Setting::create($setting);
            }
        }
        parent::tearDown();
    }

    public function test_can_get_public_settings(): void
    {
        $response = $this->getJson('/api/settings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'settings' => [
                    'site_logo',
                    'site_logo_type',
                    'site_title',
                    'site_tagline',
                ],
            ]);
    }

    public function test_admin_can_update_settings(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/settings', [
            'site_title' => 'Özel Teknoloji Portalı',
            'site_logo' => 'https://example.com/custom-logo.svg',
            'site_logo_type' => 'image',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'settings' => [
                    'site_title' => 'Özel Teknoloji Portalı',
                    'site_logo' => 'https://example.com/custom-logo.svg',
                    'site_logo_type' => 'image',
                ],
            ]);

        $this->assertEquals('Özel Teknoloji Portalı', Setting::get('site_title'));
    }

    public function test_admin_can_upload_logo(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->admin);

        $file = UploadedFile::fake()->image('site_logo.png', 300, 80);

        $response = $this->postJson('/api/settings/logo', [
            'logo' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'url',
                'settings',
            ]);

        $this->assertEquals('image', Setting::get('site_logo_type'));
    }

    public function test_non_admin_cannot_update_settings(): void
    {
        $response = $this->postJson('/api/settings', [
            'site_title' => 'Yetkisiz Değişiklik',
        ]);

        $response->assertStatus(401);
    }
}

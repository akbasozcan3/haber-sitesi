<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->string('description', 500)->nullable()->after('slug');
            $table->string('icon', 40)->nullable()->after('description');
            $table->boolean('is_featured')->default(false)->after('icon');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->dropColumn(['description', 'icon', 'is_featured']);
        });
    }
};
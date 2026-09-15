<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Author;
use App\Models\News;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@habersitesi.com'],
            [
                'name' => 'Portal Editörü',
                'password' => 'password123',
                'is_admin' => true,
            ],
        );

        $realCategories = [
            [
                'name' => 'Yapay Zeka',
                'slug' => 'yapay-zeka',
                'icon' => 'cpu',
                'description' => 'Büyük dil modelleri, üretken yapay zeka, otonom ajanlar ve kurumsal AI çözümleri.',
                'is_featured' => true,
                'show_in_navbar' => true,
            ],
            [
                'name' => 'Girişimler',
                'slug' => 'girisimler',
                'icon' => 'rocket',
                'description' => 'Türkiye ve dünyadan en dikkat çeken erken aşama ve ölçeklenen teknoloji girişimleri.',
                'is_featured' => true,
                'show_in_navbar' => true,
            ],
            [
                'name' => 'Yatırım',
                'slug' => 'yatirim',
                'icon' => 'trending-up',
                'description' => 'Risk sermayesi fonları, tohum ve büyüme turları, şirket birleşmeleri ve halka arzlar.',
                'is_featured' => true,
                'show_in_navbar' => true,
            ],
            [
                'name' => 'Fintek',
                'slug' => 'fintek',
                'icon' => 'credit-card',
                'description' => 'Dijital bankacılık, açık bankacılık, kripto varlıklar, ödeme sistemleri ve regülasyonlar.',
                'is_featured' => true,
                'show_in_navbar' => true,
            ],
            [
                'name' => 'E-Ticaret',
                'slug' => 'e-ticaret',
                'icon' => 'shopping-bag',
                'description' => 'Pazaryerleri, e-ihracat, teslimat teknolojileri ve yeni nesil perakende trendleri.',
                'is_featured' => true,
                'show_in_navbar' => true,
            ],
            [
                'name' => 'SaaS & Yazılım',
                'slug' => 'saas',
                'icon' => 'code',
                'description' => 'B2B bulut çözümleri, geliştirici araçları, açık kaynak ve yazılım mimarileri.',
                'is_featured' => true,
                'show_in_navbar' => true,
            ],
            [
                'name' => 'Mobilite',
                'slug' => 'mobilite',
                'icon' => 'car',
                'description' => 'Elektrikli araçlar, otonom sürüş teknolojileri ve akıllı ulaşım sistemleri.',
                'is_featured' => false,
                'show_in_navbar' => true,
            ],
            [
                'name' => 'Siber Güvenlik',
                'slug' => 'siber-guvenlik',
                'icon' => 'shield',
                'description' => 'Kurumsal veri güvenliği, siber tehdit istihbaratı ve savunma teknolojileri.',
                'is_featured' => false,
                'show_in_navbar' => true,
            ],
        ];

        $savedCategories = [];
        foreach ($realCategories as $catData) {
            $cat = Category::updateOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );
            $savedCategories[$cat->slug] = $cat;
        }

        $authorsData = [
            [
                'name' => 'Tuğçe İçözü',
                'slug' => 'tugce-icozu',
                'email' => 'tugce@webhaber.com',
                'bio' => 'Kıdemli teknoloji yazarı, üretken yapay zeka sistemleri ve küresel teknoloji trendleri analisti.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Arda Güler',
                'slug' => 'arda-guler',
                'email' => 'arda@webhaber.com',
                'bio' => 'Girişimcilik ve risk sermayesi masası şefi, melek yatırım ekosistemi araştırmacısı.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Ahmet Can',
                'slug' => 'ahmet-can',
                'email' => 'ahmet@webhaber.com',
                'bio' => 'Fintek ve ödeme sistemleri uzmanı, dijital varlıklar ve açık bankacılık yazarı.',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Zeynep Kaya',
                'slug' => 'zeynep-kaya',
                'email' => 'zeynep@webhaber.com',
                'bio' => 'B2B SaaS, bulut mimarileri ve siber güvenlik araştırmacısı.',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
            ],
        ];

        $savedAuthors = [];
        foreach ($authorsData as $authData) {
            $author = Author::updateOrCreate(['slug' => $authData['slug']], $authData);
            $savedAuthors[] = $author;
        }

        $realArticles = [
            // 1. YAPAY ZEKA
            [
                'category' => 'yapay-zeka',
                'author_idx' => 0,
                'title' => 'OpenAI yeni muhakeme modeli o3 ve o3-mini\'yi kurumsal müşterilere açtı',
                'slug' => 'openai-muhakeme-modeli-o3-kurumsal-entegrasyon',
                'is_featured' => true,
                'views' => 14250,
                'image' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Matematik, karmaşık kod yazımı ve bilimsel araştırmalarda önceki nesillere kıyasla yüzde 40 daha verimli çalışan yeni nesil o3 mimarisi, yapay zeka ajanlarının geleceğini şekillendiriyor.',
                'content' => "## Yapay Zeka Muhakemesinde Yeni Standart: OpenAI o3\n\nOpenAI, karmaşık problem çözme ve çok adımlı muhakeme odaklı yeni modeli **o3**\'ü kurumsal müşterilerinin ve geliştiricilerin kullanımına sundu. Model, klasik dil modellerinden farklı olarak bir cevabı üretmeden önce insan düşünme sürecine benzer şekilde \'düşünce zinciri\' (chain-of-thought) işletiyor.\n\n### Öne Çıkan Başarı Kriterleri\n\n- **İleri Düzey Kod Yazımı:** SWE-bench testlerinde kurumsal seviye yazılım problemlerini tek başına çözme oranı yüzde 71.7\'ye ulaştı.\n- **Matematik ve Bilimsel Modelleme:** Uluslararası Matematik Olimpiyatı ve lisansüstü düzeydeki biyokimya problemlerinde insana denk doğruluk sağlandı.\n- **Maliyet Optimizasyonu:** Hafifletilmiş **o3-mini** versiyonu, geliştiricilerin token başına maliyetlerini yüzde 65 oranında aşağı çekiyor.\n\n> \"Yapay zeka modellerinin yalnızca metin tamamlayan sistemlerden, karmaşık iş mantığını adım adım planlayan akıllı ajanlara dönüştüğü kritik bir eşikteyiz.\" — *Sam Altman*\n\n### Girişimler ve Şirketler İçin Ne Anlama Geliyor?\n\nFintek, hukuk ve sağlık teknolojileri sektörlerinde faaliyet gösteren B2B şirketler için o3, sözleşme denetiminden otomatik hata ayıklamaya kadar kritik iş süreçlerini otonom hale getirme imkanı tanıyor. Şirketler API entegrasyonuyla kendi özel veri tabanlarını bu muhakeme yeteneğiyle buluşturabilecek.",
            ],
            [
                'category' => 'yapay-zeka',
                'author_idx' => 0,
                'title' => 'Google DeepMind\'dan biyoteknolojide dev adım: AlphaFold 3 ekosisteme sunuldu',
                'slug' => 'google-deepmind-alphafold-3-biyoteknoloji',
                'is_featured' => true,
                'views' => 9840,
                'image' => 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Yalnızca proteinleri değil, DNA, RNA ve küçük moleküller arasındaki karmaşık etkileşimleri tahmin edebilen AlphaFold 3, kanser ve genetik hastalıklar için ilaç geliştirme sürelerini yıllardan aylara indiriyor.',
                'content' => "## Biyomoleküler Dünyanın Haritası Çıkarılıyor\n\nGoogle DeepMind ve Isomorphic Labs, yaşamın yapı taşları arasındaki etkileşimleri atomik hassasiyetle modelleyebilen **AlphaFold 3**\'ü duyurdu. Yeni sürüm, bilim dünyasının on yıllardır çözmeye çalıştığı protein-ligand ve protein-nükleik asit bağlanma mekanizmalarını bilgisayar simülasyonlarıyla aydınlatıyor.\n\n### İlaç Geliştirme Süreçlerinde Dönüm Noktası\n\nGeleneksel laboratuvar deneylerinde aylar süren molekül testleri, AlphaFold 3 sayesinde birkaç saat içinde yüksek doğrulukla simüle edilebiliyor. Küresel ilaç üreticileri şimdiden yeni nesil bağışıklık tedavileri için modeli klinik öncesi fazlara entegre etmeye başladı.",
            ],
            [
                'category' => 'yapay-zeka',
                'author_idx' => 2,
                'title' => 'Avrupa Birliği Yapay Zeka Yasası (EU AI Act) resmen yürürlüğe girdi',
                'slug' => 'avrupa-birligi-yapay-zeka-yasasi-yururlukte',
                'is_featured' => false,
                'views' => 6720,
                'image' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Küresel ölçekte yapay zeka sistemlerine risk bazlı sınıflandırma getiren ilk kapsamlı yasa paketi yürürlüğe girdi. Uyum sağlamayan şirketleri küresel cirolarının yüzde 7\'sine varan cezalar bekliyor.',
                'content' => "## Yüksek Riskli Sistemler İçin Sıkı Denetim\n\nAvrupa Parlamentosu ve Konseyi tarafından onaylanan Yapay Zeka Yasası (AI Act), yapay zeka ürünlerini dört temel risk kategorisine ayırıyor: Kabul Edilemez Risk, Yüksek Risk, Şeffaflık Riski ve Minimum Risk.\n\n### Türkiye\'deki Teknoloji İhracatçıları Nasıl Etkilenecek?\n\nAB pazarına yazılım veya AI tabanlı SaaS ürünü satan Türk teknoloji şirketleri, algoritmik şeffaflık, telif hakkı uyumu ve eğitim verisi kaynaklarını belgelendirmekle yükümlü olacak.",
            ],

            // 2. GİRİŞİMLER
            [
                'category' => 'girisimler',
                'author_idx' => 1,
                'title' => 'Türk yapay zeka platformu Insider, küresel genişleme turunda 500 milyon dolar yatırım aldı',
                'slug' => 'insider-kuresel-genisleme-turunda-500-milyon-dolar-yatirim',
                'is_featured' => true,
                'views' => 18900,
                'image' => 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'General Atlantic liderliğinde gerçekleşen yeni yatırım turuyla Insider, değerlemesini 3 milyar doların üzerine taşıyarak Kuzey Amerika pazarındaki satın alma operasyonlarını hızlandırdı.',
                'content' => "## Türkiye\'den Çıkan Küresel Yazılım Devi\n\nÇok kanallı müşteri deneyimi ve kişiselleştirme alanında dünyanın önde gelen yapay zeka platformlarından **Insider**, küresel büyümesini hızlandırmak üzere 500 milyon dolarlık devasa bir yatırım anlaşmasına imza attı.\n\n### Yatırımın Odak Noktaları\n\n- **Kuzey Amerika Satın Almaları:** ABD pazarındaki pazar payını artırmak amacıyla tamamlayıcı pazarlama teknolojisi girişimleri bünyeye katılacak.\n- **Üretken AI İnovasyonu:** Pazarlama ekiplerinin tek tıkla kampanya kurgulamasına imkan tanıyan otonom yapay zeka mimarisi güçlendirilecek.\n\n> \"Bu yatırım, Türk mühendisliğinin ve girişimcilik kültürünün küresel ölçekte ne denli rekabetçi olduğunun en somut kanıtıdır.\" — *Hande Çilingir, Insider Kurucu Ortağı*",
            ],
            [
                'category' => 'girisimler',
                'author_idx' => 1,
                'title' => 'B2B lojistik pazaryeri Kamion, Seri A turunda 12 milyon dolar toplayarak Avrupa\'ya açıldı',
                'slug' => 'b2b-lojistik-girisimi-kamion-seri-a-yatirim',
                'is_featured' => true,
                'views' => 8410,
                'image' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Kamyon sahipleri ile kurumsal yük verenleri yapay zeka destekli rota optimizasyonuyla buluşturan Kamion, Doğu Avrupa ve Balkanlar operasyonlarını başlattı.',
                'content' => "## Karayolu Taşımacılığında Dijital Dönüşüm\n\nTedarik zinciri verimliliğini artıran yerli teknoloji girişimi Kamion, uluslararası risk sermayesi fonlarının katılımıyla 12 milyon dolarlık Seri A turunu başarıyla tamamladı. Girişim, boş dönen kamyon oranını yüzde 35 azaltarak lojistikte karbon ayak izini düşürüyor.",
            ],
            [
                'category' => 'girisimler',
                'author_idx' => 0,
                'title' => 'Y Combinator 2026 kış dönemine Türkiye\'den seçilen 4 yeni girişim',
                'slug' => 'y-combinator-2026-turkiye-secilen-girisimler',
                'is_featured' => false,
                'views' => 7650,
                'image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Dünyanın en prestijli hızlandırıcı programı Y Combinator\'ın yeni dönemine kabul edilen Türk kuruculu girişimler; otonom kod denetimi, mikro SaaS ve biyoinformatik alanlarına odaklanıyor.',
                'content' => "## Silikon Vadisi Radarına Giren Yerli Yetenekler\n\nHer yıl binlerce başvuru arasından yalnızca yüzde 1\'lik dilimin kabul edildiği Y Combinator kış dönemi finalistleri açıklandı. Türkiye merkezli kurucular tarafından geliştirilen 4 yenilikçi ürün, Demo Day sahnesinde küresel melek yatırımcıların karşısına çıkacak.",
            ],

            // 3. YATIRIM
            [
                'category' => 'yatirim',
                'author_idx' => 1,
                'title' => 'Türkiye Girişim Ekosistemi 2026 Raporu: İlk çeyrekte 420 milyon dolar yatırım',
                'slug' => 'turkiye-girisim-ekosistemi-2026-ilk-ceyrek-yatirim-raporu',
                'is_featured' => true,
                'views' => 16300,
                'image' => 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'KPMG ve 212 iş birliğiyle hazırlanan rapora göre, Türkiye teknoloji girişimleri 2026 yılının ilk çeyreğinde 68 farklı yatırım turunda toplam 420 milyon dolar fon çekerek tarihi bir başlangıç yaptı.',
                'content' => "## Yatırımlarda Yapay Zeka ve Oyun Sektörü Lider\n\nTürkiye girişimcilik ekosistemi, küresel sermaye piyasalarındaki faiz indirim döngüsünün başlamasıyla birlikte yeniden rekor büyüme patikasına girdi. Yayınlanan ilk çeyrek raporu, özellikle tohum sonrası ve Seri A aşamasındaki şirketlerin yabancı fonlardan yoğun talep gördüğünü ortaya koyuyor.\n\n### Rakamlarla 2026 İlk Çeyrek\n\n- **Toplam Fonlama:** 420 Milyon Dolar (Geçen yılın aynı dönemine göre %54 artış)\n- **En Çok Fonlanan Sektör:** Yapay zeka ve makine öğrenimi (%38 pay)\n- **Yabancı Fon Katılımı:** Yatırımların yüzde 62\'sinde en az bir uluslararası VC yer aldı.",
            ],
            [
                'category' => 'yatirim',
                'author_idx' => 1,
                'title' => '212 ve Revo Capital ortaklığında 150 milyon dolarlık yeni teknoloji fonu kuruldu',
                'slug' => '212-revo-capital-150-milyon-dolar-yeni-fon',
                'is_featured' => false,
                'views' => 9100,
                'image' => 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Doğu Avrupa, Türkiye ve Orta Doğu coğrafyasındaki erken ve büyüme aşaması derin teknoloji şirketlerine sermaye sağlayacak yeni fonun ilk kapanışı gerçekleşti.',
                'content' => "## Bölgesel Teknoloji Şampiyonları Hedefte\n\nBölgenin iki köklü risk sermayesi yönetim şirketi, küresel kurumsal yatırımcıların katılımıyla 150 milyon dolarlık yeni fonun kurulduğunu ilan etti. Fon; siber güvenlik, B2B bulut yazılımları ve iklim teknolojilerine odaklanacak.",
            ],

            // 4. FİNTEK
            [
                'category' => 'fintek',
                'author_idx' => 2,
                'title' => 'Papara, Avrupa Birliği genelinde geçerli dijital bankacılık lisansını aldı',
                'slug' => 'papara-avrupa-birligi-dijital-bankacilik-lisansi',
                'is_featured' => true,
                'views' => 17400,
                'image' => 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Türkiye\'de 20 milyonu aşkın kullanıcıya ulaşan fintek devi Papara, Avrupa Merkez Bankası ve yerel otoritelerin onayını alarak kıta genelinde sınır ötesi finansal hizmetlerini başlattı.',
                'content' => "## Yerli Fintekten Küresel Meydan Okuma\n\nFinansal teknolojiler alanında Türkiye\'nin öncü şirketlerinden **Papara**, Avrupa Birliği pasaportlama haklarına sahip dijital bankacılık yetkilerini tamamladı. Kullanıcılar artık euro cinsinden IBAN, çoklu para birimi cüzdanı ve uluslararası komisyonsuz para transferi avantajlarından yararlanabilecek.\n\n### Finansal Süper Uygulama Vizyonu\n\nŞirket, sigorta ve yatırım ürünlerinin ardından 2026 yılı sonuna kadar Avrupa\'da 3 milyon aktif kullanıcıya ulaşmayı hedefliyor.",
            ],
            [
                'category' => 'fintek',
                'author_idx' => 2,
                'title' => 'Midas, kripto varlık ve BIST vadeli işlemlerini tek platformda birleştirdi',
                'slug' => 'midas-kripto-varlik-ve-vadeli-islemler-guncellemesi',
                'is_featured' => false,
                'views' => 11200,
                'image' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'SPK lisanslı aracı kurum altyapısıyla Amerikan borsalarını Türkiye\'ye getiren Midas, yeni regülasyonlara tam uyumlu kripto varlık alım satım modülünü kullanıma sundu.',
                'content' => "## Yatırımcılar İçin Tek Durak Finans Portalı\n\nBireysel yatırım deneyimini modern arayüzü ve düşük komisyon modeliyle baştan tanımlayan Midas, kullanıcılarının hisse senedi, emtia ve kripto portföylerini tek ekrandan yönetebileceği büyük ürün güncellemesini yayınladı.",
            ],

            // 5. E-TİCARET
            [
                'category' => 'e-ticaret',
                'author_idx' => 1,
                'title' => 'Trendyol ve Hepsiburada\'nın Körfez atağı: E-ihracatta çeyreklik rekor',
                'slug' => 'trendyol-hepsiburada-korfez-eihracat-rekoru',
                'is_featured' => true,
                'views' => 13500,
                'image' => 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Suudi Arabistan, BAE ve Katar pazarlarında Türk tekstil ve tüketici ürünlerine olan talep patladı. Yerli pazaryerleri üzerinden yapılan e-ihracat hacmi 1.2 milyar doları aştı.',
                'content' => "## Mikro İhracatta Yeni İpek Yolu\n\nTürkiye\'nin önde gelen e-ticaret platformları, lojistik ve gümrük süreçlerini entegre ederek on binlerce KOBİ\'yi doğrudan Körfez tüketicileriyle buluşturuyor. Özel kargo uçakları ve yerel iade merkezleriyle teslimat süreleri 48 saate kadar düşürüldü.",
            ],
            [
                'category' => 'e-ticaret',
                'author_idx' => 3,
                'title' => 'Amazon Türkiye lojistik ağını genişletiyor: Ankara ve İzmir ikmal merkezleri açıldı',
                'slug' => 'amazon-turkiye-lojistik-agi-yeni-merkezler',
                'is_featured' => false,
                'views' => 8950,
                'image' => 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Amazon Prime üyelerine sunulan aynı gün ve ertesi gün teslimat garantisi, Anadolu\'nun büyük metropollerini de kapsayacak şekilde 100 milyon dolarlık ek yatırımla büyütüldü.',
                'content' => "## Hızlı Teslimat Rekabeti Kızışıyor\n\nYeni açılan ikmal merkezleri, robotik tasnif teknolojileri ve enerji verimliliği yüksek yeşil bina standartlarıyla donatıldı. Binlerce yerel satıcı ürünlerini doğrudan Amazon depolarına konsolide edebilecek.",
            ],

            // 6. SAAS & YAZILIM
            [
                'category' => 'saas',
                'author_idx' => 3,
                'title' => 'Yapay zeka destekli kodlama asistanları Türk yazılım şirketlerinde verimliliği %42 artırdı',
                'slug' => 'yapay-zeka-destekli-kodlama-asistanlari-verimlilik-raporu',
                'is_featured' => true,
                'views' => 12800,
                'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Yazılım Sanayicileri Derneği (YASAD) tarafından yapılan araştırma, GitHub Copilot, Claude Code ve Cursor kullanan mühendislik ekiplerinin sprint tamamlama sürelerinin yarı yarıya kısaldığını gösterdi.',
                'content' => "## Yazılım Geliştirmenin Yeni Normu: İnsan + Yapay Zeka Ortaklığı\n\nTeknoloji şirketlerinde kod yazma alışkanlıkları son 18 ayda kökten dönüştü. Araştırma sonuçlarına göre, rutin birim testleri, dokümantasyon ve API entegrasyon kodlarının yüzde 60\'tan fazlası artık yapay zeka asistanları tarafından taslak olarak üretiliyor.",
            ],
            [
                'category' => 'saas',
                'author_idx' => 3,
                'title' => 'Bulut harcamalarını optimize eden FinOps çözümleri kurumsal şirketlerin ilk tercihi oldu',
                'slug' => 'bulut-maliyet-optimizasyonu-finops-araclari',
                'is_featured' => false,
                'views' => 6400,
                'image' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'AWS, Microsoft Azure ve Google Cloud maliyetlerini yapay zeka ile denetleyen yeni nesil FinOps platformları, şirketlerin bulut faturalarında ortalama yüzde 32 tasarruf sağlıyor.',
                'content' => "## Atıl Sunuculara Son: Akıllı Kaynak Yönetimi\n\nBüyük ölçekli teknoloji şirketleri ve bankalar, kontrolsüz artan bulut maliyetlerine karşı FinOps ekipleri kurarak gerçek zamanlı maliyet gözlemlenebilirliği sağlıyor.",
            ],

            // 7. MOBİLİTE
            [
                'category' => 'mobilite',
                'author_idx' => 1,
                'title' => 'Elektrikli araç şarj ağı yatırımları hız kazandı: 81 ilde ultra hızlı şarj istasyonları',
                'slug' => 'elektrikli-arac-sarj-agi-yatirimlari-turkiye',
                'is_featured' => false,
                'views' => 7900,
                'image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'EPDK verilerine göre Türkiye\'deki soket sayısı 30 bini aştı. Yerli şebeke operatörleri 300 kW üzeri DC hızlı şarj teknolojilerine 250 milyon dolarlık ek bütçe ayırdı.',
                'content' => "## Otoyollarda Kesintisiz Elektrikli Ulaşım\n\nTogg ve küresel elektrikli araç modellerinin pazar payını hızla artırmasıyla birlikte şarj altyapısı yatırımları kritik bir eşiği aştı. Şarj süreleri yeni nesil istasyonlarda 15 dakikaya kadar indi.",
            ],

            // 8. SİBER GÜVENLİK
            [
                'category' => 'siber-guvenlik',
                'author_idx' => 3,
                'title' => 'Yapay zeka güdümlü otonom siber saldırılara karşı Sıfır Güven (Zero Trust) zorunluluğu',
                'slug' => 'otonom-siber-saldirilar-sifir-guven-mimarisi',
                'is_featured' => false,
                'views' => 8150,
                'image' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
                'excerpt' => 'Deepfake ve otonom kimlik avı saldırılarının yüzde 300 arttığı 2026 yılında, kurumsal BT liderleri klasik çevre güvenliği yerine Sıfır Güven (Zero Trust) mimarisine geçiş yapıyor.',
                'content' => "## Kurumsal Ağlarda Her İstek Doğrulanmak Zorunda\n\nSiber güvenlik uzmanları, çalışanların kimlik bilgilerinin çalınmasını önlemek için donanım tabanlı güvenlik anahtarları ve biyometrik doğrulama standartlarının artık bir tercih değil yasal zorunluluk haline geldiğini belirtiyor.",
            ],
        ];

        foreach ($realArticles as $idx => $art) {
            $category = $savedCategories[$art['category']] ?? null;
            if (!$category) continue;

            $author = $savedAuthors[$art['author_idx'] % count($savedAuthors)];

            News::updateOrCreate(
                ['slug' => $art['slug']],
                [
                    'category_id' => $category->id,
                    'author_id' => $author->id,
                    'title' => $art['title'],
                    'excerpt' => $art['excerpt'],
                    'content' => $art['content'],
                    'image' => $art['image'],
                    'status' => 'published',
                    'is_featured' => $art['is_featured'],
                    'views' => 0,
                    'published_at' => now()->subHours($idx * 3 + rand(1, 4)),
                ]
            );
        }
    }
}

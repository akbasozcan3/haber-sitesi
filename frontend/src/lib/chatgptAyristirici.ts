/**
 * ChatGPT / Yapay Zeka Makale Ayrıştırıcı (Smart AI Content Parser)
 * 
 * ChatGPT'den veya yapay zeka araçlarından kopyalanan ham metinleri (SEO Title,
 * Meta Description, Slug, Excerpt, Odak Anahtar Kelime vb. etiketleri) tespit edip
 * formu (Başlık, Slug, Spot ve Temiz İçerik) tek tıkla otomatik doldurur.
 */

export interface AyristirilmisMakale {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
}

export function slugYap(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function chatGptMakalesiniAyristir(hamMetin: string): AyristirilmisMakale {
  if (!hamMetin || !hamMetin.trim()) {
    return { title: "", slug: "", excerpt: "", content: "" };
  }

  // HTML etiketleri varsa normalize et (örneğin <p>, <br> vb.)
  let text = hamMetin
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\r\n/g, "\n")
    .trim();

  // 1. ChatGPT sohbet giriş cümlelerini temizle
  text = text.replace(/^(?:Tabii|Elbette|Merhaba|Harika|İşte)[\s\S]*?(?:dahil:?|şekilde:?|hazırladım:?|içerik:?)\s*/i, "");

  let title = "";
  let slug = "";
  let excerpt = "";

  // 2. Özel Etiketleri RegEx ile tara
  const titleMatch = text.match(/(?:^|\n)(?:Başlık|Haber Başlığı|Title)\s*:\s*([^\n]+)/i);
  const seoTitleMatch = text.match(/(?:^|\n)SEO\s*Title\s*:\s*([^\n]+)/i);
  const slugMatch = text.match(/(?:^|\n)Slug\s*:\s*([^\n]+)/i);
  const metaDescMatch = text.match(/(?:^|\n)Meta\s*Description\s*:\s*([^\n]+)/i);

  if (slugMatch) {
    slug = slugYap(slugMatch[1].trim());
  }

  if (metaDescMatch) {
    excerpt = metaDescMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  // Excerpt arama (Excerpt: etiketinden sonraki metin)
  const excerptBlockMatch = text.match(/(?:^|\n)(?:Excerpt|Spot|Özet)\s*:\s*\n*([\s\S]*?)(?=\n\s*(?:[A-ZÇĞİÖŞÜ][^\n?:]+\?|##|\n\n|$))/i);
  if (excerptBlockMatch && excerptBlockMatch[1].trim()) {
    excerpt = excerptBlockMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  if (titleMatch) {
    title = titleMatch[1].trim();
  } else {
    // İlk satır etiket değilse başlık olarak kabul et
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (/^(SEO Title|Meta Description|Slug|Odak Anahtar|İkincil Anahtar|Excerpt|Spot|Keywords|Başlık|Title):/i.test(line)) {
        break;
      }
      if (line.length > 5 && !line.startsWith("```")) {
        title = line;
        break;
      }
    }
    if (!title && seoTitleMatch) {
      title = seoTitleMatch[1].trim();
    }
  }

  title = title.replace(/^[\*#"`'\s]+|[\*#"`'\s]+$/g, "").replace(/^Başlık\s*:\s*/i, "");

  if (!slug && title) {
    slug = slugYap(title);
  }

  // 3. Makale gövdesini oluştur (Tüm meta etiketleri ve başlığı makale içinden temizle)
  const allLines = text.split("\n");
  let skippingExcerpt = false;
  const cleanBodyLines: string[] = [];

  const isMetaTagLine = (l: string) => {
    return /^(?:SEO\s*Title|Meta\s*Description|Slug|Odak\s*Anahtar(?:\s*Kelime(?:si)?)?|İkincil\s*Anahtar(?:\s*Kelime(?:ler)?)?|Anahtar\s*Kelimeler?|Keywords?|Focus\s*Keyword?|Secondary\s*Keywords?|Kategori|Category|Etiketler?|Tags?|Haber\s*Başlığı|Başlık)\s*:/i.test(l);
  };

  const isHeadingLine = (l: string) => {
    if (!l) return false;
    if (l.startsWith("#")) return true;
    if (l.length < 100 && (l.endsWith("?") || (/^[A-ZÇĞİÖŞÜ0-9][^.\n]{5,90}$/.test(l) && !l.endsWith(".") && !l.endsWith(":") && !l.endsWith(",")))) {
      return true;
    }
    return false;
  };

  for (let i = 0; i < allLines.length; i++) {
    const rawLine = allLines[i];
    const line = rawLine.trim();

    // Başlık zaten üst alana yazıldıysa ilk satırlardaki başlığı atla
    if (cleanBodyLines.length === 0 && title && (line === title || line.replace(/[*#]/g, "").trim() === title)) {
      continue;
    }

    // Meta etiket satırıysa atla
    if (isMetaTagLine(line)) {
      skippingExcerpt = false;
      continue;
    }

    // Excerpt başlangıcı
    if (/^(?:Excerpt|Spot|Özet)\s*:/i.test(line)) {
      skippingExcerpt = true;
      const after = line.replace(/^(?:Excerpt|Spot|Özet)\s*:\s*/i, "").trim();
      if (after && !excerpt) {
        excerpt = after.replace(/^["']|["']$/g, "");
      }
      continue;
    }

    if (skippingExcerpt) {
      if (isHeadingLine(line)) {
        skippingExcerpt = false;
      } else if (!line) {
        skippingExcerpt = false;
        continue;
      } else {
        if (!excerpt) excerpt = line.replace(/^["']|["']$/g, "");
        continue;
      }
    }

    // ChatGPT selamlama / kapanış satırları
    if (/^(Tabii|Elbette|Aşağıda|İşte)[\s\S]*?(hazırladım|dahil|metin):?$/i.test(line)) {
      continue;
    }

    // Başlık satırı tespit edildiyse öncesine ve sonrasına boşluk vererek H2 yap
    if (isHeadingLine(line)) {
      cleanBodyLines.push("");
      const headingText = line.startsWith("#") ? line : `## ${line}`;
      cleanBodyLines.push(headingText);
      cleanBodyLines.push("");
      continue;
    }

    // Boş satırlar
    if (!line) {
      if (cleanBodyLines.length > 0 && cleanBodyLines[cleanBodyLines.length - 1] !== "") {
        cleanBodyLines.push("");
      }
      continue;
    }

    cleanBodyLines.push(rawLine);
  }

  const finalContent = cleanBodyLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    title,
    slug,
    excerpt,
    content: finalContent,
  };
}

# DCC Döner Catering Club — Workspace Engineering & Craft Rules

## 1. Türkçe Döner Terminolojisi Kuralı
- Almanca `Dönerspieß` / `Spieß` veya İngilizce `Spit` terimleri Türkçeye çevrilirken **asla** `"Şiş"`, `"Et Şiş"`, `"Tavuk Şiş"`, `"Şiş Seçimi"` veya `"Çift Şiş"` ifadeleri kullanılmaz (Türk gastronomisinde "şiş", şiş kebap anlamına gelir).
- Ürün adı, başlık, etiket ve SSS metinlerinde daima **"Döner"**, **"Yaprak Döner"**, **"Tavuk Döner"**, **"Döner Seçimi"** ve **"Çift Döner"** kullanılır.
- İstisna: Yalnızca logo veya fiziksel dikey döner demiri kastedildiğinde teknik parça adı olarak `"Döner Ocağı"` veya `"Dikey Döner Mili"` tercih edilir.

## 2. Sticky Hesaplayıcı & Maliyet Özeti Kaydırma Kuralı
- Çok adımlı fiyat hesaplayıcılarında (`#rechner`) sağdaki maliyet özeti (`#rechner-summary`) sayfa aşağı kaydırıldıkça kullanıcıyla birlikte kesintisiz hareket etmelidir (`position: sticky`).
- `html` dışında `body`, `#root` ve kapsayıcı `<section>` elemanlarında **asla** `overflow-x: hidden` veya ara `overflow-x: clip` kullanılmaz; tek viewport scroll kapsayıcısı `document.documentElement` olmalıdır.
- `.dcc-configurator-grid` içinde sağ sütun `.dcc-sticky-summary` üzerinde `position: sticky; top: 5rem; align-self: start; max-height: calc(100vh - 5.75rem); overflow-y: auto;` uygulanır ve özet kartı `1280x780` laptop ekranında toplam + CTA butonlarını kesmeden tek bakışta gösterecek kadar kompakt tutulur.

## 3. Minimalist Architectural Club (Tesla × Apple × Togg) Görsel Disiplini
- Gastronomy & private-club arayüzlerinde neon cyan (`#38BDF8`), neon yeşil (`#34D399`), pembe (`#FB7185`), gökkuşağı yazı gradyanları ve kripto/SaaS jargonu **yasaktır**.
- Yalnızca sıcak mat obsidyen (`#0B0A09`), kömür (`#141210`), fırçalanmış pirinç (`#D49B54`), köz terakota (`#C84B27` / `#E06440`), yumuşak adaçayı/ot yeşili (`#7AB887`) ve kemik (`#F3ECE0`) tonları; 1px hairline kenarlıklar ve bol negatif boşlukla kullanılır.

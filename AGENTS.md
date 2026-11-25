# DCC Döner Catering Club — Workspace Engineering & Craft Rules

## 1. Türkçe Döner Terminolojisi Kuralı
- Almanca `Dönerspieß` / `Spieß` veya İngilizce `Spit` terimleri Türkçeye çevrilirken **asla** `"Şiş"`, `"Et Şiş"`, `"Tavuk Şiş"`, `"Şiş Seçimi"` veya `"Çift Şiş"` ifadeleri kullanılmaz (Türk gastronomisinde "şiş", şiş kebap anlamına gelir).
- Ürün adı, başlık, etiket ve SSS metinlerinde daima **"Döner"**, **"Yaprak Döner"**, **"Tavuk Döner"**, **"Döner Seçimi"** ve **"Çift Döner"** kullanılır.
- İstisna: Yalnızca logo veya fiziksel dikey döner demiri kastedildiğinde teknik parça adı olarak `"Döner Ocağı"` veya `"Dikey Döner Mili"` tercih edilir.

## 2. Sticky Hesaplayıcı & Maliyet Özeti Kaydırma Kuralı
- Çok adımlı fiyat hesaplayıcılarında (`#rechner`) sağdaki maliyet özeti (`#rechner-summary`) sayfa aşağı kaydırıldıkça kullanıcıyla birlikte kesintisiz hareket etmelidir (`position: sticky`).
- `html` dışında `body`, `#root` ve kapsayıcı `<section>` elemanlarında **asla** `overflow-x: hidden` veya ara `overflow-x: clip` kullanılmaz; tek viewport scroll kapsayıcısı `document.documentElement` olmalıdır.
- `.dcc-configurator-grid` içinde sağ sütun `.dcc-sticky-summary` üzerinde `position: sticky; top: 5rem; align-self: start; max-height: calc(100vh - 5.75rem); overflow-y: auto;` uygulanır ve özet kartı `1280x780` laptop ekranında toplam + CTA butonlarını kesmeden tek bakışta gösterecek kadar kompakt tutulur.

## 3. Minimalist Pure Black + Bold White Montserrat + Gold/Emerald Disiplini
- Gastronomy & catering arayüzlerinde neon cyan (`#38BDF8`), pembe (`#FB7185`), gökkuşağı yazı gradyanları ve kripto/SaaS jargonu **yasaktır**.
- Ana tuval derin siyah (`#060606`), kartlar `#0D0F0E`, başlıklar kalın beyaz **Montserrat** (`#FFFFFF`), vurgular ise **Altın (`#D4A853`) → Zümrüt Yeşili (`#2BC48A`)** renk geçişiyle uygulanır; kartlarda `.dcc-lux-card` imleç takipli hover parlaması kullanılır.
- Başlıklarda ve sloganlarda gece kulübü (`Clubkultur`, `Kulüp Gecesi` vb.) çağrışımı yerine kurumsal ve özel davet dili (`Perfektion`, `Event-Trailer`, `Open-Air`) tercih edilir.

import type { TranslationSchema } from '../types/i18n';

export const tr: TranslationSchema = {
  meta: {
    title: 'DCC Döner Catering Club — Canlı Döner Catering & Hesaplayıcı',
    description:
      'Ember-Cut Architectural Hospitality: Berlin’de 30 ila 800+ konukluk etkinlikler için el dizimi yaprak dönerler, canlı kesim istasyonları ve otonom Event-Trailer.',
    skipToContent: 'Ana içeriğe geç',
  },
  header: {
    brandSubtitle: 'BERLİN · EST. 2026',
    nav: {
      calculator: 'Hesaplayıcı',
      culinary: 'Lezzetler',
      gallery: 'Galeri',
      timeline: 'Akış',
      production: 'Üretim & Kalite',
      faq: 'SSS',
      brandKit: 'Marka Kiti',
    },
    phoneLabel: '+49 30 8145 6789',
    phoneHref: 'tel:+493081456789',
    cta: 'Teklif Al',
    langSwitcherAria: 'Dil seçin',
    langLabels: {
      de: 'DE',
      en: 'EN',
      tr: 'TR',
    },
  },
  introSplash: {
    eyebrow: 'BERLİN · CANLI YAPRAK DÖNER CATERING',
    title: 'DCC Döner Catering Club',
    subtitle: 'Kurumsal davetler, düğünler ve 30–800+ misafir için seçkin canlı döner catering.',
    skipHint: 'Geçmek için ESC veya tıklayın',
    skipButton: 'Keşfet',
    ariaLabel: 'DCC Döner Catering Club açılış sekansı',
  },
  hero: {
    eyebrow: 'BERLİN · %100 YAPRAK · 30–800+ MİSAFİR',
    headlinePrefix: 'Canlı',
    headlineAccent: 'Yaprak Döner',
    headlineSuffix: 'Catering.',
    subtitle:
      'El işçiliğiyle dizilmiş yaprak et katmanları, köz dengesi ve kusursuz servis — 30 kişiden başlayan kurumsal davetler, düğünler ve büyük organizasyonlar için ocak başından canlı döner kesimi.',
    primaryCta: 'Bütçeyi Şimdi Hesapla',
    secondaryCta: 'Etkinlik Galerisini Gör',
    brandKitCta: 'Marka Kiti & Kurallar',
    viewToggleLabel: 'Sahne kurulumunu değiştir',
    views: {
      station: 'Live-Station · Canlı İstasyon',
      trailer: 'Event-Trailer · Mobil Araç',
    },
    highlights: [
      { value: '30–800+', label: 'Etkinlik Kapasitesi' },
      { value: '%15’e kadar', label: 'Hacim İndirimi' },
      { value: '%100', label: 'Helal & AB Onaylı' },
    ],
  },
  mobileBottomBar: {
    ariaLabel: 'Hızlı mobil gezinme',
    start: 'Ana Sayfa',
    calculator: 'Hesapla',
    gallery: 'Galeri',
    whatsapp: 'WhatsApp',
    call: 'Ara',
  },
  themeSwitcher: {
    ariaLabel: 'Renk temasını seçin',
    themes: {
      obsidian: 'Obsidyen & Pirinç',
      limestone: 'Kireçtaşı & Bronz',
      'emerald-club': 'Zümrüt & Pirinç',
    },
    replayIntro: 'Açılışı Oynat',
  },
  calculator: {
    eyebrow: 'ŞEFFAF CATERING HESAPLAYICI',
    title: 'Etkinliğinizi Anlık Hesaplayın',
    subtitle:
      'Net toplam, %19 KDV, brüt tutar ve kişi başı maliyet dökümünü otomatik hacim indirimiyle dört adımda görün.',
    steps: {
      guests: {
        index: '01',
        title: 'Misafir Sayısı & Etkinlik Türü',
        subtitle:
          'Katılımcı sayısını belirleyin (30–800 kişi) veya 800+ Kurumsal büyük etkinlik seçeneğini etkinleştirin.',
        inputLabel: 'Misafir Sayısı',
        sliderAria: 'Misafir sayısını kaydırıcı ile ayarlayın',
        decreaseAria: 'Misafir sayısını 10 azalt',
        increaseAria: 'Misafir sayısını 10 artır',
        guestUnitSingular: 'kişi',
        guestUnitPlural: 'kişi',
        minOrderNote: 'Minimum rezervasyon: 30 kişi',
        maxRangeNote: 'Standart kademe 800 kişiye kadar',
        clampedMinNotice: 'Minimum 30 kişi sınırına göre uyarlandı.',
        clampedMaxNotice:
          'Hesaplayıcı tabanı 800 kişiye sabitlendi — 800+ Kurumsal talep aktif.',
        enterpriseToggle: '800+ Kurumsal / Büyük Etkinlik',
        enterpriseActiveNote:
          '800+ Kurumsal mod aktif: özet fişi 800 kişilik taban bütçeyi gösterir, teklifiniz tam ölçeği taşır.',
        tiersLabel: 'Tüm döner çeşitlerinde otomatik hacim indirimi',
        tiers: {
          tier0: '30–99 · Temel tarife',
          tier5: '100–249 · %5 indirim',
          tier10: '250–499 · %10 indirim',
          tier15: '500–800+ · %15 indirim',
        },
        activeDiscountPrefix: 'Aktif indirim:',
        noDiscountLabel: 'Standart tarife (%0)',
        eventTypeLabel: 'Etkinlik Kategorisi',
        eventTypes: {
          corporate: {
            label: 'Kurumsal / Zirve',
            hint: 'KDV faturalandırma & B2B dakiklik',
          },
          private: {
            label: 'Düğün / VIP',
            hint: 'Gece yarısı canlı kesim şovu',
          },
          festival: {
            label: 'Festival / Açık Hava',
            hint: 'Açık alanda yüksek servis hızı',
          },
        },
      },
      spits: {
        index: '02',
        title: 'Üretim Mutfağından Döner Seçimi',
        subtitle:
          'Her döner Berlin’de günlük olarak el emeğiyle hazırlanır — %100 yaprak etten özel vegan seitan dönere kadar.',
        perGuestSuffix: '/ kişi',
        discountedBadgePrefix: 'dahil',
        duoMinBadge: 'min. 100 kişi',
        duoFloorWarning:
          'Signature Duo en az 100 kişi için sunulur — hesaplama tabanı otomatik olarak 100 kişiye ayarlandı.',
        items: {
          scheiben: {
            roman: 'I',
            badge: 'İmza · %100 Yaprak',
            title: 'Yaprak Dana Döner',
            spec: 'Kıymasız bütün dana antrikot ve but katmanları, sumak ve dağ otlarıyla 24 saat marine edilmiş özel kesim.',
            dietaryTag: 'Helal · Kıymasız Yaprak',
          },
          kalb: {
            roman: 'II',
            badge: 'Berlin Klasiği',
            title: 'Klasik Dana & Süt Dana Döner',
            spec: 'Dengeli baharat profiliyle hazırlanan, dışı çıtır içi sulu Berlin usulü klasik yaprak & dana karışımı.',
            dietaryTag: 'Helal · Yumuşak Doku',
          },
          chicken: {
            roman: 'III',
            badge: 'Hafif & Aromatik',
            title: 'Tavuk Döner',
            spec: 'Yoğurt, limon kabuğu ve Halep biberi ile marine edilmiş kemiksiz tavuk butlarından hafif ve hızlı servis.',
            dietaryTag: 'Helal · Yüksek Hız',
          },
          duo: {
            roman: 'IV',
            badge: 'min. 100 kişi · Çift Döner',
            title: 'Signature Duo (Dana + Tavuk)',
            spec: 'Büyük şirket etkinlikleri ve düğünler için aynı anda iki ocak ve çift kesim ustasıyla maksimum çeşitlilik.',
            dietaryTag: 'Helal · Çift İstasyon',
          },
          vegan: {
            roman: 'V',
            badge: '%100 Bitkisel',
            title: 'Zanaat Vegan Seitan Döner',
            spec: 'Ayrı döner ocağında pişen isli organik seitan dilimleri, taze ot yağı, nar ekşisi dokunuşu ve köz sebzelerle.',
            dietaryTag: 'Vegan · Ayrı Ekipman',
          },
        },
      },
      setups: {
        index: '03',
        title: 'Kurulum & Sunum Mimarisi',
        subtitle:
          'Mekânınıza uygun mimari kurulum — otel balo salonlarından açık hava festival avlularına kadar.',
        flatFeeLabel: 'Sabit kurulum bedeli (net)',
        items: {
          station: {
            badge: 'İç Mekân & Teras',
            title: 'Live-Station (Mat Çelik)',
            spec: 'Entegre havalandırmalı, ısı köprülü paslanmaz çelik ve eskitme pirinç detaylı canlı kesim istasyonu.',
          },
          truck: {
            badge: 'Dış Mekân & Otonom',
            title: 'Event-Trailer (Mat Siyah)',
            spec: 'Kendi soğutma, güç dağıtımı ve çift ocak kapasitesine sahip tam donanımlı DCC etkinlik aracı.',
          },
          buffet: {
            badge: 'Kompakt & Hızlı',
            title: 'Executive Açık Büfe Barı',
            spec: 'Yoğun konferans öğle araları için taze kesilmiş porsiyonlarla kurulan şık ve pratik sunum düzeni.',
          },
        },
      },
      extras: {
        index: '04',
        title: 'Kişi Başı Ekstra Seçenekler',
        subtitle:
          'Taş fırın pide, Berlin içecek barı ve Gaziantep fıstıklı baklava ile deneyimi tamamlayın.',
        perGuestSuffix: 'kişi başı',
        activeLabel: 'Seçildi',
        inactiveLabel: 'Ekle',
        items: {
          bread_salad: {
            title: 'Taş Fırın Pide, Salata & İmza Soslar',
            spec: 'Susamlı taş fırın pidesi, sumaklı mor lahana salatası, köz sebzeler ve üç ev yapımı sos.',
          },
          drinks: {
            title: 'İçecek Barı (Ayran, Gazoz & Club-Mate)',
            spec: 'Taze naneli ev yapımı ayran, Uludağ, Fritz-Kola, Club-Mate ve soğutulmuş sular.',
          },
          dessert: {
            title: 'Gaziantep Fıstıklı Baklava & Çay',
            spec: 'Çıtır Antep fıstıklı baklava ve semaverde demlenmiş taze Türk çayı servisi.',
          },
        },
      },
    },
  },
  receipt: {
    eyebrow: 'CANLI TEKLİF · ÖN HESAPLAMA',
    title: 'Maliyet Özeti',
    refLabel: 'Referans',
    dateLabel: 'Tarih',
    guestsLabel: 'Misafir Sayısı',
    eventTypeLabel: 'Format',
    meatLabel: 'Döner Seçimi',
    discountLabel: 'Hacim İndirimi',
    setupLabel: 'Kurulum',
    extrasLabel: 'Ekstralar',
    extrasNone: 'Ekstra seçilmedi',
    subtotalNetLabel: 'Ara Toplam (Net)',
    vatLabel: 'KDV %19',
    totalGrossLabel: 'Genel Toplam (Brüt)',
    perGuestNetLabel: 'Kişi Başı · Net',
    perGuestGrossLabel: 'Kişi Başı · Brüt',
    enterpriseBanner:
      '800+ Kurumsal Talep: Özet, özel büyük etkinlik teklifiniz için 800 kişilik taban bütçeyi gösterir.',
    duoAppliedNotice:
      'Duo alt sınırı aktif: hesaplama 100 kişi tabanı üzerinden yapılmıştır.',
    whatsappCta: 'WhatsApp ile Gönder',
    modalCta: 'Teklif Al',
    mobileBarJump: 'Teklif',
  },
  quoteModal: {
    eyebrow: 'BAĞLAYICI OLMAYAN ETKİNLİK ÖZETİ',
    title: 'DCC Catering Talebinizi İletin',
    subtitle:
      'Hesaplama özetinizi kontrol edin, etkinlik tarihini ve iletişim bilgilerinizi ekleyip WhatsApp, pano veya yazdır ile paylaşın.',
    closeAria: 'Teklif penceresini kapat',
    enterpriseBadge: '800+ Kurumsal / Büyük Etkinlik',
    kpis: {
      guests: 'Misafir',
      perGuestNet: 'Kişi Başı (Net)',
      subtotalNet: 'Net',
      vat: 'KDV %19',
      totalGross: 'Brüt',
    },
    fields: {
      name: {
        label: 'Yetkili Ad Soyad',
        placeholder: 'örn. Çağlar Yıldırım',
      },
      company: {
        label: 'Şirket / Ajans',
        placeholder: 'örn. Berlin Tech GmbH',
      },
      email: {
        label: 'Kurumsal E-posta',
        placeholder: 'ad@sirket.com',
      },
      phone: {
        label: 'Telefon / GSM',
        placeholder: '+49 30 9876543',
      },
      eventDate: {
        label: 'Planlanan Etkinlik Tarihi',
      },
      vatId: {
        label: 'KDV / Vergi No (isteğe bağlı)',
        placeholder: 'örn. DE123456789',
      },
      notes: {
        label: 'Mekân & Notlar (isteğe bağlı)',
        placeholder: 'Konum / Şehir (Berlin ve en fazla 300 km çevresi), saat, araç erişimi veya özel diyet talepleri…',
      },
    },
    requiredMark: 'Zorunlu',
    optionalMark: 'İsteğe bağlı',
    errors: {
      validation_name_required: 'Lütfen iletişim adını girin (zorunlu alan).',
      validation_email_required: 'Lütfen e-posta adresinizi girin.',
      validation_email_invalid: 'Lütfen geçerli bir e-posta adresi girin.',
      validation_phone_required: 'Lütfen telefon numaranızı girin.',
      validation_phone_invalid: 'Lütfen geçerli bir telefon numarası girin.',
      validation_date_required: 'Lütfen etkinlik tarihini seçin.',
      validation_date_invalid: 'Lütfen geçerli bir takvim tarihi girin.',
      validation_date_past:
        'Etkinlik tarihi bugün veya gelecek bir tarih olmalıdır.',
      validation_vat_invalid:
        'Lütfen KDV / Vergi No formatını kontrol edin (örn. DE123456789).',
      formBanner: 'Lütfen göndermeden önce işaretli zorunlu alanları düzeltin.',
    },
    actions: {
      whatsapp: 'WhatsApp ile Gönder',
      copy: 'Teklifi Kopyala',
      copied: 'Kopyalandı!',
      print: 'Yazdır / PDF',
    },
    privacyHint:
      'Arka planda gizli gönderim yapılmaz: bilgileriniz yalnızca WhatsApp, kopyalama veya yazdırma seçildiğinde yerel olarak hazırlanır.',
  },
  gallery: {
    eyebrow: 'ÖRNEK ETKİNLİKLER',
    title: 'Berlin Geceleri & Kurumsal Zirveler İçin Tasarlandı',
    subtitle:
      'Dört kanıtlanmış saha kurulumu — ofis öğle yemeklerinden büyük festival avlularına.',
    prevAria: 'Önceki',
    nextAria: 'Sonraki',
    dotAriaPrefix: 'Slayt',
    counterSeparator: '/',
    slides: [
      {
        id: 'corporate',
        tag: '01 · KURUMSAL ZİRVE',
        title: 'Teknoloji Konferansları & Ofis Buluşmaları',
        description:
          '120 ila 600 misafir için %19 KDV faturalı, dakik ve ayrı vegan hatlı hızlı servis.',
        bullets: [
          'Çift kesim istasyonunda saatte 150+ porsiyon hız',
          'KDV kimlik numaralı kurumsal B2B fatura dökümü',
          'Her servis tepsisinde net alerjen işaretlemesi',
        ],
      },
      {
        id: 'wedding',
        tag: '02 · VIP DÜĞÜN & GALA',
        title: 'Gece Yarısı İmza Döner Şovu',
        description:
          'Sıcak pirinç detaylar, mat paslanmaz çelik ve taze kesilmiş yaprak dilimleriyle düğünün unutulmaz anı.',
        bullets: [
          'Mumlanmış DCC atölye önlüklü usta kesim şefi',
          'Taş fırın pide, trüflü sumak sos & Antep baklavası',
          'Oteller için düşük kokulu indüksiyon & filtre çözümü',
        ],
      },
      {
        id: 'festival',
        tag: '03 · FESTİVAL & AÇIK HAVA',
        title: 'Event-Trailer ile Tam Otonom Güç',
        description:
          'Açık hava avluları için kendi soğutma ve elektrik sistemine sahip mat siyah mobil araç.',
        bullets: [
          'Mekân mutfağından tamamen bağımsız çalışma',
          'Günlük 800+ porsiyona kadar yüksek kapasite',
          'Helal sertifikalı etler & ayrı Vegan Seitan döneri',
        ],
      },
      {
        id: 'vip',
        tag: '04 · MARKA LANSMANI & GALERİ',
        title: 'Markalar & Sanat Mekânları İçin Özel Sunum',
        description:
          'Kireçtaşı ve obsidyen modüller üzerinde özel baskılı ambalajlarla minimalist sunum.',
        bullets: [
          'DCC monogram baskılı yağlı kâğıt & termal kutular',
          'DE / EN / TR üç dilli basılı menü kartları',
          'Davet saatleri dışında sessiz ve hızlı kurulum',
        ],
      },
    ],
  },
  bento: {
    eyebrow: 'ÜRETİM & HİJYEN DİSİPLİNİ',
    title: 'Organizatörler Neden DCC’yi Seçiyor?',
    subtitle:
      'Berlin’de kendi döner üretimimiz, kesintisiz soğuk zincir ve deneyimli etkinlik ekibi.',
    cards: [
      {
        id: 'manufaktur',
        tag: 'BERLİN ÜRETİMİ',
        title: 'Hazır Ürün Değil, Günlük El Dizimi',
        description:
          'AB (EU) veteriner onaylı etlerle kendi tesisimizde günlük hazırlık, %100 Helal (Halal) sertifikası ve saf yaprak dizimi.',
        checkBadge: '%100 Helal (Halal) · AB (EU) Onaylı',
      },
      {
        id: 'logistics',
        tag: 'SOĞUK ZİNCİR & IFS',
        title: 'Kesim Anına Kadar Belgeli Hijyen',
        description:
          'Berlin soğuk hava deposundan etkinlik alanındaki sıcak bıçağa kadar kesintisiz HACCP ve IFS sıcaklık takibi.',
        checkBadge: 'EU Hijyen · IFS Standardı',
      },
      {
        id: 'highspeed',
        tag: 'YÜKSEK SERVİS HIZI',
        title: 'Büfe Önünde Uzun Kuyruklar Yok',
        description:
          'Paralel kesim istasyonları ve ön ısıtmalı taş fırın lojistiği beklemesiz, kesintisiz taze servis sağlar.',
        checkBadge: '30–800+ Misafir · Dakik Servis',
      },
    ],
  },
  culinary: {
    eyebrow: 'LEZZET MİMARİSİ',
    title: 'Taş Fırın Pide, İmza Soslar & Antep Finali',
    subtitle:
      'Döner deneyimini tamamlayan üç temel bileşen — tek tıkla hesaplayıcıya ekleyin.',
    includedLabel: 'Ekstra Paket İçeriği',
    addExtraCta: 'Hesaplayıcıya Ekle',
    addedExtraLabel: 'Hesaplayıcıda Aktif',
    tabs: [
      {
        id: 'bread',
        tabLabel: '01 · Taş Fırın Pide & Salata',
        extraId: 'bread_salad',
        headline: 'Çıtır Kabuk ve Sumak Ferahlığı',
        description:
          'Berlin’de günlük pişen susamlı taş fırın pidesi ve limonlu, zeytinyağlı sumaklı mor lahana salatası.',
        image: '/media/setup-buffet.png',
        items: [
          {
            name: 'Berlin Taş Fırın Pidesi',
            detail: 'Kavrulmuş susam ve çörek otlu, etkinlik alanında sıcak ısıtılan özel pide.',
            tag: 'Günlük Fırın',
          },
          {
            name: 'Sumaklı Mor Lahana & Yeşillik',
            detail: 'Nar ekşisi, taze maydanoz ve nane ile dengelenmiş çıtır salata.',
            tag: '%100 Vegan',
          },
          {
            name: 'Közlenmiş Mevsim Sebzeleri',
            detail: 'Köz kapya biber ve kırmızı soğan ile ete eşlik eden sıcak dokunuş.',
            tag: 'Mevsimsel',
          },
        ],
      },
      {
        id: 'sauces',
        tabLabel: '02 · 3 İmza Sos',
        extraId: 'bread_salad',
        headline: 'Katkısız Üç Ev Yapımı Reçete',
        description:
          'Her sos etkinlik günü taze hazırlanır; vegan ve klasik hatlar için ayrı servis edilir.',
        image: '/media/spit-signature-duo.png',
        items: [
          {
            name: 'Taze Otlu Yoğurt Sos',
            detail: 'Süzme yoğurt, dereotu, taze nane ve ince limon kabuğu rendesi.',
            tag: 'Klasik',
          },
          {
            name: 'Köz Sarımsak & Tahin',
            detail: 'İpeksi susam tahini ve ağır ateşte közlenmiş sarımsak dengesi.',
            tag: 'Vegan Uyumlu',
          },
          {
            name: 'Halep Biberi & Sumak Sos',
            detail: 'Urfa biberi, olgun domates ve soğuk sıkım zeytinyağı ile dengeli acı.',
            tag: '%100 Vegan',
          },
        ],
      },
      {
        id: 'pairings',
        tabLabel: '03 · İçecek & Baklava',
        extraId: 'dessert',
        headline: 'Berlin İçecek Barı & Gaziantep Baklavası',
        description:
          'Ev yapımı taze naneli ayrandan Club-Mate’e, çıtır Antep fıstıklı baklavadan semaver çayına.',
        image: '/media/gallery-wedding.png',
        items: [
          {
            name: 'Ev Yapımı Naneli Ayran',
            detail: 'Taze bahçe nanesi ve deniz tuzuyla soğuk çırpılmış özel ayran.',
            tag: 'Soğuk Servis',
          },
          {
            name: 'Berlin İçecek Seçkisi',
            detail: 'Club-Mate, Fritz-Kola, Uludağ gazoz ve soğutulmuş sular.',
            tag: 'Tam Servis',
          },
          {
            name: 'Gaziantep Fıstıklı Baklava & Çay',
            detail: '40 kat çıtır yufkalı Antep baklavası ve taze demlenmiş Türk çayı.',
            tag: 'Tatlı Final',
          },
        ],
      },
    ],
  },
  timeline: {
    eyebrow: 'OPERASYON & ZAMANLAMA',
    title: 'Talepten Kapanışa Dört Kusursuz Aşama',
    subtitle:
      'Ajanslar, oteller ve büyük davetler için dakik B2B saha yönetimi.',
    steps: [
      {
        code: 'T-48S',
        title: 'Üretim & Soğuk Zincir',
        detail: 'Yaprak dönerlerin Berlin’de günlük el dizimi ve kayıtlı HACCP soğuk sevkiyatı.',
        metric: '2–4 °C Kayıt',
      },
      {
        code: 'T-90D',
        title: 'Kurulum & Kalibrasyon',
        detail: 'İç mekân istasyonunun sessiz kurulumu veya otonom Event-Trailer yerleşimi.',
        metric: '90 Dk Kurulum',
      },
      {
        code: 'CANLI',
        title: 'Yüksek Hızlı Kesim',
        detail: 'Çift kesim istasyonu ile beklemesiz akış — kesintisiz canlı catering servisi.',
        metric: 'NON-STOP',
      },
      {
        code: 'T+30D',
        title: 'Temiz Teslim & Fatura',
        detail: 'Mekânın lekesiz teslimi ve %19 KDV dökümlü resmi B2B faturalandırma.',
        metric: '%19 KDV',
      },
    ],
  },
  references: {
    eyebrow: 'GÜVEN & REFERANSLAR',
    title: 'Berlin’in Seçkin Ev Sahipleri Tarafından Tercih Ediliyor',
    subtitle:
      'Teknoloji zirveleri, otel düğünleri ve yaratıcı ajans festivallerinden gerçek saha notları.',
    metrics: [
      { value: '30–800+', label: 'Esnek Misafir Kapasitesi' },
      { value: '< 2 Saat', label: 'Resmi Teklif Yanıt Süresi' },
      { value: '%100', label: 'Zamanında Kurulum Oranı' },
    ],
    items: [
      {
        tag: 'KURUMSAL ZİRVE · 380 MİSAFİR',
        quote:
          'Öğle arasında sıfır kuyruk ve atriumda bugüne kadar gördüğümüz en şık, en temiz catering istasyonu.',
        author: 'Head of Workplace, Berlin Tech Hub',
        meta: 'Live-Station · Yaprak Dana & Vegan',
      },
      {
        tag: 'VIP DÜĞÜN · 160 MİSAFİR',
        quote:
          'Mat çelik istasyondaki gece yarısı döner servisi tüm davetlileri büyüledi — hem çok zarif hem kusursuz lezzet.',
        author: 'Wedding Planner, Schlosshotel Berlin',
        meta: 'Signature Duo · Baklava & Çay',
      },
      {
        tag: 'AJANS FESTİVALİ · 550 MİSAFİR',
        quote:
          'Avluda tamamen otonom trailer, vergi numaralı hızlı faturalandırma ve saat gibi işleyen disiplinli ekip.',
        author: 'Executive Producer, Kreuzberg Creative',
        meta: 'Event-Trailer · Klasik Dana',
      },
    ],
  },
  faq: {
    eyebrow: 'SIK SORULAN SORULAR',
    title: 'Etkinlik Planlamanız İçin Net Yanıtlar',
    subtitle:
      'Helal sertifikasyonu, vegan ayrımı, elektrik gereksinimi ve kurumsal KDV faturalandırması.',
    items: [
      {
        id: 'halal',
        question: 'Tüm döner çeşitleriniz %100 Helal (Halal) sertifikalı mı?',
        answer:
          'Evet. Yaprak dana, klasik dana ve tavuk dönerlerimizin tamamı AB (EU) veteriner onaylı ve Helal sertifikalı tesislerden gelir. Talep halinde sertifikalar teklif dosyasına eklenir.',
      },
      {
        id: 'vegan',
        question: 'Vegan Seitan döner nasıl pişirilir ve etten nasıl ayrılır?',
        answer:
          'Zanaat Vegan Seitan dönerimiz tamamen ayrı bir döner ocağında, ayrı bıçak, maşa ve kesme tahtalarıyla hazırlanarak çapraz bulaşma riskini sıfırlar.',
      },
      {
        id: 'logistics',
        question: 'Live-Station veya Event-Trailer için hangi bağlantılar gerekir?',
        answer:
          'İç mekân Live-Station kurulumu için iki adet ayrı 230V (16A) priz ve yaklaşık 3 × 2 metre alan yeterlidir. Event-Trailer ise 16A/32A CEE veya kendi hibrit sistemiyle otonom çalışır. Hizmet alanımız Berlin ve çevresinde en fazla 300 km mesafeyi kapsar.',
      },
      {
        id: 'billing',
        question: 'Hacim indirimleri ve kurumsal KDV faturalandırması nasıl işler?',
        answer:
          '100+ kişide %5, 250+ kişide %10 ve 500+ kişide %15 indirim döner birim fiyatına otomatik uygulanır. Kurumsal müşterilere %19 KDV ve vergi no içeren resmi fatura düzenlenir.',
      },
      {
        id: 'hygiene',
        question: 'Hangi gıda güvenliği ve hijyen standartlarını uyguluyorsunuz?',
        answer:
          'HACCP protokolleri, IFS uyumlu parti takibi ve kesintisiz Soğuk Zincir (2–4 °C taşıma, kesimde > 70 °C iç sıcaklık) denetimi ile çalışıyoruz.',
      },
      {
        id: 'capacity',
        question: 'DCC 800 kişiyi aşan büyük festivallerde hizmet verebilir mi?',
        answer:
          'Evet. 1. adımda "800+ Kurumsal / Büyük Etkinlik" seçeneğini işaretleyip talep iletin; birden fazla Event-Trailer ve çift istasyonla özel vardiya planı hazırlıyoruz.',
      },
    ],
  },
  brandKit: {
    eyebrow: 'KİMLİK SİSTEMİ · V1.0',
    title: 'DCC Marka Kiti & Görsel Kılavuz',
    subtitle:
      'DE / EN / TR tam kurumsal kimlik: 4 logo kilidi × 4 renk varyantı, WCAG onaylı renk tokenleri, özel tipografi ve 6 uygulama görseli.',
    backToCalculator: 'Hesaplayıcıya Dön',
    printButton: 'Marka Kitini Yazdır / PDF',
    openStandalone: 'Yazdırma Görünümü (brand-kit.html)',
    strategy: {
      eyebrow: '01 · MARKA MİMARİSİ',
      title: 'Konumlandırma & Manifesto',
      manifestoTitle: 'Ember-Cut Architectural Hospitality',
      manifestoText:
        'Ateş disiplin ister. Misafirperverlik ise mimari. DCC Döner Catering Club, Berlin sokak zanaatını modern etkinlik kültürünün merkezine taşır — el dizimi yaprak katmanları, açık ateş ve dakik B2B uygulama.',
      pillars: [
        {
          tag: 'SÜTUN 01 · B2B ZİRVELER',
          title: 'Ölçeklenebilir & Faturalı',
          body: '30–800+ konukluk şirket yemekleri ve konferanslar için net / %19 KDV dökümü ve hacim indirimi.',
        },
        {
          tag: 'SÜTUN 02 · VIP & DÜĞÜNLER',
          title: 'Gece Yarısı İmza Lezzeti',
          body: 'Mat çelik, sıcak pirinç, usta kesim şefi ve Gaziantep baklavasıyla unutulmaz akşam yemeği.',
        },
        {
          tag: 'SÜTUN 03 · FESTİVALLER',
          title: 'Otonom Etkinlik Gücü',
          body: 'Mat siyah Event-Trailer ile yüksek hız, %100 Helal standardı ve ayrı Vegan Seitan seçeneği.',
        },
      ],
      boilerplates: {
        shortLabel: 'Kısa Tanıtım (~25 Kelime)',
        shortText:
          'DCC Döner Catering Club, seçkin ve el işçiliği açık ateş döner zanaatını 30 ila 800+ konukluk kurumsal zirvelere, düğünlere ve festivallere taşır.',
        mediumLabel: 'Orta Tanıtım (~55 Kelime)',
        mediumText:
          'DCC Döner Catering Club, kendi üretimimiz el dizimi yaprak dönerleri mimari canlı kesim istasyonları ve tam donanımlı Event-Trailer araçlarıyla buluşturur. Berlin-Mitte’deki yönetici yemeklerinden 800 kişilik festival avlularına kadar hesaplayıcımız net, %19 KDV ve hacim indirimlerini saniyeler içinde çıkarır.',
      },
    },
    logos: {
      eyebrow: '02 · LOGO SİSTEMİ (16 VARYANT)',
      title: 'Dört Kilit × Dört Renk Varyantı',
      subtitle:
        'Tüm SVG dosyaları dış font bağımlılığı olmayan saf vektör yollarıdır. Önizleme zemini seçin ve SVG, PNG veya WebP indirin.',
      surfaceLabel: 'Önizleme Zemini',
      surfaces: {
        auto: 'En Uygun (Otomatik)',
        obsidian: 'Obsidyen #0B0A09',
        limestone: 'Kireçtaşı #FAF6EF',
        emerald: 'Zümrüt #071A14',
      },
      lockupNames: {
        primary: 'Birincil Yatay',
        stacked: 'Dikey Totem',
        seal: 'Arma Mührü',
        monogram: 'DCC Monogram',
      },
      colorwayNames: {
        light: 'Açık Mürekkep (Koyu Zemin)',
        dark: 'Koyu Mürekkep (Açık Zemin)',
        ember: 'Kor & Pirinç',
        mono: 'Tek Renk Monokrom',
      },
      downloadLabels: {
        svg: 'SVG',
        png: 'PNG',
        png2x: '@2x PNG',
        webp: 'WebP',
      },
    },
    clearSpace: {
      eyebrow: '03 · KORUMA ALANI & MİNİMUM BOYUTLAR',
      title: '1x Boşluk Modülü & Baskı Sınırları',
      description:
        'Temel modül x, amblem dış çapının 0,25× katıdır. Dört kenarda en az 1x kesintisiz boşluk bırakılmalıdır.',
      tableHeaders: {
        lockup: 'Kilit Türü',
        digitalMin: 'Dijital Minimum',
        printMin: 'Baskı Minimum',
      },
      monoNote:
        '28 px altındaki mikro boyutlar (tarayıcı sekmeleri ve uygulama ikonları) için sadeleştirilmiş favicon.svg kullanılır.',
    },
    dos: {
      eyebrow: '04 · KULLANIM KURALLARI',
      title: 'Doğru & Yanlış Uygulamalar',
      doLabel: 'Doğru',
      dontLabel: 'Yanlış',
      rules: [
        {
          code: 'DO-01',
          title: 'Doğru: Mürekkep Polaritesini Koru',
          detail:
            '-light varyantını yalnızca Obsidyen/Zümrüt üzerinde, -dark varyantını yalnızca Kireçtaşı veya kraft kâğıtta kullanın.',
          kind: 'do',
        },
        {
          code: 'DO-02',
          title: 'Doğru: 1x Koruma Alanını Koru',
          detail:
            'Logo çevresinde en az 1x boşluk bırakın; metin veya düğmeleri bu alana yaklaştırmayın.',
          kind: 'do',
        },
        {
          code: 'DO-03',
          title: 'Doğru: Döner Eksenini Dikey Tut',
          detail:
            'Döner ocağı ekseni 0° dik kalmalıdır; açılı tekrarlar yalnızca ambalaj sarma kâğıdında kullanılır.',
          kind: 'do',
        },
        {
          code: 'DONT-01',
          title: 'Yanlış: Oranı Bozma veya Eğme',
          detail:
            'Logo en-boy oranını asla uzatmayın ve iç içe arma halkalarını deforme etmeyin.',
          kind: 'dont',
        },
        {
          code: 'DONT-02',
          title: 'Yanlış: Gölge veya Parlama Ekleme',
          detail:
            'Logo arkasına bulanık CSS gölgeleri veya yapay neon parlamalar eklemeyin.',
          kind: 'dont',
        },
        {
          code: 'DONT-03',
          title: 'Yanlış: Onaysız Gradyan Kullanma',
          detail:
            'Marka paleti dışındaki mor/turkuaz gradyanları kullanmayın.',
          kind: 'dont',
        },
      ],
    },
    colors: {
      eyebrow: '05 · RENK SİSTEMİ & WCAG MATRİSİ',
      title: '13 Marka Rengi & 3 Doğrulanmış Tema',
      subtitle:
        'Hex kodunu panoya kopyalamak için herhangi bir renk kartına tıklayın. Tüm metin eşleşmeleri en az WCAG AA (≥ 5.35:1) sağlar.',
      copyButtonLabel: 'Hex Kopyala',
      copiedToastPrefix: 'Kopyalandı:',
      wcagTitle: 'WCAG 2.1 Kontrast Matrisi (Obsidyen / Kireçtaşı / Zümrüt)',
      wcagHeaders: {
        pair: 'Token Çifti',
        obsidian: 'Obsidyen',
        limestone: 'Kireçtaşı',
        emerald: 'Zümrüt & Pirinç',
        status: 'Seviye',
      },
      swatchRoles: {
        obsidian: 'Ana koyu zemin, tek renk baskı ve araç kaplaması',
        charcoal: 'Yükseltilmiş kart ve maliyet özeti yüzeyi',
        smoke: 'İkincil yüzey ve hover konteynerleri',
        warmBone: 'Koyu zemin üzerinde ana yazı ve sarma kâğıdı',
        parchmentLimestone: 'Gündüz Kireçtaşı zemini ve baskı kâğıdı',
        burnishedBrass: 'İmza metali, ana butonlar ve kaydırıcı',
        deepBronze: 'Açık zeminler için yüksek kontrastlı bronz',
        emberTerracotta: 'Metin dışı ateş dolgusu ve amblem vurgusu',
        liftedEmber: 'Obsidyen üzerinde AA uyumlu kor vurgu metni',
        kilnTerracotta: 'Kireçtaşı üzerinde AA uyumlu pişmiş toprak metni',
        emeraldClub: 'Zümrüt & Pirinç ana arka planı',
        halalHerb: 'Helal & Vegan botanik gösterge dolgusu',
        liftedHerb: 'Zümrüt üzerinde AA/AAA uyumlu yeşil vurgu metni',
      },
    },
    typography: {
      eyebrow: '06 · TİPOGRAFİ & TABLO RAKAMLARI',
      title: 'Dört Yerel Stüdyo Yazı Tipi',
      subtitle:
        'Türkçe ve Almanca tüm özel karakterlere (ğüşiöçİĞÜŞÖÇ äöüß) %100 destek ve tüm fiyat satırlarında zorunlu tablo rakamları.',
      specimenLinePrefix: 'Ateş &',
      specimenLineAccent: 'el dizimi zanaat',
      specimenLineSuffix: '— %19 KDV · €3.604,00 · İĞÜŞÖÇ',
      tabularLabel: 'Tablo Rakamları (tnum + lnum)',
    },
    applications: {
      eyebrow: '07 · MARKA UYGULAMALARI',
      title: 'Altı Gerçek Üretim Plakası',
      subtitle:
        'Ambalaj kâğıdı, servis kutusu, şef önlüğü, Event-Trailer giydirme, canlı istasyon ve sosyal medya şablonları.',
      plates: [
        {
          id: 'wrap-paper',
          file: '/brand/plate-wrap-paper.png',
          label: '01 · Yağlı Sarma Kâğıdı',
          caption: '45° monogram desenli 60 GSM ağartılmamış kâğıt.',
        },
        {
          id: 'catering-box',
          file: '/brand/plate-catering-box.png',
          label: '02 · Kurumsal Servis Kutusu',
          caption: 'Üç dilli Helal mühürlü yalıtımlı kraft ve obsidyen kutu.',
        },
        {
          id: 'chef-apron',
          file: '/brand/plate-chef-apron.png',
          label: '03 · Usta Şef Önlüğü',
          caption: 'Pirinç halkalı ve işlemeli 420 GSM mumlu kanvas önlük.',
        },
        {
          id: 'trailer-livery',
          file: '/brand/plate-trailer-livery.png',
          label: '04 · Event-Trailer Giydirme',
          caption: 'Pirinç kuşaklı mat siyah otonom araç tasarımı.',
        },
        {
          id: 'club-booth',
          file: '/brand/plate-club-booth.png',
          label: '05 · Canlı İstasyon Totemi',
          caption: 'Aydınlatmalı 5 döner menülü modüler iç mekân istasyonu.',
        },
        {
          id: 'social-templates',
          file: '/brand/plate-social-templates.png',
          label: '06 · Sosyal Medya Güvenli Alan',
          caption: '%14 üst ve %21 alt güvenli alanlı 1:1 ve 9:16 şablonlar.',
        },
      ],
    },
  },
  legal: {
    impressum: {
      id: 'impressum',
      title: 'Künye (Impressum)',
      badge: 'HAZIRLIK AŞAMASINDA · BERLİN',
      updatedAt: 'Durum: Güncelleme & Düzenleme Aşamasında',
      closeLabel: 'Kapat',
      sections: [
        {
          heading: 'Hizmet Sağlayıcı & Platform Durumu',
          paragraphs: [
            'DCC Döner Catering Club · Berlin',
            'Bu web sitesi ve dijital etkinlik hesaplama altyapısı şu anda aktif hazırlık ve kurulum aşamasındadır (Ön İzleme Modu).',
            'Şirket tüzel kişilik detayları, açık adres ve ticaret sicil kayıtları resmi lansman öncesi hukuki incelemede olup en kısa sürede güncellenecektir.',
          ],
        },
        {
          heading: 'Ön Talepler & İletişim',
          paragraphs: [
            'Etkinlik ön rezervasyonları, tarih uygunluğu ve özel menü kalkülasyonları için bize doğrudan interaktif hesaplayıcı, WhatsApp ve e-posta üzerinden ulaşabilirsiniz:',
            'E-posta: concierge@dcc-catering.berlin',
          ],
        },
        {
          heading: 'Ön Hesaplama Bilgilendirmesi',
          paragraphs: [
            'Hesaplayıcıdaki tüm tutarlar organizasyon planlayıcıları için bağlayıcı olmayan şeffaf kılavuz değerlerdir (yasal KDV hariç). Bağlayıcı rezervasyonlar yalnızca yazılı onay ile kesinleşir.',
          ],
        },
      ],
    },
    datenschutz: {
      id: 'datenschutz',
      title: 'Gizlilik Politikası (GDPR / KVKK)',
      badge: 'HAZIRLIK AŞAMASINDA · GDPR',
      updatedAt: 'Durum: Hukuki İnceleme Aşamasında',
      closeLabel: 'Kapat',
      sections: [
        {
          heading: '1. Gizlilik Metni Hazırlık Aşamasında',
          paragraphs: [
            'GDPR Madde 13 ve KVKK uyarınca hazırlanan resmi aydınlatma metnimiz operasyonel süreçler doğrultusunda güncellenmektedir.',
            'Web sitemizde hiçbir üçüncü taraf reklam veya izleme çerezi kullanılmamaktadır. Tüm font ve medya dosyaları yerel olarak sunulur; dil tercihiniz yalnızca tarayıcınızda (localStorage) tutulur.',
          ],
        },
        {
          heading: '2. Ön Talep ve WhatsApp Aktarımı',
          paragraphs: [
            'Hesaplayıcı ve teklif formuna girdiğiniz bilgiler yalnızca siz "WhatsApp ile Gönder" veya kopyala butonuna tıkladığınızda talebinizin incelenmesi amacıyla aktarılır. WhatsApp kullanımında WhatsApp Ireland Limited gizlilik kuralları geçerlidir.',
          ],
        },
        {
          heading: '3. GDPR & KVKK Kapsamındaki Haklarınız',
          paragraphs: [
            'Verilerinize erişim, düzeltme, silme veya işlemeyi kısıtlama haklarınızı dilediğiniz zaman concierge@dcc-catering.berlin adresi üzerinden talep edebilirsiniz.',
          ],
        },
      ],
    },
    ifs: {
      id: 'ifs',
      title: 'IFS Hijyen, Soğuk Zincir & Helal Standartları',
      badge: 'HACCP · IFS · HALAL',
      updatedAt: 'Güncelleme: 2026',
      closeLabel: 'Kapat',
      sections: [
        {
          heading: '1. Kesintisiz Soğuk Zincir & HACCP',
          paragraphs: [
            'Berlin’deki AB onaylı üretim tesisimizden etkinlik alanına kadar tüm dönerler 2 °C – 4 °C aralığında aktif soğutmalı araçlarla ve dijital HACCP kayıtlarıyla taşınır.',
          ],
        },
        {
          heading: '2. IFS Uyumlu Parti İzlenebilirliği',
          paragraphs: [
            'Her döner üretimi parti numarasıyla etiketlenir ve canlı kesim sırasında 70 °C üzeri iç sıcaklık kontrolünden geçirilir.',
          ],
        },
        {
          heading: '3. %100 Helal (Halal) & Ayrı Vegan Hattı',
          paragraphs: [
            'Dana, süt dana ve tavuk dönerlerimizin tamamı Helal sertifikalıdır. Vegan Seitan dönerimiz ise tamamen ayrı ocak ve kesim ekipmanlarıyla hazırlanır.',
          ],
        },
      ],
    },
  },
  footer: {
    tagline:
      'Kurumsal zirveler, düğünler ve özel davetler için Berlin canlı döner cateringi.',
    citiesLabel: 'Hizmet Alanı (Berlin Çevresi · Maks. 300 km)',
    cities: [
      'Berlin & Çevresi',
      'Potsdam & Brandenburg',
      'Leipzig & Dresden',
      'Hamburg & Hannover (maks. 300 km)',
    ],
    navigationHeading: 'Gezinme',
    legalHeading: 'Yasal & Standartlar',
    brandKitLink: 'Marka Kiti & Kurallar',
    impressumLink: 'Künye (Impressum)',
    datenschutzLink: 'Gizlilik (GDPR / KVKK)',
    ifsLink: 'IFS Hijyen & Helal',
    copyright: '© 2026 DCC Döner Catering Club · Berlin. Tüm hakları saklıdır.',
  },
  quoteTemplates: {
    header: 'DCC Döner Catering Club — Etkinlik Talebi',
    refLine: 'Referans',
    dateLine: 'Hazırlanma Tarihi',
    eventTypeLine: 'Etkinlik Türü',
    guestsLine: 'Misafir Sayısı',
    enterpriseNoteLine: 'Not: 800+ Kurumsal / Büyük Etkinlik Talebi',
    spitLine: 'Döner Seçimi',
    discountLine: 'Hacim İndirimi',
    setupLine: 'Kurulum Türü',
    extrasLine: 'Ekstralar',
    noExtras: 'Ekstra seçilmedi',
    subtotalNetLine: 'Ara Toplam (Net)',
    vatLine: 'KDV (%19)',
    totalGrossLine: 'Genel Toplam (Brüt)',
    perGuestNetLine: 'Kişi Başı (Net)',
    contactHeader: 'İletişim Bilgileri',
    nameLine: 'Yetkili Adı',
    companyLine: 'Şirket',
    emailLine: 'E-posta',
    phoneLine: 'Telefon',
    eventDateLine: 'Etkinlik Tarihi',
    ustIdLine: 'KDV / Vergi No',
    notesLine: 'Notlar',
    closingLine:
      'DCC Catering Hesaplayıcı (Berlin) üzerinden oluşturuldu — bağlayıcı olmayan ön teklif.',
  },
};

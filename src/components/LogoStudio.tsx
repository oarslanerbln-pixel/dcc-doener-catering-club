import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Maximize2,
  MessageCircle,
  Play,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { LOGO_CANDIDATES } from '../data/catalog';
import { buildWhatsAppUrl } from '../domain/calculator';
import { useLocale } from '../i18n';
import type { LogoCandidateFamily, LogoCandidateItem } from '../types/brand';

export interface LogoStudioProps {
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: LogoCandidateItem | null) => void;
  onLaunchAnimation: () => void;
}

type FilterMode = 'all' | LogoCandidateFamily | 'favorites';
type MockupTab = 'plate' | 'header' | 'packaging';

const FAVS_STORAGE_KEY = 'dcc-partner-logo-favs';

const STUDIO_COPY = {
  de: {
    eyebrow: 'PARTNER LOGO STUDIO · 11 KONZEPTE',
    title: 'Logo-Auswahl für Partner & Führungsteam',
    subtitle:
      'Vergleichen Sie alle 11 hochgeladenen Logo-Entwürfe im Detail, testen Sie Header- & Packaging-Mockups, markieren Sie Ihre Favoriten und teilen Sie Ihre Shortlist direkt per WhatsApp.',
    filters: {
      all: 'Alle (11)',
      metallic: 'Titan & Glut 3D (6)',
      editorial: 'Minimal Gold (5)',
      favorites: 'Favoriten',
    },
    actions: {
      playAnim: 'Döner-Spieß Animation ansehen',
      copyFavs: 'Favoriten kopieren',
      copied: 'Shortlist kopiert!',
      shareWa: 'Per WhatsApp teilen',
      zoomMockup: 'Mockup & Vollbild',
      previewLive: 'Auf Website testen',
      previewActive: 'Aktiv im Test',
      clearPreview: 'Test-Logo zurücksetzen',
      favoriteAria: 'Als Favorit markieren',
    },
    emptyFavs:
      'Noch keine Favoriten markiert — klicken Sie bei Ihren Lieblingsentwürfen auf den Stern.',
    modal: {
      tabs: {
        plate: '2K Original-Entwurf',
        header: 'Website-Header Simulation',
        packaging: 'Catering-Box & Menü-Mockup',
      },
      prev: 'Vorheriges Logo',
      next: 'Nächstes Logo',
      close: 'Schließen',
      activeOnSite: 'Dieses Logo im Website-Header testen',
    },
    shareHeader: 'DCC Partner Logo-Shortlist:',
    shareEmpty: 'Alle 11 DCC Logo-Konzepte ansehen:',
  },
  en: {
    eyebrow: 'PARTNER LOGO STUDIO · 11 CONCEPTS',
    title: 'Partner Logo Showcase & Shortlist Studio',
    subtitle:
      'Review all 11 uploaded logo concepts side by side, inspect live header & packaging mockups, star your favorites, and share your shortlist directly with partners via WhatsApp.',
    filters: {
      all: 'All (11)',
      metallic: 'Titanium & Ember 3D (6)',
      editorial: 'Minimalist Gold (5)',
      favorites: 'Favorites',
    },
    actions: {
      playAnim: 'Watch Rotating Spit Sequence',
      copyFavs: 'Copy Shortlist',
      copied: 'Shortlist copied!',
      shareWa: 'Share via WhatsApp',
      zoomMockup: 'Mockups & Zoom',
      previewLive: 'Test on Site',
      previewActive: 'Active Preview',
      clearPreview: 'Reset Logo Preview',
      favoriteAria: 'Toggle favorite logo',
    },
    emptyFavs:
      'No favorites starred yet — click the star icon on any concept to build your partner shortlist.',
    modal: {
      tabs: {
        plate: '2K Studio Plate',
        header: 'Live Header Simulation',
        packaging: 'Catering Box & Menu Mockup',
      },
      prev: 'Previous logo',
      next: 'Next logo',
      close: 'Close',
      activeOnSite: 'Preview this logo in the live website',
    },
    shareHeader: 'DCC Partner Logo Shortlist:',
    shareEmpty: 'Reviewing all 11 DCC Logo Concepts:',
  },
  tr: {
    eyebrow: 'ORTAK LOGO STÜDYOSU · 11 KONSEPT',
    title: 'Ortaklar İçin Logo Seçim & Önizleme Stüdyosu',
    subtitle:
      'Yüklediğiniz 11 logo tasarımını yan yana karşılaştırın, web sitesi header ve catering kutusu maketlerini inceleyin, favorilerinizi yıldızlayın ve seçiminizi tek tıkla WhatsApp’tan ortaklarınıza gönderin.',
    filters: {
      all: 'Tümü (11)',
      metallic: '3D Titanyum & Kor (6)',
      editorial: 'Minimal Altın (5)',
      favorites: 'Favoriler',
    },
    actions: {
      playAnim: 'Döner Şiş Animasyonunu İzle',
      copyFavs: 'Favorileri Kopyala',
      copied: 'Liste Kopyalandı!',
      shareWa: 'WhatsApp’ta Paylaş',
      zoomMockup: 'Mockup & Tam Ekran',
      previewLive: 'Sitede Dene',
      previewActive: 'Sitede Aktif',
      clearPreview: 'Varsayılan Logoya Dön',
      favoriteAria: 'Favorilere ekle/çıkar',
    },
    emptyFavs:
      'Henüz favori logo seçilmedi — beğendiğiniz logoların sağ üstündeki yıldız ikonuna tıklayın.',
    modal: {
      tabs: {
        plate: '2K Orijinal Tasarım',
        header: 'Site Header & Kart Önizlemesi',
        packaging: 'Catering Kutusu & Menü Mockup',
      },
      prev: 'Önceki Logo',
      next: 'Sonraki Logo',
      close: 'Kapat',
      activeOnSite: 'Bu logoyu canlı sitede önizle',
    },
    shareHeader: 'DCC Ortaklar Logo Seçkisi:',
    shareEmpty: 'DCC 11 Logo Konsepti Değerlendirmesi:',
  },
} as const;

export function LogoStudio({
  selectedCandidateId,
  onSelectCandidate,
  onLaunchAnimation,
}: LogoStudioProps): React.ReactElement {
  const { locale } = useLocale();
  const copy = STUDIO_COPY[locale];

  const [filter, setFilter] = useState<FilterMode>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['dcc-01', 'dcc-05', 'dcc-07'];
    try {
      const raw = window.localStorage.getItem(FAVS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter((v): v is string => typeof v === 'string');
        }
      }
    } catch {
      // ignore storage errors
    }
    return ['dcc-01', 'dcc-05', 'dcc-07'];
  });
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [mockupTab, setMockupTab] = useState<MockupTab>('plate');
  const [copiedShortlist, setCopiedShortlist] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVS_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  const filteredCandidates = useMemo(() => {
    if (filter === 'all') return LOGO_CANDIDATES;
    if (filter === 'favorites') {
      return LOGO_CANDIDATES.filter((c) => favorites.includes(c.id));
    }
    return LOGO_CANDIDATES.filter((c) => c.family === filter);
  }, [filter, favorites]);

  const lightboxIndex = useMemo(
    () => LOGO_CANDIDATES.findIndex((c) => c.id === lightboxId),
    [lightboxId]
  );
  const lightboxItem =
    lightboxIndex >= 0 ? LOGO_CANDIDATES[lightboxIndex] : null;

  useEffect(() => {
    if (!lightboxItem) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxId(null);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = (lightboxIndex + 1) % LOGO_CANDIDATES.length;
        setLightboxId(LOGO_CANDIDATES[nextIdx].id);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIdx =
          (lightboxIndex - 1 + LOGO_CANDIDATES.length) % LOGO_CANDIDATES.length;
        setLightboxId(LOGO_CANDIDATES[prevIdx].id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow || '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxItem, lightboxIndex]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const buildShortlistMessage = () => {
    const picked = LOGO_CANDIDATES.filter((c) => favorites.includes(c.id));
    const header = picked.length > 0 ? copy.shareHeader : copy.shareEmpty;
    const lines = (picked.length > 0 ? picked : LOGO_CANDIDATES.slice(0, 5)).map(
      (c) => `• #${c.number} — ${c.titles[locale]} (${c.tags[locale]})`
    );
    const liveUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/#logo-studio`
        : 'https://dcc-catering.vercel.app/#logo-studio';
    return `${header}\n${lines.join('\n')}\n\n${liveUrl}`;
  };

  const handleCopyShortlist = async () => {
    const text = buildShortlistMessage();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedShortlist(true);
      window.setTimeout(() => setCopiedShortlist(false), 2400);
    } catch {
      setCopiedShortlist(true);
    }
  };

  const handleShareWhatsApp = () => {
    const url = buildWhatsAppUrl(buildShortlistMessage());
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="logo-studio"
      className="relative border-b border-[var(--border-main)] py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Header Row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-3.5 py-1">
              <Sparkles
                className="h-3.5 w-3.5"
                style={{ color: 'var(--brand-primary)' }}
              />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                {copy.eyebrow}
              </span>
            </div>
            <h2 className="font-monument text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              {copy.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {copy.subtitle}
            </p>
          </div>

          {/* Partner Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="logo-studio-animate-btn"
              onClick={onLaunchAnimation}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)] bg-[var(--badge-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--badge-text)] transition hover:bg-[var(--brand-primary)] hover:text-[var(--btn-text)] cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{copy.actions.playAnim}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShortlist}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
            >
              {copiedShortlist ? (
                <Check className="h-3.5 w-3.5 text-[#34D399]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              )}
              <span>
                {copiedShortlist
                  ? copy.actions.copied
                  : `${copy.actions.copyFavs} (${favorites.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-semibold text-[var(--btn-text)] shadow-md transition hover:bg-[var(--brand-hover)] cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{copy.actions.shareWa}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills + Active Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label={copy.title}
            className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-1.5"
          >
            {(
              [
                { id: 'all', label: copy.filters.all },
                { id: 'metallic', label: copy.filters.metallic },
                { id: 'editorial', label: copy.filters.editorial },
                {
                  id: 'favorites',
                  label: `${copy.filters.favorites} (${favorites.length})`,
                },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {selectedCandidateId && (
            <button
              type="button"
              onClick={() => onSelectCandidate(null)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-accent)] bg-[var(--bg-card)] px-3.5 py-1.5 font-mono text-xs font-semibold text-[var(--brand-accent)] transition hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>{copy.actions.clearPreview}</span>
            </button>
          )}
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="apple-card rounded-3xl p-10 text-center text-sm text-[var(--text-secondary)]">
            {copy.emptyFavs}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map((item) => {
              const isFav = favorites.includes(item.id);
              const isLiveSelected = selectedCandidateId === item.id;
              const isEditorial = item.family === 'editorial';

              return (
                <article
                  key={item.id}
                  data-testid={`logo-candidate-${item.number}`}
                  className={`apple-card group flex flex-col overflow-hidden rounded-3xl transition ${
                    isLiveSelected
                      ? 'ring-2 ring-[var(--brand-primary)] border-[var(--brand-primary)]'
                      : ''
                  }`}
                >
                  {/* 16:9 Studio Canvas */}
                  <div
                    onClick={() => {
                      setMockupTab('plate');
                      setLightboxId(item.id);
                    }}
                    className={`relative aspect-[16/9] w-full overflow-hidden cursor-pointer ${
                      isEditorial ? 'bg-[#FAF9F6] p-3 pt-6' : 'bg-[#0C0E12]'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.titles[locale]}
                      width={1280}
                      height={714}
                      className={`h-full w-full transition duration-500 group-hover:scale-[1.03] ${
                        isEditorial ? 'object-contain' : 'object-cover'
                      }`}
                    />

                    {/* Top Floating Number + Star */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-white/15 bg-black/75 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F2BC6E] backdrop-blur-md">
                        #{item.number} · {item.tags[locale]}
                      </span>

                      <button
                        type="button"
                        aria-label={`${copy.actions.favoriteAria} #${item.number}`}
                        aria-pressed={isFav}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition cursor-pointer ${
                          isFav
                            ? 'border-[#E5A952] bg-[#E5A952] text-[#090A0F]'
                            : 'border-white/20 bg-black/65 text-white hover:border-[#E5A952]'
                        }`}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={isFav ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Details & Actions */}
                  <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-monument text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {item.titles[locale]}
                      </h3>
                      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                        {item.notes[locale]}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-main)]">
                      <button
                        type="button"
                        onClick={() => {
                          setMockupTab('plate');
                          setLightboxId(item.id);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
                      >
                        <Maximize2 className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                        <span className="truncate">{copy.actions.zoomMockup}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectCandidate(isLiveSelected ? null : item)
                        }
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                          isLiveSelected
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)]'
                            : 'border-[var(--border-main)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {isLiveSelected
                            ? copy.actions.previewActive
                            : copy.actions.previewLive}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox & Real Mockup Inspection Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
          onClick={() => setLightboxId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={lightboxItem.titles[locale]}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
            className="relative my-auto w-full max-w-4xl rounded-3xl border border-[var(--border-main)] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-main)] pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="rounded-full bg-[var(--badge-bg)] px-3 py-1 font-mono text-xs font-bold text-[var(--badge-text)] shrink-0">
                  #{lightboxItem.number} / 11
                </span>
                <div className="min-w-0">
                  <h3 className="font-monument text-base sm:text-xl font-bold truncate">
                    {lightboxItem.titles[locale]}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {lightboxItem.tags[locale]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={copy.modal.prev}
                  onClick={() => {
                    const prevIdx =
                      (lightboxIndex - 1 + LOGO_CANDIDATES.length) %
                      LOGO_CANDIDATES.length;
                    setLightboxId(LOGO_CANDIDATES[prevIdx].id);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={copy.modal.next}
                  onClick={() => {
                    const nextIdx =
                      (lightboxIndex + 1) % LOGO_CANDIDATES.length;
                    setLightboxId(LOGO_CANDIDATES[nextIdx].id);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={copy.modal.close}
                  onClick={() => setLightboxId(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mockup Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'plate', label: copy.modal.tabs.plate },
                  { id: 'header', label: copy.modal.tabs.header },
                  { id: 'packaging', label: copy.modal.tabs.packaging },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMockupTab(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold transition cursor-pointer ${
                    mockupTab === tab.id
                      ? 'bg-[var(--brand-primary)] text-[var(--btn-text)]'
                      : 'border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Viewport */}
            {mockupTab === 'plate' && (
              <div className="overflow-hidden rounded-2xl border border-[var(--border-main)] bg-black">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.titles[locale]}
                  className="w-full max-h-[58vh] object-contain mx-auto"
                />
              </div>
            )}

            {mockupTab === 'header' && (
              <div className="overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[#090A0F] p-5 space-y-5 text-[#F5F5F7]">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#12141C] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={lightboxItem.image}
                      alt={lightboxItem.titles[locale]}
                      className="h-11 w-20 rounded-lg object-cover border border-white/15"
                    />
                    <span className="font-mono text-xs tracking-wider text-[#E5A952]">
                      DCC · CATERING BERLIN
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-white/75">
                    <span>Kalkulator</span>
                    <span>Galerie</span>
                    <span className="rounded-full bg-[#E5A952] px-3 py-1 font-semibold text-[#090A0F]">
                      Angebot
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161922] to-[#0B0D12] p-6 flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={lightboxItem.image}
                    alt={lightboxItem.titles[locale]}
                    className="w-48 rounded-xl object-cover shadow-lg border border-white/10"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="font-mono text-xs uppercase tracking-widest text-[#34D399]">
                      LIVE ROTISSERIE · 30–800+ GUESTS
                    </div>
                    <div className="font-monument text-xl font-bold">
                      {lightboxItem.titles[locale]}
                    </div>
                    <p className="text-xs text-white/70">
                      {lightboxItem.notes[locale]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mockupTab === 'packaging' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--border-main)] bg-[#0B0A09] p-6 text-center space-y-3 text-[#F3ECE0]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#D49B54]">
                    EXECUTIVE CATERING BOX
                  </div>
                  <div className="mx-auto max-w-[230px] overflow-hidden rounded-xl border border-[#D49B54]/40 p-2 bg-[#121110]">
                    <img
                      src={lightboxItem.image}
                      alt={lightboxItem.titles[locale]}
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="font-mono text-[11px] text-white/60">
                    100% HALAL · BERLIN MANUFAKTUR
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-main)] bg-[#FAF6EF] p-6 text-center space-y-3 text-[#0B0A09]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7A4710]">
                    VIP EVENT MENU CARD
                  </div>
                  <div className="mx-auto max-w-[230px] overflow-hidden rounded-xl border border-[#0B0A09]/15 p-2 bg-white shadow-sm">
                    <img
                      src={lightboxItem.image}
                      alt={lightboxItem.titles[locale]}
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="font-serif italic text-sm text-[#2D2823]">
                    Yaprak Döner · Antep Baklava · Mint Ayran
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-main)] pt-3">
              <p className="text-xs text-[var(--text-secondary)]">
                {lightboxItem.notes[locale]}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(lightboxItem.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  <Star
                    className="h-3.5 w-3.5 text-[#E5A952]"
                    fill={favorites.includes(lightboxItem.id) ? '#E5A952' : 'none'}
                  />
                  <span>
                    {favorites.includes(lightboxItem.id) ? 'Favori' : 'Favori Ekle'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCandidate(lightboxItem);
                    setLightboxId(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-[var(--btn-text)] cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{copy.modal.activeOnSite}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

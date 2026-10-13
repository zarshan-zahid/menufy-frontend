import React, { useState, useEffect } from 'react';
import {
  Palette,
  Eye,
  Save,
  Globe,
  Sparkles,
  Check,
  LayoutGrid,
  List,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Upload,
  Star,
  Flame,
  Award,
} from 'lucide-react';
import { api } from '../../utils/api';

const FIVE_THEMES = [
  {
    id: 'premium-dark',
    name: 'Theme 1: Premium Dark',
    subtitle: 'Steakhouse & Luxury Fine Dining',
    description:
      'Elegant dark obsidian background, gold metallic accents, refined typography, and large cinematic hero section.',
    primaryColor: '#f59e0b',
    secondaryColor: '#0b0f17',
    accentColor: '#d97706',
    fontFamily: 'Outfit',
    layout: 'grid',
    previewGradient: 'from-amber-600 via-slate-900 to-black',
    badge: 'LUXURY GASTRONOMY',
  },
  {
    id: 'modern-minimal',
    name: 'Theme 2: Modern Minimal',
    subtitle: 'Clean & Contemporary Eatery',
    description:
      'Clean white background, generous whitespace, pill navigation, and accessible high-contrast buttons.',
    primaryColor: '#0f172a',
    secondaryColor: '#ffffff',
    accentColor: '#38bdf8',
    fontFamily: 'Plus Jakarta Sans',
    layout: 'grid',
    previewGradient: 'from-slate-200 via-white to-slate-300',
    badge: 'CLEAN & MINIMAL',
  },
  {
    id: 'pakistani-traditional',
    name: 'Theme 3: Pakistani Traditional',
    subtitle: 'BBQ, Karahi, Biryani & Handi',
    description:
      'Warm terracotta, saffron & emerald tones, authentic culinary badges, and practical mobile ordering.',
    primaryColor: '#c2410c',
    secondaryColor: '#fffdfa',
    accentColor: '#064e3b',
    fontFamily: 'Outfit',
    layout: 'grid',
    previewGradient: 'from-red-800 via-amber-700 to-orange-800',
    badge: 'AUTHENTIC DESI TASTE',
  },
  {
    id: 'italian-cafe',
    name: 'Theme 4: Italian Cafe',
    subtitle: 'Trattoria, Pizzeria & Espresso Bar',
    description:
      'Bistro-inspired serif typography, rustic warm cream tones, wood-fired highlights, and readable product cards.',
    primaryColor: '#292524',
    secondaryColor: '#faf7f2',
    accentColor: '#b45309',
    fontFamily: 'Playfair Display',
    layout: 'grid',
    previewGradient: 'from-stone-800 via-stone-700 to-amber-900',
    badge: 'ITALIAN TRATTORIA',
  },
  {
    id: 'modern-fast-food',
    name: 'Theme 5: Modern Fast Food',
    subtitle: 'Smash Burgers, Combos & Street Food',
    description:
      'High-energy bold typography, electric flame colors, prominent combo badges, and fast ordering controls.',
    primaryColor: '#ea580c',
    secondaryColor: '#09090b',
    accentColor: '#ef4444',
    fontFamily: 'Oswald',
    layout: 'grid',
    previewGradient: 'from-orange-600 via-red-600 to-amber-500',
    badge: 'HIGH-ENERGY FAST FOOD',
  },
];

const BANNER_PRESETS = [
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&q=80',
];

export default function WebsiteCustomizer({ restaurant, onRefresh }) {
  // Normalize existing theme ID to one of 5 presets
  const initialThemeId = () => {
    const raw = restaurant.theme?.themeId || 'modern-fast-food';
    if (raw === 'midnight' || raw === 'dark' || raw === 'premium-dark') return 'premium-dark';
    if (raw === 'minimal' || raw === 'sapphire' || raw === 'modern-minimal') return 'modern-minimal';
    if (raw === 'traditional' || raw === 'sunset' || raw === 'pakistani-traditional')
      return 'pakistani-traditional';
    if (raw === 'cafe' || raw === 'emerald' || raw === 'bistro' || raw === 'italian-cafe')
      return 'italian-cafe';
    return 'modern-fast-food';
  };

  const [themeId, setThemeId] = useState(initialThemeId());
  const [primaryColor, setPrimaryColor] = useState(
    restaurant.theme?.primaryColor || '#ea580c'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    restaurant.theme?.secondaryColor || '#0f172a'
  );
  const [accentColor, setAccentColor] = useState(
    restaurant.theme?.accentColor || '#f59e0b'
  );
  const [fontFamily, setFontFamily] = useState(
    restaurant.theme?.fontFamily || 'Inter'
  );
  const [layout, setLayout] = useState(restaurant.theme?.layout || 'grid');

  // Branding & Sections
  const [name, setName] = useState(restaurant.name || '');
  const [tagline, setTagline] = useState(restaurant.tagline || '');
  const [cuisine, setCuisine] = useState(restaurant.cuisine || 'General');
  const [logo, setLogo] = useState(restaurant.logo || '');
  const [banner, setBanner] = useState(restaurant.banner || '');

  const [showHero, setShowHero] = useState(restaurant.sections?.showHero ?? true);
  const [showFeatured, setShowFeatured] = useState(restaurant.sections?.showFeatured ?? true);
  const [showCategories, setShowCategories] = useState(restaurant.sections?.showCategories ?? true);
  const [showAbout, setShowAbout] = useState(restaurant.sections?.showAbout ?? true);
  const [heroHeadline, setHeroHeadline] = useState(
    restaurant.sections?.heroHeadline || 'Handcrafted Flavors Delivered Fresh'
  );
  const [heroSubheadline, setHeroSubheadline] = useState(
    restaurant.sections?.heroSubheadline || 'Browse our menu of chef-inspired specials.'
  );
  const [announcementText, setAnnouncementText] = useState(
    restaurant.sections?.announcementText || 'Fresh meals delivered fast!'
  );

  // Dishes for featured item selection
  const [restaurantDishes, setRestaurantDishes] = useState([]);
  const [featuredItemIds, setFeaturedItemIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Fetch actual dishes to allow selecting featured menu items
  useEffect(() => {
    if (restaurant?._id) {
      api.get(`/menu-items?restaurantId=${restaurant._id}`).then((res) => {
        if (res.items) {
          setRestaurantDishes(res.items);
          const initialFeatured = res.items
            .filter((it) => it.isFeatured)
            .map((it) => it._id);
          setFeaturedItemIds(initialFeatured);
        }
      }).catch((e) => console.warn('Could not fetch items for customizer:', e));
    }
  }, [restaurant]);

  // Handle Logo Upload via FileReader
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Logo image size must be under 2.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Banner Upload via FileReader
  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Banner image size must be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBanner(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Apply a Theme Preset
  const handleSelectTheme = (t) => {
    setThemeId(t.id);
    setPrimaryColor(t.primaryColor);
    setSecondaryColor(t.secondaryColor);
    setAccentColor(t.accentColor);
    setFontFamily(t.fontFamily);
    setLayout(t.layout || 'grid');
  };

  // Restore Theme Default Settings
  const handleRestoreDefaults = () => {
    const currentTheme = FIVE_THEMES.find((t) => t.id === themeId) || FIVE_THEMES[0];
    setPrimaryColor(currentTheme.primaryColor);
    setSecondaryColor(currentTheme.secondaryColor);
    setAccentColor(currentTheme.accentColor);
    setFontFamily(currentTheme.fontFamily);
    setLayout(currentTheme.layout || 'grid');
    setFeedbackMsg(`Restored default colors and typography for ${currentTheme.name}.`);
  };

  // Toggle Featured Item
  const handleToggleFeaturedDish = (itemId) => {
    setFeaturedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Save Customizer Settings to Database
  const handleSave = async () => {
    setSaving(true);
    setFeedbackMsg('');
    try {
      // 1. Update Profile (name, tagline, cuisine, logo, banner)
      await api.put(`/restaurants/${restaurant._id}/profile`, {
        name: name.trim(),
        tagline: tagline.trim(),
        cuisine: cuisine.trim(),
        logo: logo.trim(),
        banner: banner.trim(),
      });

      // 2. Update Customizer Settings
      await api.put(`/restaurants/${restaurant._id}/customizer`, {
        theme: {
          themeId,
          primaryColor,
          secondaryColor,
          accentColor,
          fontFamily,
          layout,
          bannerOverlay: true,
        },
        sections: {
          showHero,
          showFeatured,
          showCategories,
          showAbout,
          heroHeadline,
          heroSubheadline,
          announcementText,
        },
      });

      // 3. Update Featured Items in Database
      if (restaurantDishes.length > 0) {
        await Promise.all(
          restaurantDishes.map((dish) => {
            const shouldBeFeatured = featuredItemIds.includes(dish._id);
            if (dish.isFeatured !== shouldBeFeatured) {
              return api.put(`/menu-items/${dish._id}`, {
                isFeatured: shouldBeFeatured,
                restaurantId: restaurant._id,
              }).catch(() => null);
            }
            return null;
          })
        );
      }

      setFeedbackMsg('Theme and customization settings saved successfully to database!');
      onRefresh();
    } catch (err) {
      alert('Failed to save customizer settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const nextState = !restaurant.isPublished;
      await handleSave();
      await api.patch(`/restaurants/${restaurant._id}/publish`, {
        isPublished: nextState,
      });
      onRefresh();
    } catch (err) {
      alert('Failed to toggle publish state: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const getInitials = (val) => {
    if (!val) return 'FF';
    return val
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-orange-600" />
            <span>Restaurant Storefront Builder & Theme Customizer</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Choose from five distinct storefront themes, customize brand colors, upload logos, and preview in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {restaurant.isPublished && (
            <a
              href={`/restaurant/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Live Site
            </a>
          )}

          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
            title="Restore default colors and typography for selected theme"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
              restaurant.isPublished
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{restaurant.isPublished ? 'Unpublish' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Split Layout: Customizer Controls (Left) & Real-Time Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: THE FIVE DISTINCT THEMES SELECTOR */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>1. Select Storefront Theme (5 Distinct Designs)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click any theme to preview its dedicated layout and typography immediately.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {FIVE_THEMES.map((t) => {
                const isSelected = themeId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/20 shadow-md ring-2 ring-orange-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.previewGradient} flex items-center justify-center text-white shrink-0 shadow-sm font-black text-sm`}
                      >
                        {isSelected ? <Check className="w-6 h-6" /> : t.id[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-gray-900">{t.name}</h4>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {t.badge}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-gray-600 mt-0.5">
                          {t.subtitle}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                          isSelected
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? 'Active Theme' : 'Apply Theme'}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: t.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: t.accentColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: BRAND COLORS & TYPOGRAPHY */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-600" />
              <span>2. Theme Palette & Typography</span>
            </h3>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-gray-600 text-xs">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Secondary / Dark</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-gray-600 text-xs">{secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Accent Glow</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-gray-600 text-xs">{accentColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-100">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs"
                >
                  <option value="Inter">Inter (Clean Modern Sans)</option>
                  <option value="Outfit">Outfit (Geometric Modern)</option>
                  <option value="Playfair Display">Playfair Display (Italian Editorial Serif)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Minimal Contemporary)</option>
                  <option value="Oswald">Oswald (Bold Fast Food Grotesque)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Menu Card Layout</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLayout('grid')}
                    className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold ${
                      layout === 'grid'
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout('list')}
                    className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold ${
                      layout === 'list'
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" /> List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: LOGO & COVER BANNER MANAGEMENT */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-600" />
              <span>3. Logo & Storefront Banner</span>
            </h3>

            {/* Logo Upload & Initials Preview */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
              <label className="block font-semibold text-gray-800 text-xs">
                Restaurant Logo (PNG / JPG / WebP)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white font-black text-lg">
                      {getInitials(name)}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logo && (
                      <button
                        type="button"
                        onClick={() => setLogo('')}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    If no logo is uploaded, MenuFy displays a neutral monogram with your restaurant initials.
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Banner */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-gray-700">Cover Banner Image</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Banner image URL..."
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
                <label className="cursor-pointer shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700">
                  <Upload className="w-3.5 h-3.5" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                {BANNER_PRESETS.map((bp, i) => (
                  <img
                    key={i}
                    src={bp}
                    alt="Preset"
                    onClick={() => setBanner(bp)}
                    className={`h-10 w-20 rounded-lg object-cover cursor-pointer border-2 transition ${
                      banner === bp ? 'border-orange-600' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: SELECT FEATURED MENU ITEMS */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span>4. Select Featured Menu Items ({featuredItemIds.length})</span>
              </h3>
              <span className="text-xs text-gray-400">
                Highlighted in the Chef's Specials section
              </span>
            </div>

            {restaurantDishes.length === 0 ? (
              <p className="text-xs text-gray-400 p-4 text-center bg-gray-50 rounded-xl">
                No menu items found. Add food items in the Menu Management tab first.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 space-y-1 pr-1">
                {restaurantDishes.map((dish) => {
                  const isChecked = featuredItemIds.includes(dish._id);
                  return (
                    <label
                      key={dish._id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFeaturedDish(dish._id)}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span className="font-bold text-gray-800">{dish.name}</span>
                        <span className="text-gray-400 font-mono">${dish.price?.toFixed(2)}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {dish.isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 5: HOMEPAGE SECTIONS CONFIG */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              5. Storefront Sections & Text
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hero Subheadline</label>
                <input
                  type="text"
                  value={heroSubheadline}
                  onChange={(e) => setHeroSubheadline(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Top Announcement Ribbon</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl cursor-pointer">
                  <span className="font-bold text-gray-800">Show Hero Banner</span>
                  <input
                    type="checkbox"
                    checked={showHero}
                    onChange={(e) => setShowHero(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl cursor-pointer">
                  <span className="font-bold text-gray-800">Show Chef Specials</span>
                  <input
                    type="checkbox"
                    checked={showFeatured}
                    onChange={(e) => setShowFeatured(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Live Real-Time Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-orange-600" />
                <span>Theme Live Preview</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {themeId}
              </span>
            </div>

            {/* Interactive Simulated Storefront Card Rendering Current Theme */}
            <div
              className={`rounded-3xl border-4 overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto transition-all ${
                themeId === 'premium-dark'
                  ? 'border-slate-800 bg-slate-950 text-white'
                  : themeId === 'modern-minimal'
                  ? 'border-gray-200 bg-white text-slate-900'
                  : themeId === 'pakistani-traditional'
                  ? 'border-amber-300 bg-[#fffdf9] text-stone-900'
                  : themeId === 'italian-cafe'
                  ? 'border-stone-300 bg-[#faf7f2] text-stone-900'
                  : 'border-neutral-800 bg-neutral-950 text-white'
              }`}
            >
              {/* Header Preview */}
              <div
                className={`p-3.5 border-b flex items-center justify-between ${
                  themeId === 'premium-dark'
                    ? 'border-slate-800 bg-slate-900/80'
                    : themeId === 'modern-minimal'
                    ? 'border-slate-100 bg-white'
                    : themeId === 'pakistani-traditional'
                    ? 'border-amber-200 bg-[#fffdf9]'
                    : themeId === 'italian-cafe'
                    ? 'border-stone-200 bg-[#faf7f2]'
                    : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs"
                    style={{ backgroundColor: primaryColor, color: themeId === 'modern-minimal' ? '#fff' : '#000' }}
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      getInitials(name)
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black truncate max-w-[130px]">{name}</div>
                    <div className="text-[9px] opacity-70 truncate max-w-[120px]">{cuisine}</div>
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-xl text-[10px] font-black"
                  style={{ backgroundColor: primaryColor, color: themeId === 'modern-minimal' ? '#fff' : '#000' }}
                >
                  Cart (0)
                </div>
              </div>

              {/* Hero Banner Preview */}
              {showHero && (
                <div className="relative p-6 overflow-hidden">
                  {banner && (
                    <img
                      src={banner}
                      alt="Banner"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  )}
                  <div className="relative z-10 space-y-1.5">
                    {announcementText && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20">
                        ✨ {announcementText}
                      </span>
                    )}
                    <h4 className="text-base font-black leading-tight">{heroHeadline}</h4>
                    <p className="text-[10px] opacity-75 line-clamp-2">{heroSubheadline}</p>
                  </div>
                </div>
              )}

              {/* Sample Dishes Preview */}
              <div className="p-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider opacity-80">
                  {themeId === 'pakistani-traditional'
                    ? 'Dawat Specials'
                    : themeId === 'italian-cafe'
                    ? 'Specialità'
                    : themeId === 'modern-fast-food'
                    ? 'CRAZY COMBOS'
                    : 'Chef Highlights'}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    className={`p-2.5 rounded-2xl border text-xs space-y-1.5 ${
                      themeId === 'premium-dark'
                        ? 'border-slate-800 bg-slate-900/60'
                        : themeId === 'modern-minimal'
                        ? 'border-slate-100 bg-white'
                        : themeId === 'pakistani-traditional'
                        ? 'border-amber-200 bg-white'
                        : themeId === 'italian-cafe'
                        ? 'border-stone-200 bg-white'
                        : 'border-neutral-800 bg-neutral-900'
                    }`}
                  >
                    <div className="h-16 rounded-xl bg-gray-200 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"
                        alt="Dish"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-bold truncate text-[11px]">Signature Special</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black" style={{ color: primaryColor }}>
                        $14.99
                      </span>
                      <span
                        className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black"
                        style={{ backgroundColor: primaryColor, color: themeId === 'modern-minimal' ? '#fff' : '#000' }}
                      >
                        +
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-2xl border text-xs space-y-1.5 ${
                      themeId === 'premium-dark'
                        ? 'border-slate-800 bg-slate-900/60'
                        : themeId === 'modern-minimal'
                        ? 'border-slate-100 bg-white'
                        : themeId === 'pakistani-traditional'
                        ? 'border-amber-200 bg-white'
                        : themeId === 'italian-cafe'
                        ? 'border-stone-200 bg-white'
                        : 'border-neutral-800 bg-neutral-900'
                    }`}
                  >
                    <div className="h-16 rounded-xl bg-gray-200 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80"
                        alt="Dish"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-bold truncate text-[11px]">Artisan Special</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black" style={{ color: primaryColor }}>
                        $22.50
                      </span>
                      <span
                        className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black"
                        style={{ backgroundColor: primaryColor, color: themeId === 'modern-minimal' ? '#fff' : '#000' }}
                      >
                        +
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

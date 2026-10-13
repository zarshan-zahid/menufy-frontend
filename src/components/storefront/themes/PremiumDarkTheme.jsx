import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Star,
  Clock,
  Ban,
  Plus,
  Phone,
  MapPin,
  ExternalLink,
  Flame,
  Award,
} from 'lucide-react';

export default function PremiumDarkTheme({
  restaurant,
  categories,
  featuredItems,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onOpenCart,
  totalCount,
}) {
  const currencySymbol = restaurant.currencySymbol || '$';
  const displayCategories = categories;

  const getInitials = (name) => {
    if (!name) return 'FF';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const isOpen = restaurant.deliverySettings?.isOpenNow !== false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* 1. LUXURY DARK HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            {/* Logo or Neutral Initials Monogram */}
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-600/30 via-slate-900 to-slate-950 text-amber-400 font-black text-lg tracking-wider">
                  {getInitials(restaurant.name)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  {restaurant.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                  {restaurant.cuisine || 'Fine Dining'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className={isOpen ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {isOpen ? 'Accepting Orders' : 'Currently Closed'}
                  </span>
                </span>
                {restaurant.phone && (
                  <span className="hidden sm:inline text-slate-500">
                    • {restaurant.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-xs font-black flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. CINEMATIC HERO SECTION */}
      {restaurant.sections?.showHero !== false && (
        <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
          {restaurant.banner && (
            <div className="absolute inset-0 z-0">
              <img
                src={restaurant.banner}
                alt={`${restaurant.name} banner`}
                className="w-full h-full object-cover opacity-25 filter blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 backdrop-blur-md">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{restaurant.sections?.announcementText || 'Artisan Culinary Excellence & Reserve Kitchen'}</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {restaurant.sections?.heroHeadline || restaurant.tagline || 'Exquisite Gastronomy Delivered to Your Table'}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                {restaurant.sections?.heroSubheadline || restaurant.description || 'Indulge in handcrafted seasonal menus, master-crafted steaks, and gourmet delicacies prepared by our executive chefs.'}
              </p>
            </div>

            {/* Delivery & Operating Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{restaurant.deliverySettings?.estimatedDeliveryTime || '35-45 mins'}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <span>Delivery: <strong>{currencySymbol}{restaurant.deliverySettings?.deliveryFee ?? 4.99}</strong></span>
              </div>
              {restaurant.deliverySettings?.minOrderAmount > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <span>Min Order: <strong>{currencySymbol}{restaurant.deliverySettings.minOrderAmount}</strong></span>
                </div>
              )}
              {restaurant.address && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{restaurant.address}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. CATEGORY SELECTOR & SEARCH BAR */}
      {restaurant.sections?.showCategories !== false && (
        <div className="sticky top-20 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Horizontal Categories */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                All Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat._id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Dish Search Input */}
            <div className="w-full sm:w-64 shrink-0">
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN DISHES CATALOG */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Section */}
        {restaurant.sections?.showFeatured !== false &&
          featuredItems.length > 0 &&
          activeCategory === 'all' &&
          !searchQuery && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Executive Chef's Private Reserve
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <PremiumDishCard
                    key={item._id}
                    item={item}
                    currencySymbol={currencySymbol}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            </section>
          )}

        {/* Categorized Dishes */}
        {displayCategories.map((cat) => {
          const items = (cat.items || []).filter((it) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return it.name.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q);
          });

          if (items.length === 0) return null;

          return (
            <section key={cat._id} id={`cat-${cat._id}`} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <PremiumDishCard
                    key={item._id}
                    item={item}
                    currencySymbol={currencySymbol}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-400">{restaurant.name} • {restaurant.cuisine}</p>
        <p className="mt-1">{restaurant.address} • Powered by MenuFy Multi-Tenant Engine</p>
      </footer>
    </div>
  );
}

function PremiumDishCard({ item, currencySymbol, onSelect }) {
  const isAvailable = item.isAvailable !== false;
  const price = item.discountPrice ?? item.price;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`group bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        isAvailable
          ? 'hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div>
        {/* Dish Photo */}
        <div className="relative h-48 bg-slate-950 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isAvailable ? 'group-hover:scale-105' : 'grayscale'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600 text-xs font-semibold">
              Chef Creation
            </div>
          )}

          {/* Sold Out Dark Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-lg tracking-wider uppercase flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5" /> Sold Out
              </span>
            </div>
          )}

          {/* Prep time badge */}
          {item.prepTime && isAvailable && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/80 backdrop-blur-sm text-slate-300 border border-slate-700/60">
              {item.prepTime}
            </span>
          )}
        </div>

        {/* Text Info */}
        <div className="p-5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
              {item.name}
            </h4>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {item.description || 'Prepared with top-tier cuts and seasonal organic ingredients.'}
          </p>
        </div>
      </div>

      {/* Price & Action */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-3 pt-3">
        <div>
          <span className="text-lg font-black text-amber-400">
            {currencySymbol}{price.toFixed(2)}
          </span>
          {item.discountPrice && (
            <span className="text-xs text-slate-500 line-through ml-2">
              {currencySymbol}{item.price.toFixed(2)}
            </span>
          )}
        </div>

        {isAvailable ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition-transform transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>
        ) : (
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
}

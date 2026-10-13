import React from 'react';
import {
  ShoppingBag,
  Clock,
  Ban,
  Plus,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ModernMinimalTheme({
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. CLEAN MONOCHROME HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold text-sm tracking-widest">
                  {getInitials(restaurant.name)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {restaurant.name}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                  {restaurant.cuisine || 'Bakery & Cafe'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className={isOpen ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
                {restaurant.address && <span>• {restaurant.address}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenCart}
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag ({totalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. AIRY MINIMAL HERO */}
      {restaurant.sections?.showHero !== false && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 border-b border-slate-100 space-y-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
              {restaurant.sections?.announcementText || 'Contemporary Artisan Dining'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {restaurant.sections?.heroHeadline || restaurant.tagline || 'Simple Ingredients, Exceptional Craft'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {restaurant.sections?.heroSubheadline || restaurant.description || 'Thoughtfully sourced produce, slow fermentation, and minimalist culinary elegance.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            <span>Estimated Prep: <strong>{restaurant.deliverySettings?.estimatedDeliveryTime || '25-35 mins'}</strong></span>
            <span>•</span>
            <span>Delivery: <strong>{currencySymbol}{restaurant.deliverySettings?.deliveryFee ?? 0}</strong></span>
            {restaurant.deliverySettings?.minOrderAmount > 0 && (
              <>
                <span>•</span>
                <span>Minimum: <strong>{currencySymbol}{restaurant.deliverySettings.minOrderAmount}</strong></span>
              </>
            )}
          </div>
        </section>
      )}

      {/* 3. MINIMAL PILL NAVIGATION & SEARCH */}
      {restaurant.sections?.showCategories !== false && (
        <div className="sticky top-18 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 py-3">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                    activeCategory === cat._id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-56 shrink-0">
              <input
                type="text"
                placeholder="Find item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. CLEAN PRODUCT CARDS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Section */}
        {restaurant.sections?.showFeatured !== false &&
          featuredItems.length > 0 &&
          activeCategory === 'all' &&
          !searchQuery && (
            <section className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Curated Selection
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <MinimalDishCard
                    key={item._id}
                    item={item}
                    currencySymbol={currencySymbol}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            </section>
          )}

        {/* Categories */}
        {displayCategories.map((cat) => {
          const items = (cat.items || []).filter((it) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return it.name.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q);
          });

          if (items.length === 0) return null;

          return (
            <section key={cat._id} id={`cat-${cat._id}`} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <MinimalDishCard
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

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-400">
        <p>{restaurant.name} • {restaurant.cuisine}</p>
      </footer>
    </div>
  );
}

function MinimalDishCard({ item, currencySymbol, onSelect }) {
  const isAvailable = item.isAvailable !== false;
  const price = item.discountPrice ?? item.price;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`border border-slate-100 rounded-2xl p-4 transition flex flex-col justify-between ${
        isAvailable
          ? 'hover:border-slate-300 hover:shadow-xs cursor-pointer bg-white'
          : 'bg-slate-50/60 opacity-60 cursor-not-allowed'
      }`}
    >
      <div>
        <div className="relative h-40 bg-slate-50 rounded-xl overflow-hidden mb-3">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover ${!isAvailable && 'grayscale'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
              Photo
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {item.description || 'Fresh ingredients and balanced seasoning.'}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900">
          {currencySymbol}{price.toFixed(2)}
        </span>

        {isAvailable ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            + Add
          </button>
        ) : (
          <span className="text-[10px] font-bold text-slate-400">Sold Out</span>
        )}
      </div>
    </div>
  );
}

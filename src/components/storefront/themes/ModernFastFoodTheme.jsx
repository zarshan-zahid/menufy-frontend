import React from 'react';
import {
  ShoppingBag,
  Flame,
  Star,
  Clock,
  Ban,
  Plus,
  Zap,
  TrendingUp,
} from 'lucide-react';

export default function ModernFastFoodTheme({
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
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-orange-600 selection:text-white">
      {/* 1. HIGH-ENERGY FAST FOOD HEADER */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-orange-500 bg-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-xl text-white">
                  {getInitials(restaurant.name)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">
                  {restaurant.name}
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-black uppercase tracking-wider">
                  HOT & FAST
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                <span className={isOpen ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-neutral-500'}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isOpen ? 'KITCHEN FIRING ORDERS' : 'STORE OFFLINE'}
                </span>
                {restaurant.phone && <span className="hidden sm:inline">• {restaurant.phone}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenCart}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-600/40 transition-transform transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>BAG ({totalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. PUNCHY FAST FOOD HERO */}
      {restaurant.sections?.showHero !== false && (
        <section className="relative overflow-hidden bg-gradient-to-r from-neutral-900 via-orange-950/70 to-red-950 py-12 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
          {restaurant.banner && (
            <div className="absolute inset-0 z-0">
              <img
                src={restaurant.banner}
                alt={`${restaurant.name} banner`}
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-xs font-black text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>{restaurant.sections?.announcementText || 'DOUBLE PATTY SMASH BURGERS • CRUNCHY COMBOS • CRISPY SIDES'}</span>
            </div>

            <div className="max-w-3xl space-y-2">
              <h2 className="text-3xl sm:text-6xl font-black uppercase text-white tracking-tight leading-none">
                {restaurant.sections?.heroHeadline || restaurant.tagline || 'CRAVE IT. CLICK IT. CRUNCH IT.'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium max-w-xl">
                {restaurant.sections?.heroSubheadline || restaurant.description || 'Sizzling hot smash burgers, loaded fries, melted cheddar, and secret sauce dispatched straight from the grill.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-neutral-200">
              <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>{restaurant.deliverySettings?.estimatedDeliveryTime || '20-30 MINS SPEED'}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <span>DELIVERY: <strong>{currencySymbol}{restaurant.deliverySettings?.deliveryFee ?? 2.99}</strong></span>
              </div>
              {restaurant.deliverySettings?.minOrderAmount > 0 && (
                <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span>MIN ORDER: <strong>{currencySymbol}{restaurant.deliverySettings.minOrderAmount}</strong></span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. BOLD CATEGORY BUTTONS */}
      {restaurant.sections?.showCategories !== false && (
        <div className="sticky top-20 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                ALL CRAVINGS
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition whitespace-nowrap ${
                    activeCategory === cat._id
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-60 shrink-0">
              <input
                type="text"
                placeholder="Search burgers, pizzas, wings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. DISHES GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Combos & Best Sellers */}
        {restaurant.sections?.showFeatured !== false &&
          featuredItems.length > 0 &&
          activeCategory === 'all' &&
          !searchQuery && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-orange-500 pb-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl sm:text-3xl font-black uppercase text-white">
                  TOP PICKS & SMASH SPECIALS
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <FastFoodDishCard
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
              <div className="border-b border-neutral-800 pb-2">
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <FastFoodDishCard
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
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center text-xs text-neutral-500 font-bold uppercase">
        <p>{restaurant.name} • {restaurant.cuisine}</p>
        <p className="mt-1 lowercase text-[11px] text-neutral-600">powered by MenuFy platform</p>
      </footer>
    </div>
  );
}

function FastFoodDishCard({ item, currencySymbol, onSelect }) {
  const isAvailable = item.isAvailable !== false;
  const price = item.discountPrice ?? item.price;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`border-2 border-neutral-800 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        isAvailable
          ? 'bg-neutral-900/90 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-600/20 hover:-translate-y-1.5 cursor-pointer'
          : 'bg-neutral-950 opacity-60 cursor-not-allowed'
      }`}
    >
      <div>
        <div className="relative h-48 bg-neutral-950 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isAvailable ? 'hover:scale-105' : 'grayscale'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-black uppercase">
              CRAVE CREATION
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-4 py-2 rounded-2xl text-xs font-black bg-red-600 text-white uppercase tracking-widest shadow-xl">
                SOLD OUT
              </span>
            </div>
          )}

          {item.prepTime && isAvailable && (
            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-black/80 text-amber-400 border border-neutral-700">
              ⚡ {item.prepTime}
            </span>
          )}
        </div>

        <div className="p-5 space-y-1.5">
          <h4 className="text-base sm:text-lg font-black uppercase text-white line-clamp-1">{item.name}</h4>
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {item.description || 'Hot off the grill, melted cheese, and signature fast-food seasoning.'}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-800/80 mt-3 pt-3">
        <div>
          <span className="text-xl font-black text-amber-400">
            {currencySymbol}{price.toFixed(2)}
          </span>
          {item.discountPrice && (
            <span className="text-xs text-neutral-500 line-through ml-2">
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
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-transform active:scale-95 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>ADD</span>
          </button>
        ) : (
          <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">
            OUT OF STOCK
          </span>
        )}
      </div>
    </div>
  );
}

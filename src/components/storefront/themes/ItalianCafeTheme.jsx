import React from 'react';
import {
  ShoppingBag,
  Clock,
  Ban,
  Plus,
  MapPin,
  Sparkles,
  UtensilsCrossed,
  Heart,
} from 'lucide-react';

export default function ItalianCafeTheme({
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
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 font-sans selection:bg-amber-800 selection:text-white">
      {/* 1. ITALIAN CAFE & BISTRO HEADER */}
      <header className="sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 flex items-center justify-center shrink-0 shadow-sm">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#292524] text-[#fef3c7] font-serif font-black text-lg">
                  {getInitials(restaurant.name)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-serif text-stone-950 tracking-tight">
                  {restaurant.name}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700 italic">
                  {restaurant.cuisine || 'Trattoria & Caffe'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                <span className="flex items-center gap-1 font-serif italic text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-700" />
                  {isOpen ? 'Aperto (Open Now)' : 'Chiuso (Closed)'}
                </span>
                {restaurant.address && <span>• {restaurant.address}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenCart}
              className="px-4 py-2.5 rounded-xl bg-[#292524] hover:bg-stone-800 text-[#fef3c7] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition"
            >
              <ShoppingBag className="w-4 h-4 text-[#fef3c7]" />
              <span>Ordinazione ({totalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. RUSTIC TUSCAN HERO */}
      {restaurant.sections?.showHero !== false && (
        <section className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-[#2e2620] to-stone-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
          {restaurant.banner && (
            <div className="absolute inset-0 z-0">
              <img
                src={restaurant.banner}
                alt={`${restaurant.name} banner`}
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-xs font-serif italic text-amber-200">
              <span>{restaurant.sections?.announcementText || 'Forno a Legna • Artisan Pizza & Fresh Pasta'}</span>
            </div>

            <div className="max-w-2xl space-y-2">
              <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[#fef3c7] tracking-tight leading-tight">
                {restaurant.sections?.heroHeadline || restaurant.tagline || 'Fatto a Mano con Amore e Tradizione'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif italic">
                {restaurant.sections?.heroSubheadline || restaurant.description || 'Artisan wood-fired pizzas, slow-simmered sauces, hand-rolled pasta, and authentic Italian espresso roasted daily.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-300">
              <div className="px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-700/60">
                <span>Consegna: <strong>{restaurant.deliverySettings?.estimatedDeliveryTime || '30-40 mins'}</strong></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-700/60">
                <span>Delivery: <strong>{currencySymbol}{restaurant.deliverySettings?.deliveryFee ?? 3.5}</strong></span>
              </div>
              {restaurant.deliverySettings?.minOrderAmount > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-700/60">
                  <span>Minimo: <strong>{currencySymbol}{restaurant.deliverySettings.minOrderAmount}</strong></span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. BISTRO MENU NAVIGATION */}
      {restaurant.sections?.showCategories !== false && (
        <div className="sticky top-20 z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-stone-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none font-serif">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-[#292524] text-[#fef3c7] shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Tutto il Menu (All)
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeCategory === cat._id
                      ? 'bg-[#292524] text-[#fef3c7] shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-56 shrink-0">
              <input
                type="text"
                placeholder="Cerca piatti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. DISHES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Chef Specials */}
        {restaurant.sections?.showFeatured !== false &&
          featuredItems.length > 0 &&
          activeCategory === 'all' &&
          !searchQuery && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
                <UtensilsCrossed className="w-5 h-5 text-stone-800" />
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                  Specialità della Casa (Chef Highlights)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <ItalianDishCard
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
              <div className="border-b border-stone-200 pb-2">
                <h3 className="text-xl font-bold font-serif text-stone-900">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-stone-500 font-serif italic mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItalianDishCard
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
      <footer className="border-t border-stone-200 bg-[#f4eee5] py-8 text-center text-xs text-stone-600 font-serif italic">
        <p>{restaurant.name} • Buona Forchetta</p>
        <p className="mt-1">{restaurant.address} • Powered by MenuFy</p>
      </footer>
    </div>
  );
}

function ItalianDishCard({ item, currencySymbol, onSelect }) {
  const isAvailable = item.isAvailable !== false;
  const price = item.discountPrice ?? item.price;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        isAvailable
          ? 'bg-white hover:border-stone-400 hover:shadow-md cursor-pointer'
          : 'bg-stone-50 opacity-60 cursor-not-allowed'
      }`}
    >
      <div>
        <div className="relative h-44 bg-stone-100 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover ${!isAvailable && 'grayscale'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif italic text-xs">
              Piatto Speciale
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-700 text-white uppercase tracking-wider">
                Esaurito (Sold Out)
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-1">
          <h4 className="text-base font-bold font-serif text-stone-900 line-clamp-1">{item.name}</h4>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {item.description || 'Authentic ingredients, fresh herbs, and Mediterranean oil.'}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2 pt-2">
        <span className="text-base font-bold font-serif text-stone-900">
          {currencySymbol}{price.toFixed(2)}
        </span>

        {isAvailable ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#292524] hover:bg-stone-800 text-[#fef3c7] font-bold text-xs"
          >
            + Ordina
          </button>
        ) : (
          <span className="text-[10px] font-bold text-stone-400">Esaurito</span>
        )}
      </div>
    </div>
  );
}

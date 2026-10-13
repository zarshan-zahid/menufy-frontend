import React from 'react';
import {
  ShoppingBag,
  Flame,
  Star,
  Clock,
  Ban,
  Plus,
  MapPin,
  Utensils,
  Award,
  Heart,
} from 'lucide-react';

export default function PakistaniTraditionalTheme({
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
  const currencySymbol = restaurant.currencySymbol || 'Rs. ';
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
    <div className="min-h-screen bg-[#fffdf9] text-stone-900 font-sans selection:bg-amber-600 selection:text-white">
      {/* 1. WARM TRADITIONAL DAWAT HEADER */}
      <header className="sticky top-0 z-40 bg-[#fffdf9]/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-600 bg-amber-50 flex items-center justify-center shrink-0 shadow-sm">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-700 via-orange-800 to-red-900 text-amber-100 font-black text-lg tracking-wider">
                  {getInitials(restaurant.name)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-stone-950 tracking-tight">
                  {restaurant.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {restaurant.cuisine || 'Pakistani & BBQ'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  {isOpen ? 'Fresh Handi & Karahi Ready' : 'Dastarkhwan Closed'}
                </span>
                {restaurant.city && <span>• {restaurant.city}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenCart}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 hover:from-amber-800 hover:to-red-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-orange-700/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Dastarkhwan ({totalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. RICH WARM DAWAT BANNER */}
      {restaurant.sections?.showHero !== false && (
        <section className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-stone-900 to-red-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-amber-800/40">
          {restaurant.banner && (
            <div className="absolute inset-0 z-0">
              <img
                src={restaurant.banner}
                alt={`${restaurant.name} banner`}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-300">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{restaurant.sections?.announcementText || 'Koyla BBQ, Dum Biryani & Shinwari Handi Specials'}</span>
            </div>

            <div className="max-w-3xl space-y-2">
              <h2 className="text-3xl sm:text-5xl font-black text-amber-100 tracking-tight leading-tight">
                {restaurant.sections?.heroHeadline || restaurant.tagline || 'Asal Desi Zaiqa, Taza Tandoor Se Direct'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                {restaurant.sections?.heroSubheadline || restaurant.description || 'Authentic Pakistani family dining. Freshly cooked in pure desi ghee, charcoal-smoked seekh kebabs, and aromatic basmati dum biryani.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-amber-200">
              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30">
                <span>Cooking Time: <strong>{restaurant.deliverySettings?.estimatedDeliveryTime || '30-40 mins'}</strong></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30">
                <span>Rider Delivery: <strong>{currencySymbol}{restaurant.deliverySettings?.deliveryFee ?? 150}</strong></span>
              </div>
              {restaurant.address && (
                <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{restaurant.address}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. TRADITIONAL CATEGORY SCROLLER */}
      {restaurant.sections?.showCategories !== false && (
        <div className="sticky top-20 z-30 bg-[#fffdf9]/95 backdrop-blur-md border-b border-amber-200/80 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-amber-800 text-white shadow-md'
                    : 'bg-amber-50 text-stone-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Kul Menu (All)
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeCategory === cat._id
                      ? 'bg-amber-800 text-white shadow-md'
                      : 'bg-amber-50 text-stone-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64 shrink-0">
              <input
                type="text"
                placeholder="Karahi, Tikka, Biryani talash karein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. DISHES GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Chef Specials */}
        {restaurant.sections?.showFeatured !== false &&
          featuredItems.length > 0 &&
          activeCategory === 'all' &&
          !searchQuery && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-amber-300 pb-2">
                <Flame className="w-5 h-5 text-amber-700" />
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  Dawat-e-Khaas (Chef Signature Specials)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <TraditionalDishCard
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
              <div className="border-b border-amber-200 pb-2">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-stone-500 mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <TraditionalDishCard
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
      <footer className="border-t border-amber-200 bg-[#faf6ed] py-10 text-center text-xs text-stone-600">
        <p className="font-bold text-stone-800">{restaurant.name} • Asal Pakistani Taste</p>
        <p className="mt-1">{restaurant.address} • Powered by MenuFy</p>
      </footer>
    </div>
  );
}

function TraditionalDishCard({ item, currencySymbol, onSelect }) {
  const isAvailable = item.isAvailable !== false;
  const price = item.discountPrice ?? item.price;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`border-2 border-amber-100 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        isAvailable
          ? 'bg-white hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
          : 'bg-stone-50 opacity-60 cursor-not-allowed'
      }`}
    >
      <div>
        <div className="relative h-48 bg-stone-100 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover ${!isAvailable && 'grayscale'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-800 text-xs font-bold bg-amber-50">
              Desi Handi Special
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-700 text-white uppercase tracking-wider">
                Khatam (Sold Out)
              </span>
            </div>
          )}

          {item.prepTime && isAvailable && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 text-amber-200">
              Fresh Cooked: {item.prepTime}
            </span>
          )}
        </div>

        <div className="p-5 space-y-1.5">
          <h4 className="text-base font-extrabold text-stone-900 line-clamp-1">{item.name}</h4>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {item.description || 'Authentic spices, fresh meat and traditional karahi preparation.'}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-amber-100/80 mt-3 pt-3">
        <div>
          <span className="text-lg font-black text-amber-800">
            {currencySymbol}{price.toFixed(2)}
          </span>
          {item.discountPrice && (
            <span className="text-xs text-stone-400 line-through ml-2">
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
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Order</span>
          </button>
        ) : (
          <span className="text-[11px] font-bold text-red-600">Khatam</span>
        )}
      </div>
    </div>
  );
}

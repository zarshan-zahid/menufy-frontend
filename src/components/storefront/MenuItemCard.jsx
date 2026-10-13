import React from 'react';
import { Plus, Star, Sparkles, Clock, Ban } from 'lucide-react';

export default function MenuItemCard({ item, currencySymbol = '$', onSelect }) {
  const isAvailable = item.isAvailable !== false;
  const hasModifiers =
    (item.sizes && item.sizes.length > 0) || (item.extras && item.extras.length > 0);

  const discountPercent =
    item.discountPrice && item.price > item.discountPrice
      ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
      : 0;

  const displayPrice = item.discountPrice !== null && item.discountPrice !== undefined
    ? item.discountPrice
    : item.price;

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform ${
        isAvailable
          ? 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
          : 'border-gray-200 bg-gray-50/70 shadow-none opacity-85'
      }`}
    >
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isAvailable ? 'group-hover:scale-105' : 'grayscale opacity-60'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm font-semibold">
            Delicious Choice
          </div>
        )}

        {/* Sold Out Dark Overlay / Banner */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-lg tracking-wider uppercase flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5" /> Sold Out
            </span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {!isAvailable ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-rose-600 text-white shadow-sm">
              Unavailable
            </span>
          ) : (
            <>
              {discountPercent > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-rose-600 text-white shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
              {item.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-sm">
                  <Star className="w-3 h-3 fill-current" /> Chef's Pick
                </span>
              )}
            </>
          )}
        </div>

        {/* Prep Time pill if present */}
        {item.prepTime && isAvailable && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white shadow-sm">
              <Clock className="w-3 h-3" /> {item.prepTime}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-base sm:text-lg font-bold transition-colors line-clamp-1 ${
              isAvailable ? 'text-gray-900 group-hover:text-primary' : 'text-gray-500'
            }`}>
              {item.name}
            </h3>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {item.description || 'Prepared fresh with premium ingredients.'}
          </p>
        </div>

        {/* Bottom Bar: Price & Add Button */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-extrabold ${isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                {currencySymbol}{displayPrice.toFixed(2)}
              </span>
              {item.discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {currencySymbol}{item.price.toFixed(2)}
                </span>
              )}
            </div>
            {hasModifiers && (
              <span className="text-[11px] text-gray-400 font-medium">
                Customizable
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
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl font-bold text-white transition-all transform hover:scale-110 active:scale-95 shadow-md"
              style={{ backgroundColor: 'var(--primary)' }}
              aria-label={`Add ${item.name}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl font-bold text-xs text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed shadow-none"
              title="This item is currently sold out"
              aria-label={`${item.name} is sold out`}
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Sparkles, MapPin, Phone, Info } from 'lucide-react';

export default function HeroBanner({ restaurant }) {
  const sections = restaurant.sections || {};
  if (sections.showHero === false) return null;

  return (
    <div className="relative overflow-hidden bg-gray-900 text-white">
      {/* Banner Image with Overlay */}
      {restaurant.banner && (
        <div className="absolute inset-0 z-0">
          <img
            src={restaurant.banner}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-40 scale-105 filter blur-[0.5px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Announcement Pill */}
        {sections.announcementText && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-amber-300 mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{sections.announcementText}</span>
          </div>
        )}

        {/* Headlines */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          {sections.heroHeadline || restaurant.name}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
          {sections.heroSubheadline || restaurant.description || restaurant.tagline}
        </p>

        {/* Quick Restaurant Badges */}
        <div className="mt-8 flex flex-wrap gap-4 text-xs sm:text-sm text-gray-300">
          {restaurant.address && (
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{restaurant.address}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
              <Phone className="w-4 h-4 text-primary" />
              <span>{restaurant.phone}</span>
            </div>
          )}
          {restaurant.deliverySettings?.minOrderAmount > 0 && (
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Min Order: {restaurant.currencySymbol || '$'}{restaurant.deliverySettings.minOrderAmount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

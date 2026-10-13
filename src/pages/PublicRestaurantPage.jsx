import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';

import PremiumDarkTheme from '../components/storefront/themes/PremiumDarkTheme';
import ModernMinimalTheme from '../components/storefront/themes/ModernMinimalTheme';
import PakistaniTraditionalTheme from '../components/storefront/themes/PakistaniTraditionalTheme';
import ItalianCafeTheme from '../components/storefront/themes/ItalianCafeTheme';
import ModernFastFoodTheme from '../components/storefront/themes/ModernFastFoodTheme';

import ProductDetailModal from '../components/storefront/ProductDetailModal';
import CartDrawer from '../components/storefront/CartDrawer';
import CheckoutModal from '../components/storefront/CheckoutModal';

export default function PublicRestaurantPage() {
  const { slug } = useParams();
  const { initRestaurant, setIsCartOpen, totalCount, syncItemAvailability } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnpublished, setIsUnpublished] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Filtering & Modal state
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchStorefrontData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      setIsUnpublished(false);
      setIsSuspended(false);
      setIsPending(false);

      // 1. Fetch Restaurant Configuration
      const restRes = await api.get(`/public/restaurant/${slug}`);

      if (restRes.success && restRes.restaurant) {
        setRestaurant(restRes.restaurant);
        initRestaurant(
          restRes.restaurant.slug,
          restRes.restaurant.name,
          restRes.restaurant.currencySymbol,
          restRes.restaurant.deliverySettings
        );

        // 2. Fetch Menu
        const menuRes = await api.get(`/public/restaurant/${slug}/menu`);
        if (menuRes.success) {
          const loadedCategories = menuRes.categories || [];
          setCategories(loadedCategories);
          setFeaturedItems(menuRes.featuredItems || []);
          syncItemAvailability(loadedCategories);
        }
      }
    } catch (err) {
      if (err.data?.isPending || err.message?.toLowerCase().includes('pending')) {
        setIsPending(true);
      } else if (err.data?.isSuspended || err.message?.toLowerCase().includes('suspended')) {
        setIsSuspended(true);
      } else if (err.status === 403 || err.data?.isPublished === false) {
        setIsUnpublished(true);
      } else {
        setErrorMsg(err.message || 'Restaurant not found');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorefrontData();
  }, [slug]);

  // Dynamic Theme CSS variable injection
  useEffect(() => {
    if (restaurant?.theme) {
      const root = document.documentElement;
      if (restaurant.theme.primaryColor) {
        root.style.setProperty('--primary', restaurant.theme.primaryColor);
        root.style.setProperty('--primary-hover', restaurant.theme.primaryColor);
      }
      if (restaurant.theme.secondaryColor) {
        root.style.setProperty('--secondary', restaurant.theme.secondaryColor);
      }
      if (restaurant.theme.accentColor) {
        root.style.setProperty('--accent', restaurant.theme.accentColor);
      }
    }
  }, [restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Loading restaurant website...</p>
        </div>
      </div>
    );
  }

  // Pending Review Guard State
  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-amber-300">Application Under Review</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This restaurant website is currently pending platform administration review. Public ordering and visibility will be enabled once approved.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Suspended Guard State
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-rose-300">Restaurant Suspended</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This restaurant account has been temporarily suspended by platform administration. New customer orders are currently disabled.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unpublished Guard State
  if (isUnpublished) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black">Website Currently Unpublished</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This restaurant website is currently unpublished or undergoing maintenance by its owner. Active public ordering is disabled.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Store Not Found</h2>
          <p className="text-xs text-slate-400">
            {errorMsg || `Could not find a restaurant matching "/restaurant/${slug}".`}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Resolve Normalized Theme ID
  const rawThemeId = (restaurant.theme?.themeId || 'modern-fast-food').toLowerCase().trim();

  const themeProps = {
    restaurant,
    categories,
    featuredItems,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    onSelectProduct: setSelectedProduct,
    onOpenCart: () => setIsCartOpen(true),
    totalCount,
  };

  const renderSelectedTheme = () => {
    switch (rawThemeId) {
      case 'premium-dark':
      case 'midnight':
      case 'dark':
        return <PremiumDarkTheme {...themeProps} />;

      case 'modern-minimal':
      case 'minimal':
      case 'sapphire':
        return <ModernMinimalTheme {...themeProps} />;

      case 'pakistani-traditional':
      case 'traditional':
      case 'sunset':
        return <PakistaniTraditionalTheme {...themeProps} />;

      case 'italian-cafe':
      case 'cafe':
      case 'emerald':
      case 'bistro':
        return <ItalianCafeTheme {...themeProps} />;

      case 'modern-fast-food':
      case 'fast-food':
      case 'ember':
      default:
        return <ModernFastFoodTheme {...themeProps} />;
    }
  };

  return (
    <>
      {/* 1. DYNAMIC THEME LAYOUT */}
      {renderSelectedTheme()}

      {/* 2. FLOATING BOTTOM CART BAR (MOBILE ONLY) */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl font-black text-white shadow-2xl flex items-center justify-between bg-orange-600 hover:bg-orange-500 transition animate-bounce"
          >
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>View Order ({totalCount})</span>
            </div>
            <span className="font-black text-xs uppercase tracking-wider">Checkout &rarr;</span>
          </button>
        </div>
      )}

      {/* 3. PRODUCT DETAIL CUSTOMIZATION MODAL (Sizes, Extras, Special Instructions) */}
      {selectedProduct && (
        <ProductDetailModal
          item={selectedProduct}
          restaurant={restaurant}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* 4. SLIDE-OVER CART DRAWER */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* 5. CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        restaurant={restaurant}
      />
    </>
  );
}

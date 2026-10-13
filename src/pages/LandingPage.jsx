import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Palette,
  Bike,
  Flame,
  CheckCircle2,
  ExternalLink,
  Store,
  Layers,
  ShoppingBag,
  Search,
  Clock,
  MapPin,
  ChevronRight,
  X,
  Menu,
  Phone,
  User,
  Check,
  AlertCircle,
  Compass,
  DollarSign,
  HeartHandshake,
  Award,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Cuisine discovery categories with associated tags and descriptions
const CUISINE_CATEGORIES = [
  { id: 'all', label: 'All Cuisines', icon: '🍽️', desc: 'Browse all verified kitchens' },
  { id: 'pakistani', label: 'Pakistani & BBQ', icon: '🔥', desc: 'Karahi, Biryani & Handi', match: ['pakistani', 'bbq', 'traditional', 'karahi', 'desi'] },
  { id: 'italian', label: 'Italian & Pizza', icon: '🍕', desc: 'Woodfired Pizza & Pasta', match: ['italian', 'pizza', 'pasta', 'cafe'] },
  { id: 'fastfood', label: 'Burgers & Fast Food', icon: '🍔', desc: 'Smashed Burgers & Fries', match: ['fast food', 'burger', 'fastfood', 'wings'] },
  { id: 'steakhouse', label: 'Steaks & Grill', icon: '🥩', desc: 'Prime Cuts & Charcoal Grill', match: ['steak', 'smokehouse', 'grill', 'bbq'] },
  { id: 'cafe', label: 'Cafe & Bakery', icon: '☕', desc: 'Espresso & Fresh Desserts', match: ['cafe', 'coffee', 'bakery', 'dessert'] },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  // Directory state
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rider Application Modal state
  const [riderModalOpen, setRiderModalOpen] = useState(false);
  const [riderForm, setRiderForm] = useState({
    name: '',
    phone: '',
    city: 'Karachi',
    vehicleType: 'Motorcycle',
  });
  const [riderSubmitted, setRiderSubmitted] = useState(false);

  // Load verified restaurants from backend public explore endpoint
  const loadExploreRestaurants = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.get('/public/explore');
      if (res.success && Array.isArray(res.restaurants)) {
        setRestaurants(res.restaurants);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error('Failed to load explore directory:', err);
      setFetchError(err.message || 'Unable to connect to MenuFy restaurant network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExploreRestaurants();
  }, []);

  // Featured restaurants memo
  const featuredRestaurants = useMemo(() => {
    return restaurants.filter((r) => r.isFeatured || r.sections?.showFeatured);
  }, [restaurants]);

  // Filtered restaurants based on search input and selected cuisine
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Search query matching: name, cuisine, address, city, tagline, delivery zones
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.cuisine?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.tagline?.toLowerCase().includes(q) ||
        (r.deliverySettings?.allowedCities || []).some((c) => c.toLowerCase().includes(q)) ||
        (r.deliverySettings?.deliveryZones || []).some(
          (z) =>
            z.name?.toLowerCase().includes(q) ||
            (z.allowedAreas || []).some((a) => a.toLowerCase().includes(q))
        );

      // Cuisine category matching
      if (!matchesSearch) return false;

      if (selectedCuisine === 'all') return true;

      const catObj = CUISINE_CATEGORIES.find((c) => c.id === selectedCuisine);
      if (!catObj || !catObj.match) return true;

      const restaurantCuisine = (r.cuisine || '').toLowerCase();
      const restaurantName = (r.name || '').toLowerCase();

      return catObj.match.some(
        (keyword) =>
          restaurantCuisine.includes(keyword) || restaurantName.includes(keyword)
      );
    });
  }, [restaurants, searchQuery, selectedCuisine]);

  // Handle Rider Form Submission
  const handleRiderSubmit = (e) => {
    e.preventDefault();
    if (!riderForm.name || !riderForm.phone) {
      alert('Please provide your full name and phone number.');
      return;
    }
    setRiderSubmitted(true);
  };

  const closeRiderModal = () => {
    setRiderModalOpen(false);
    setRiderSubmitted(false);
    setRiderForm({
      name: '',
      phone: '',
      city: 'Karachi',
      vehicleType: 'Motorcycle',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* ============================================================ */}
      {/* 1. TOP PLATFORM NAVIGATION                                   */}
      {/* ============================================================ */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity / Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block leading-none">
                Menu<span className="text-orange-500">Fy</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Direct Restaurant Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-300">
            <a href="#hero" className="hover:text-orange-400 transition-colors">
              Home
            </a>
            <a href="#explore-directory" className="hover:text-orange-400 transition-colors">
              Explore Restaurants
            </a>
            <a href="#how-it-works" className="hover:text-orange-400 transition-colors">
              How It Works
            </a>
            <a href="#partner-section" className="hover:text-orange-400 transition-colors">
              Become a Restaurant Partner
            </a>
            <button
              type="button"
              onClick={() => setRiderModalOpen(true)}
              className="hover:text-orange-400 transition-colors flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5 text-orange-400" />
              <span>Become a Rider</span>
            </button>
            <Link
              to="/my-orders"
              className="hover:text-orange-400 transition-colors flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
              <span>My Orders</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-2"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Portal ({user.name?.split(' ')[0]})</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-xs transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white font-bold text-xs transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/25 transition-all flex items-center gap-1.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-5 py-4 space-y-3">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-slate-300 hover:text-orange-400"
            >
              Home
            </a>
            <a
              href="#explore-directory"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-slate-300 hover:text-orange-400"
            >
              Explore Restaurants
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-slate-300 hover:text-orange-400"
            >
              How It Works
            </a>
            <a
              href="#partner-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-slate-300 hover:text-orange-400"
            >
              Become a Restaurant Partner
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setRiderModalOpen(true);
              }}
              className="w-full text-left py-2 text-sm font-bold text-orange-400 flex items-center gap-2"
            >
              <Bike className="w-4 h-4" />
              <span>Become a Rider</span>
            </button>
            <Link
              to="/my-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2 text-sm font-bold text-orange-400 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders & Tracking</span>
            </Link>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs text-center"
                  >
                    Go to Portal ({user.name})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-400 text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION WITH PROMINENT RESTAURANT SEARCH              */}
      {/* ============================================================ */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.18),rgba(15,23,42,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-orange-600/10 via-amber-500/10 to-rose-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-black text-orange-400 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>MenuFy Ecosystem • Direct Kitchen Ordering • Zero Commission Markup</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Savor Authentic Dining, <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
              Ordered Direct from the Kitchen
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover premier local restaurants running their own custom storefronts. Enjoy transparent pricing, chef-crafted selections, and prompt doorstep delivery.
          </p>

          {/* Prominent Restaurant & Address Search Bar */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="relative p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search restaurants by name, address, or cuisine (e.g. Smokehouse, Clifton, Italian, Karahi)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <a
                href="#explore-directory"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Find Food</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Location / Area Chips for Fast Address Discovery */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none text-[11px] justify-center sm:justify-start">
              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" /> Areas:
              </span>
              {['Karachi', 'Lahore', 'Islamabad', 'Clifton', 'DHA'].map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => setSearchQuery(place)}
                  className={`px-2.5 py-1 rounded-lg border transition shrink-0 ${
                    searchQuery.toLowerCase() === place.toLowerCase()
                      ? 'bg-orange-600 border-orange-500 text-white font-bold'
                      : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {place}
                </button>
              ))}
            </div>

            {/* Live Filter Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>
                {loading
                  ? 'Connecting to restaurants...'
                  : `${filteredRestaurants.length} verified ${
                      filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'
                    } ready to order`}
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-orange-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Search</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CUISINE & CATEGORY DISCOVERY STRIP                        */}
      {/* ============================================================ */}
      <section className="py-8 bg-slate-900/60 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
                Cuisine Discovery
              </h2>
              <p className="text-xs text-slate-500">Filter menus by culinary tradition</p>
            </div>
            {selectedCuisine !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCuisine('all')}
                className="text-xs text-orange-400 hover:underline font-bold"
              >
                Show All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CUISINE_CATEGORIES.map((cat) => {
              const isSelected = selectedCuisine === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCuisine(cat.id)}
                  className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div>
                    <div className="text-xs font-black truncate">{cat.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. RESTAURANT DIRECTORY & REAL BACKEND STOREFRONTS           */}
      {/* ============================================================ */}
      <section id="explore-directory" className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest">
                <Store className="w-4 h-4" />
                <span>Verified Independent Storefronts</span>
              </div>
              <h2 className="text-3xl font-black text-white mt-1">
                Explore Partner Restaurants
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Every restaurant on MenuFy operates its own dedicated website design, customized menu, and direct ordering experience.
              </p>
            </div>

            {/* Results count pill */}
            <div className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full self-start md:self-auto">
              <span>{filteredRestaurants.length} active listings</span>
            </div>
          </div>

          {/* Loading Skeletons State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden p-6 space-y-4 animate-pulse"
                >
                  <div className="h-32 bg-slate-800 rounded-2xl" />
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 -mt-10 ring-4 ring-slate-900" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-10 bg-slate-800 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Backend Error State */}
          {!loading && fetchError && (
            <div className="p-8 rounded-3xl bg-rose-950/30 border border-rose-800/60 text-center space-y-3 max-w-lg mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Connection to Restaurant Directory Failed</h3>
              <p className="text-xs text-rose-300">{fetchError}</p>
              <button
                type="button"
                onClick={loadExploreRestaurants}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !fetchError && filteredRestaurants.length === 0 && (
            <div className="text-center p-14 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Store className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                {searchQuery
                  ? `No restaurants found matching "${searchQuery}"`
                  : 'No partner restaurants active yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery
                  ? 'Try searching for a different cuisine, location, or clear active category filters.'
                  : 'Be the first to launch your restaurant on MenuFy! Apply now to publish your storefront.'}
              </p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCuisine('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              ) : (
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
                >
                  <span>Partner With MenuFy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}

          {/* Featured & Approved Spotlight (Only active, approved, orderable kitchens) */}
          {!loading && !fetchError && !searchQuery && selectedCuisine === 'all' && featuredRestaurants.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/30 border border-orange-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="text-lg font-black text-white">Featured & Approved Kitchens</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Chef Highlighted
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredRestaurants.slice(0, 3).map((fr) => {
                  const frInitials = (fr.name || 'MF')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <Link
                      key={fr._id}
                      to={`/restaurant/${fr.slug}`}
                      className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/60 transition-all flex items-center gap-3.5"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 flex items-center justify-center">
                        {fr.logo ? (
                          <img src={fr.logo} alt={fr.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-xs text-slate-200">{frInitials}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-white group-hover:text-orange-400 transition truncate">
                            {fr.name}
                          </h4>
                          <span className="text-[10px] text-amber-400 font-bold ml-1">★ Featured</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{fr.cuisine}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real Backend Restaurant Cards Grid */}
          {!loading && !fetchError && filteredRestaurants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((r) => {
                // Neutral monogram initials fallback (Rule: No random food photos!)
                const initials = (r.name || 'MF')
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                const isOpen = r.deliverySettings?.isOpenNow !== false;
                const themeName =
                  r.theme?.themeId === 'premium-dark' || r.theme?.themeId === 'midnight'
                    ? 'Premium Dark'
                    : r.theme?.themeId === 'modern-minimal' || r.theme?.themeId === 'sapphire'
                    ? 'Modern Minimal'
                    : r.theme?.themeId === 'pakistani-traditional' || r.theme?.themeId === 'sunset'
                    ? 'Pakistani Traditional'
                    : r.theme?.themeId === 'italian-cafe' || r.theme?.themeId === 'emerald'
                    ? 'Italian Cafe'
                    : r.theme?.themeId === 'modern-fast-food' || r.theme?.themeId === 'ember'
                    ? 'Modern Fast Food'
                    : 'Custom Branded';

                return (
                  <div
                    key={r._id}
                    className="group rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-950/20 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Optional Banner Cover Image */}
                      <div className="relative h-40 bg-gradient-to-r from-slate-800 via-slate-850 to-slate-900 overflow-hidden border-b border-slate-800/80">
                        {r.banner ? (
                          <img
                            src={r.banner}
                            alt={`${r.name} cover`}
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-25 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                            <Store className="w-16 h-16 text-slate-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                        {/* Open / Closed Availability Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 ${
                              isOpen
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOpen ? 'bg-white animate-pulse' : 'bg-slate-400'
                              }`}
                            />
                            {isOpen ? 'Open Now' : 'Closed'}
                          </span>
                        </div>

                        {/* Theme Tag */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 border border-slate-700 text-slate-300 backdrop-blur-md">
                            {themeName}
                          </span>
                        </div>
                      </div>

                      {/* Content Area with Logo Monogram */}
                      <div className="p-6 pt-0 relative space-y-3">
                        {/* Real Uploaded Logo OR Neutral Initials Monogram (No random food photo) */}
                        <div className="-mt-10 mb-2 flex items-center justify-between">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-slate-900 bg-slate-800 shadow-xl border border-slate-700/80 flex items-center justify-center">
                            {r.logo ? (
                              <img
                                src={r.logo}
                                alt={`${r.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 flex items-center justify-center font-black text-xl text-slate-200 tracking-wider">
                                {initials}
                              </div>
                            )}
                          </div>

                          <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
                            {r.cuisine || 'General Cuisine'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors">
                            {r.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {r.tagline || 'Crafted with passion, delivered with speed.'}
                          </p>
                        </div>

                        {/* Verified Data Only: Address & Delivery Details */}
                        <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
                          {r.address && (
                            <div className="truncate flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{r.address}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            {r.deliverySettings?.deliveryFee !== undefined && r.deliverySettings?.deliveryFee !== null ? (
                              <span className="text-slate-300 font-semibold flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-orange-400" />
                                Delivery:{' '}
                                {r.deliverySettings.deliveryFee === 0
                                  ? 'Free'
                                  : `${r.currencySymbol || '$'}${r.deliverySettings.deliveryFee}`}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                                <Store className="w-3.5 h-3.5 text-slate-500" />
                                Direct Storefront
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-orange-400/80">
                              /{r.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direct Storefront Button */}
                    <div className="p-6 pt-0">
                      <Link
                        to={`/restaurant/${r.slug}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all"
                      >
                        <span>Visit Storefront & Order</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. HOW MENUFY WORKS SECTION                                  */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Streamlined Dining Experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              How MenuFy Powers Your Orders
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We connect diners directly with independent restaurant kitchens. Zero middleman markups, authentic recipes, and fast execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Discover Local Kitchens',
                desc: 'Explore authentic restaurants running customized storefronts built to reflect their culinary style.',
                icon: Store,
                color: 'from-orange-500 to-amber-500',
              },
              {
                step: '02',
                title: 'Customize Your Order',
                desc: 'Pick your portion sizes, chef add-ons, spice preferences, and custom instructions with transparent pricing.',
                icon: Layers,
                color: 'from-amber-500 to-yellow-500',
              },
              {
                step: '03',
                title: 'Direct Kitchen Checkout',
                desc: 'Order straight from the kitchen. No arbitrary platform markups or hidden fees added to your bill.',
                icon: ShoppingBag,
                color: 'from-rose-500 to-orange-500',
              },
              {
                step: '04',
                title: 'Fresh & Swift Delivery',
                desc: 'Receive real-time order tracking as your meal is cooked fresh and dispatched hot right to your door.',
                icon: Bike,
                color: 'from-emerald-500 to-teal-500',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="relative p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${st.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <st.icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-700">
                    {st.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{st.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. RESTAURANT PARTNER SECTION                                */}
      {/* ============================================================ */}
      <section id="partner-section" className="py-20 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-bold text-orange-400">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>For Restaurant Owners</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Stop Paying Heavy Marketplace Commissions. <br />
                  <span className="text-orange-400">Own Your Brand Online.</span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  MenuFy empowers restaurant owners to launch high-performance branded websites in minutes. Choose from five professional culinary themes, manage live menus, and retain 100% of your customer base.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    '5 Unique Restaurant Themes',
                    'Zero Marketplace Markups',
                    'Real-Time Kitchen Orders',
                    'Dedicated URL Slug',
                    'Modifier & Size Add-ons',
                    'Multi-Tenant Data Isolation',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2"
                  >
                    <span>Become a Restaurant Partner</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                  >
                    Partner Sign In
                  </Link>
                </div>
              </div>

              {/* Theme Showcase Mini-Card */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-orange-400" />
                    <span>Included Storefront Designs</span>
                  </span>
                  <span className="text-[10px] font-mono text-orange-400">5 Bespoke Themes</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: 'Premium Dark', desc: 'Obsidian luxury, gold accents & fine dining typography' },
                    { name: 'Modern Minimal', desc: 'Clean white canvas, ample whitespace & clear pills' },
                    { name: 'Pakistani Traditional', desc: 'Terracotta, saffron & authentic dawat heritage' },
                    { name: 'Italian Cafe', desc: 'Warm cream, olive green & Playfair trattoria serif' },
                    { name: 'Modern Fast Food', desc: 'Flame red, bold Oswald grotesque & energetic punch' },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-white">{t.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. DELIVERY RIDER SECTION                                    */}
      {/* ============================================================ */}
      <section id="rider-section" className="py-20 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-bold text-orange-400">
                  <Bike className="w-3.5 h-3.5 text-orange-400" />
                  <span>Delivery Fleet</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Ride with MenuFy. <br />
                  <span className="text-orange-400">Earn with Total Independence.</span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Join our delivery fleet and enjoy complete scheduling flexibility, competitive rates on every trip, weekly automated payouts, and 100% of customer tips.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xl font-black text-orange-400">Flexible</div>
                    <div className="text-xs text-slate-400 mt-1">Pick your shifts & delivery zones</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xl font-black text-emerald-400">Weekly</div>
                    <div className="text-xs text-slate-400 mt-1">Direct deposit payouts every Monday</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRiderModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30 transition-all inline-flex items-center gap-2"
                >
                  <Bike className="w-4 h-4" />
                  <span>Apply to Become a Rider</span>
                </button>
              </div>

              {/* Rider Perks Column */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-400" />
                  <span>Why Fleet Couriers Choose MenuFy</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Full Tips Kept</div>
                      <div className="text-slate-400 text-[11px]">Every rupee/cent of customer tip goes directly to the courier.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Direct Kitchen Dispatch</div>
                      <div className="text-slate-400 text-[11px]">Pick up freshly boxed orders directly from partner kitchens.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Dedicated Support Desk</div>
                      <div className="text-slate-400 text-[11px]">Instant dispatch communication for addresses and rider safety.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. RIDER APPLICATION MODAL                                    */}
      {/* ============================================================ */}
      {riderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={closeRiderModal}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Become a MenuFy Rider</h3>
                <p className="text-xs text-slate-400">Join our city delivery fleet</p>
              </div>
            </div>

            {riderSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-white">Application Received!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Thank you, <span className="text-white font-bold">{riderForm.name}</span>. Our fleet coordinator in <span className="text-white font-bold">{riderForm.city}</span> will reach out via WhatsApp / SMS within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={closeRiderModal}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleRiderSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Ahmed"
                    value={riderForm.name}
                    onChange={(e) => setRiderForm({ ...riderForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+92 300 1234567"
                    value={riderForm.phone}
                    onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Operating City</label>
                    <select
                      value={riderForm.city}
                      onChange={(e) => setRiderForm({ ...riderForm, city: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Vehicle Type</label>
                    <select
                      value={riderForm.vehicleType}
                      onChange={(e) => setRiderForm({ ...riderForm, vehicleType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Electric Bike">Electric Bike</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Car">Car</option>
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 pt-1">
                  By submitting, you agree to MenuFy courier partner guidelines and safety standards.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeRiderModal}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold shadow-md shadow-orange-600/30"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. PROFESSIONAL PLATFORM FOOTER                              */}
      {/* ============================================================ */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-sm">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <span className="text-xl font-black text-white">MenuFy</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct-from-kitchen multi-tenant restaurant engine. Empowering independent culinary brands with their own online stores.
              </p>
              <div className="text-[11px] font-mono text-orange-400/80">
                v4.0 Phase 4 Engine Active
              </div>
            </div>

            {/* Platform Nav */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                Platform
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#hero" className="hover:text-orange-400 transition-colors">
                    Home & Search
                  </a>
                </li>
                <li>
                  <a href="#explore-directory" className="hover:text-orange-400 transition-colors">
                    Explore Restaurants
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-orange-400 transition-colors">
                    How MenuFy Works
                  </a>
                </li>
                <li>
                  <Link to="/my-orders" className="hover:text-orange-400 transition-colors">
                    Customer Orders & Tracking
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Restaurants */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                For Restaurants
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/register" className="hover:text-orange-400 transition-colors">
                    Register Your Restaurant
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-orange-400 transition-colors">
                    Owner Dashboard Login
                  </Link>
                </li>
                <li>
                  <a href="#partner-section" className="hover:text-orange-400 transition-colors">
                    Five Storefront Themes
                  </a>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-orange-400 transition-colors">
                    Super Admin Console
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Couriers & Legal */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                Couriers & Trust
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setRiderModalOpen(true)}
                    className="hover:text-orange-400 transition-colors text-left"
                  >
                    Quick Ride Application
                  </button>
                </li>
                <li>
                  <Link to="/rider/register" className="hover:text-orange-400 transition-colors">
                    Full Courier Registration
                  </Link>
                </li>
                <li>
                  <Link to="/rider/login" className="hover:text-orange-400 transition-colors text-orange-400 font-bold">
                    Rider Portal Login
                  </Link>
                </li>
                <li>
                  <span className="text-slate-500">Zero Middleman Markup Policy</span>
                </li>
                <li>
                  <span className="text-slate-500">Tenant Data Isolation SLA</span>
                </li>
                <li>
                  <span className="text-slate-500">Secure Ordering Infrastructure</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>MenuFy Platform &copy; 2026 • Multi-Tenant Restaurant Engine • Built with React, Vite, Node.js & MongoDB</p>
            <div className="flex items-center space-x-4">
              <span>Direct Kitchens</span>
              <span>•</span>
              <span>5 Custom Themes</span>
              <span>•</span>
              <span>Independent Brands</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

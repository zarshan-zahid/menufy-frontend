import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Utensils,
  Image as ImageIcon,
  ArrowRight,
  AlertCircle,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CUISINE_OPTIONS = [
  'Fast Food & Burgers',
  'Pakistani & Mughlai',
  'Italian & Pizza',
  'Pan-Asian & Sushi',
  'Cafe & Bakery',
  'Middle Eastern & BBQ',
  'Mexican & Tacos',
  'Indian & Curry',
  'Healthy & Salads',
  'Desserts & Beverages',
  'Fine Dining',
  'Other / General',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerPartner } = useAuth();

  // Form states
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [cuisine, setCuisine] = useState(CUISINE_OPTIONS[0]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRestaurantNameChange = (val) => {
    setRestaurantName(val);
    const clean = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(clean);
  };

  // Helper for logo initials monogram
  const getInitials = (name) => {
    if (!name) return 'MF';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Handle image file uploads
  const handleImageUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 2.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
      } else {
        setBannerPreview(reader.result);
      }
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validations
    if (!ownerName.trim()) {
      setErrorMsg('Applicant / Owner name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('A valid email address is required');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (!restaurantName.trim()) {
      setErrorMsg('Restaurant name is required');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Contact phone number is required');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Restaurant street address is required');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Restaurant city is required');
      return;
    }

    setLoading(true);

    try {
      await registerPartner({
        ownerName: ownerName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        restaurantName: restaurantName.trim(),
        slug: slug.trim() || undefined,
        cuisine: cuisine || 'General',
        address: address.trim(),
        city: city.trim(),
        description: description.trim(),
        logo: logoPreview || '',
        banner: bannerPreview || '',
      });

      // Redirect to dashboard where pending status and application details will be shown
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-orange-600/30">
            MF
          </div>
          <span className="text-2xl font-black tracking-tight text-white">MenuFy</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Partner With MenuFy
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Submit your restaurant partner application. Once reviewed and approved by our platform administrators, your brand will go live!
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-8 backdrop-blur-sm">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-8 text-xs">
            {/* SECTION 1: OWNER / APPLICANT ACCOUNT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  1. Owner & Account Credentials
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Owner Full Name <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone Number <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="owner@mykitchen.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Password <span className="text-orange-500">* (Min 6 chars)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: RESTAURANT PROFILE & BRANDING */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Store className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  2. Restaurant Details & Branding
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Restaurant Name <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bella Italia Trattoria"
                      value={restaurantName}
                      onChange={(e) => handleRestaurantNameChange(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Cuisine / Category <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Utensils className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      {CUISINE_OPTIONS.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-slate-200">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Storefront Website URL Slug
                  </label>
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-400">
                    <span className="text-slate-500">/restaurant/</span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) =>
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))
                      }
                      className="bg-transparent text-orange-400 focus:outline-none flex-1 font-mono text-xs ml-0.5"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    This will be the web address customers use to view your menu and order.
                  </span>
                </div>
              </div>

              {/* LOGO UPLOAD & NEUTRAL INITIALS PREVIEW */}
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                <label className="block font-semibold text-slate-300">
                  Restaurant Logo & Neutral Monogram Preview
                </label>
                <div className="flex items-center gap-4">
                  {/* Monogram or uploaded image preview */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Restaurant Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200 font-extrabold text-lg tracking-wider">
                        {getInitials(restaurantName)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition">
                        <Upload className="w-3.5 h-3.5 text-orange-400" />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'logo')}
                          className="hidden"
                        />
                      </label>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={() => setLogoPreview('')}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload your logo or let MenuFy display a neutral monogram with your restaurant initials.
                    </p>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION & COVER IMAGE */}
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Restaurant Story / Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell your customers about your authentic recipes, chef story, or specialty dishes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Cover / Banner Image (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition">
                      <ImageIcon className="w-4 h-4 text-orange-400" />
                      <span>Upload Banner Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'banner')}
                        className="hidden"
                      />
                    </label>
                    {bannerPreview && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Banner loaded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: LOCATION & ADDRESS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  3. Restaurant Location
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Street Address <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main Street, Suite 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    City <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi / New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                <span>{loading ? 'Submitting Application...' : 'Submit Partner Application'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2.5">
                New applications are reviewed by Super Administrators before going live in the directory.
              </p>
            </div>
          </form>

          <p className="text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Already registered as a partner?{' '}
            <Link to="/login" className="font-bold text-orange-400 hover:underline">
              Sign in to your dashboard &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

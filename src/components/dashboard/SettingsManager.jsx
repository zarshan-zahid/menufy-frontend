import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Store, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { api } from '../../utils/api';

export default function SettingsManager({ restaurant, onRefresh }) {
  const [name, setName] = useState(restaurant.name || '');
  const [cuisine, setCuisine] = useState(restaurant.cuisine || 'General');
  const [tagline, setTagline] = useState(restaurant.tagline || '');
  const [description, setDescription] = useState(restaurant.description || '');
  const [phone, setPhone] = useState(restaurant.phone || '');
  const [email, setEmail] = useState(restaurant.email || '');
  const [address, setAddress] = useState(restaurant.address || '');
  const [city, setCity] = useState(restaurant.city || 'Food City');
  const [currency, setCurrency] = useState(restaurant.currency || 'USD');
  const [currencySymbol, setCurrencySymbol] = useState(restaurant.currencySymbol || '$');
  const [logo, setLogo] = useState(restaurant.logo || '');
  const [banner, setBanner] = useState(restaurant.banner || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await api.put(`/restaurants/${restaurant._id}/profile`, {
        name: name.trim(),
        cuisine: cuisine.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        currency: currency.trim(),
        currencySymbol: currencySymbol.trim(),
        logo: logo.trim(),
        banner: banner.trim(),
      });

      if (res.success) {
        setSuccessMsg('Restaurant profile saved to database!');
        onRefresh();
      }
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      {restaurant?.status === 'pending' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
          <div>
            <strong className="font-extrabold text-amber-950 block text-sm">
              Application Under Review
            </strong>
            <span>
              You can update any submitted business and profile details below while awaiting Super Admin review.
            </span>
          </div>
          <span className="px-2.5 py-1 bg-amber-200/70 text-amber-900 rounded-md font-bold text-[11px]">
            Pending Status
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>Restaurant Profile & Contact Info</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Public business details, contact information, cuisine, and branding
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Restaurant Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Cuisine / Category</label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="e.g. Italian & Pizza"
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">URL Identifier (Slug)</label>
          <input
            type="text"
            disabled
            value={restaurant.slug}
            className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-mono text-xs cursor-not-allowed"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1">About / Bio</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Support Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Store Street Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Currency Code</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs uppercase"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Currency Symbol</label>
          <input
            type="text"
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Logo URL</label>
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Banner Image URL</label>
          <input
            type="url"
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
          />
        </div>
      </div>
    </form>
  );
}

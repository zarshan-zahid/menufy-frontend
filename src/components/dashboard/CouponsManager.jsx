import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function CouponsManager({ restaurantId, currencySymbol = '$' }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('100');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await api.get(`/coupons?restaurantId=${restaurantId}`);
      if (res.success && res.coupons) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.warn('Failed to fetch coupons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchCoupons();
  }, [restaurantId]);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('15');
    setMinOrderAmount('20');
    setMaxDiscountAmount('');
    setUsageLimit('200');
    setExpiresAt('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(String(c.discountValue));
    setMinOrderAmount(String(c.minOrderAmount || 0));
    setMaxDiscountAmount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '');
    setUsageLimit(String(c.usageLimit || 100));
    setExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 10) : '');
    setIsActive(c.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!code.trim() || discountValue === '') return;

    setSubmitting(true);
    try {
      const payload = {
        restaurantId,
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: Number(usageLimit) || 100,
        expiresAt: expiresAt || null,
        isActive,
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
      } else {
        await api.post('/coupons', payload);
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      alert('Failed to save coupon: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, couponCode) => {
    if (!window.confirm(`Delete coupon "${couponCode}"?`)) return;
    try {
      await api.delete(`/coupons/${id}?restaurantId=${restaurantId}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon: ' + err.message);
    }
  };

  const handleToggleActive = async (c) => {
    try {
      await api.put(`/coupons/${c._id}`, {
        restaurantId,
        isActive: !c.isActive,
      });
      fetchCoupons();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <span>Promotion & Coupon Engine ({coupons.length})</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Create discount codes with minimum spending requirements and usage limits
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c._id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              c.isActive
                ? 'border-gray-200 bg-white hover:border-gray-300 shadow-xs'
                : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-black tracking-wider text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {c.code}
                </span>
                <span
                  onClick={() => handleToggleActive(c)}
                  className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {c.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xl font-black text-gray-900">
                  {c.discountType === 'percentage'
                    ? `${c.discountValue}% OFF`
                    : `${currencySymbol}${c.discountValue} FLAT OFF`}
                </div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  <div>Min Spend: {currencySymbol}{c.minOrderAmount}</div>
                  <div>Usage: {c.usageCount || 0} / {c.usageLimit} redeemed</div>
                  {c.expiresAt && (
                    <div>Expires: {new Date(c.expiresAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => handleOpenEdit(c)}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(c._id, c.code)}
                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMOKE15, FREEDEL"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm font-bold uppercase focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ({currencySymbol})</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="couponActiveCheck" className="font-semibold text-gray-700">
                  Active for checkout
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-white font-bold shadow-md"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {submitting ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

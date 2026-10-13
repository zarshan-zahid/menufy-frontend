import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  X,
  Save,
  Building2,
  Bike,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../../utils/api';

export default function BranchManager({ restaurantId, onRefresh }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [isMainBranch, setIsMainBranch] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deletingBranchId, setDeletingBranchId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await api.get(`/branches?restaurantId=${restaurantId}`);
      if (res.success && res.branches) {
        setBranches(res.branches);
      }
    } catch (err) {
      console.warn('Failed to load branches:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchBranches();
  }, [restaurantId]);

  const openCreateModal = () => {
    setEditingBranch(null);
    setName('');
    setAddress('');
    setCity('');
    setPhone('');
    setEmail('');
    setOpenTime('10:00');
    setCloseTime('23:00');
    setDeliveryEnabled(true);
    setPickupEnabled(true);
    setIsMainBranch(branches.length === 0);
    setModalOpen(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setName(branch.name || '');
    setAddress(branch.address || '');
    setCity(branch.city || '');
    setPhone(branch.phone || '');
    setEmail(branch.email || '');
    setOpenTime(branch.openingHours?.openTime || '10:00');
    setCloseTime(branch.openingHours?.closeTime || '23:00');
    setDeliveryEnabled(branch.deliveryEnabled ?? true);
    setPickupEnabled(branch.pickupEnabled ?? true);
    setIsMainBranch(branch.isMainBranch ?? false);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      restaurantId,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim(),
      email: email.trim(),
      openingHours: {
        openTime,
        closeTime,
        isOpen24Hours: false,
      },
      deliveryEnabled,
      pickupEnabled,
      isMainBranch,
      isActive: true,
    };

    try {
      let res;
      if (editingBranch) {
        res = await api.put(`/branches/${editingBranch._id}`, payload);
      } else {
        res = await api.post('/branches', payload);
      }

      if (res.success) {
        setModalOpen(false);
        await fetchBranches();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert('Failed to save branch: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBranchId) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/branches/${deletingBranchId}`);
      if (res.success) {
        setDeletingBranchId(null);
        await fetchBranches();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert('Failed to delete branch: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Restaurant Branches & Outlet Locations</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure physical storefront branches, contact info, hours, and delivery availability
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">
          Loading branch locations...
        </div>
      ) : branches.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <MapPin className="w-8 h-8 mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-700">No Custom Branches Configured</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Your restaurant currently operates from your main profile address. Add additional branches to let customers select their closest outlet during checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div
              key={b._id}
              className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-gray-900">{b.name}</h3>
                    {b.isMainBranch && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Main Branch
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{b.address}, {b.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60"
                    title="Edit Branch"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingBranchId(b._id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Branch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{b.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{b.openingHours?.openTime || '10:00'} - {b.openingHours?.closeTime || '23:00'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery: {b.deliveryEnabled ? 'Enabled' : 'Disabled'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pickup: {b.pickupEnabled ? 'Enabled' : 'Disabled'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Branch Modal */}
      {modalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900">
                {editingBranch ? 'Edit Branch Location' : 'Add New Branch Location'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown Flagship, Clifton Seaside Branch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 Culinary Avenue"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi, New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="branch@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryEnabled}
                    onChange={(e) => setDeliveryEnabled(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">Enable Doorstep Delivery from this branch</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pickupEnabled}
                    onChange={(e) => setPickupEnabled(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">Enable Customer Pickup from this branch</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMainBranch}
                    onChange={(e) => setIsMainBranch(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">Set as Primary / Main Flagship Branch</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Branch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBranchId && (
        <div className="modal-overlay animate-fade-in" onClick={() => setDeletingBranchId(null)}>
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-gray-900">Delete Branch Location?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to remove this branch? Existing order history will remain preserved.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBranchId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

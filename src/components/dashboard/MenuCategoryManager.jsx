import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Layers, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';

export default function MenuCategoryManager({ categories, restaurantId, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setOrderIndex(categories.length);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setOrderIndex(cat.orderIndex || 0);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, {
          restaurantId,
          name: name.trim(),
          description: description.trim(),
          orderIndex: Number(orderIndex),
        });
      } else {
        await api.post('/categories', {
          restaurantId,
          name: name.trim(),
          description: description.trim(),
          orderIndex: Number(orderIndex),
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Failed to save category: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${categoryToDelete._id}?restaurantId=${restaurantId}`);
      setCategoryToDelete(null);
      onRefresh();
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, {
        restaurantId,
        isActive: !cat.isActive,
      });
      onRefresh();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span>Menu Categories ({categories.length})</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize your dishes into sections (e.g. Burgers, Steaks, Beverages)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:shadow-md transition-all"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
              cat.isActive
                ? 'border-gray-200 bg-white hover:border-gray-300 shadow-xs'
                : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex-1 truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 truncate">{cat.name}</span>
                <span
                  onClick={() => handleToggleActive(cat)}
                  className={`cursor-pointer px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                  }`}
                  title="Click to toggle visibility"
                >
                  {cat.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              {cat.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{cat.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit category"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCategoryToDelete(cat)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="modal-overlay animate-fade-in" onClick={() => setCategoryToDelete(null)}>
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Delete Menu Category?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete category <span className="font-bold text-gray-900">"{categoryToDelete.name}"</span>? Any food items currently belonging to this category will also be deleted from your menu.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Burgers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short tagline or summary for this section"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Display Order Index</label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
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
                  className="px-4 py-2 rounded-xl text-white font-bold shadow-md"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Image as ImageIcon,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Upload,
  AlertTriangle,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../utils/api';

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1621996346565-e3d5d62810f5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
];

export default function MenuItemManager({
  items = [],
  categories = [],
  restaurantId,
  currencySymbol = '$',
  onRefresh,
}) {
  // Local state for immediate / optimistic UI updates
  const [localItems, setLocalItems] = useState(items);
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'available' | 'sold_out'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [prepTime, setPrepTime] = useState('');

  // Sizes & Extras
  const [sizes, setSizes] = useState([]);
  const [extras, setExtras] = useState([]);

  // Temp inputs for adding size/extra
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizePrice, setNewSizePrice] = useState('');
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategoryId(categories[0]?._id || '');
    setDescription('');
    setImage(IMAGE_PRESETS[0]);
    setPrice('14.99');
    setDiscountPrice('');
    setIsAvailable(true);
    setIsFeatured(false);
    setPrepTime('15-20 mins');
    setSizes([]);
    setExtras([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setDescription(item.description || '');
    setImage(item.image || '');
    setPrice(String(item.price));
    setDiscountPrice(item.discountPrice !== null && item.discountPrice !== undefined ? String(item.discountPrice) : '');
    setIsAvailable(item.isAvailable ?? true);
    setIsFeatured(item.isFeatured ?? false);
    setPrepTime(item.prepTime || '');
    setSizes(item.sizes ? [...item.sizes] : []);
    setExtras(item.extras ? [...item.extras] : []);
    setIsModalOpen(true);
  };

  // Image upload handler (converts file to data URL)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Image file size must be less than 2.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSize = () => {
    if (!newSizeName.trim() || newSizePrice === '') return;
    setSizes([...sizes, { name: newSizeName.trim(), price: Number(newSizePrice) }]);
    setNewSizeName('');
    setNewSizePrice('');
  };

  const handleRemoveSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleAddExtra = () => {
    if (!newExtraName.trim() || newExtraPrice === '') return;
    setExtras([...extras, { name: newExtraName.trim(), price: Number(newExtraPrice) }]);
    setNewExtraName('');
    setNewExtraPrice('');
  };

  const handleRemoveExtra = (index) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || price === '') return;

    setSubmitting(true);
    try {
      const payload = {
        restaurantId,
        categoryId,
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        isAvailable,
        isFeatured,
        prepTime: prepTime.trim(),
        sizes,
        extras,
      };

      if (editingItem) {
        const res = await api.put(`/menu-items/${editingItem._id}`, payload);
        if (res.success && res.item) {
          setLocalItems((prev) =>
            prev.map((i) => (i._id === editingItem._id ? res.item : i))
          );
        }
      } else {
        const res = await api.post('/menu-items', payload);
        if (res.success && res.item) {
          setLocalItems((prev) => [res.item, ...prev]);
        }
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Failed to save menu item: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Immediate toggle with optimistic rollback
  const handleToggleAvailability = async (item) => {
    const previousStatus = item.isAvailable;
    const nextStatus = !previousStatus;

    // Optimistically update local state immediately
    setLocalItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isAvailable: nextStatus } : i))
    );

    try {
      await api.patch(`/menu-items/${item._id}/availability`, {
        restaurantId,
        isAvailable: nextStatus,
      });
      onRefresh();
    } catch (err) {
      // Rollback on failure
      setLocalItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: previousStatus } : i))
      );
      alert('Failed to update availability: ' + err.message);
    }
  };

  const handleToggleFeatured = async (item) => {
    const nextStatus = !item.isFeatured;
    setLocalItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isFeatured: nextStatus } : i))
    );

    try {
      await api.patch(`/menu-items/${item._id}/featured`, {
        restaurantId,
        isFeatured: nextStatus,
      });
      onRefresh();
    } catch (err) {
      setLocalItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isFeatured: item.isFeatured } : i))
      );
      alert('Failed to update featured state: ' + err.message);
    }
  };

  // Confirm and execute item deletion
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);

    // Optimistically remove from state
    const targetId = itemToDelete._id;
    setLocalItems((prev) => prev.filter((i) => i._id !== targetId));

    try {
      await api.delete(`/menu-items/${targetId}?restaurantId=${restaurantId}`);
      setItemToDelete(null);
      onRefresh();
    } catch (err) {
      // Restore on failure
      setLocalItems(items);
      alert('Failed to delete item: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Filtering and Sorting pipeline
  const filteredAndSortedItems = localItems
    .filter((item) => {
      // 1. Category Filter
      if (selectedCategoryFilter !== 'all' && String(item.categoryId) !== selectedCategoryFilter) {
        return false;
      }
      // 2. Availability Filter
      if (availabilityFilter === 'available' && !item.isAvailable) return false;
      if (availabilityFilter === 'sold_out' && item.isAvailable) return false;
      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      const priceA = a.discountPrice !== null && a.discountPrice !== undefined ? a.discountPrice : a.price;
      const priceB = b.discountPrice !== null && b.discountPrice !== undefined ? b.discountPrice : b.price;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-gray-900">
            Food Items & Catalog ({localItems.length})
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure dishes, upload photos, manage real-time availability, prep times, and customizations
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
        {/* Search input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search food items by name or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Availability Filter */}
        <div className="md:col-span-4 flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1 text-xs">
          <button
            type="button"
            onClick={() => setAvailabilityFilter('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
              availabilityFilter === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityFilter('available')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
              availabilityFilter === 'available'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In Stock
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityFilter('sold_out')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
              availabilityFilter === 'sold_out'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-gray-500 hover:text-rose-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Sold Out
          </button>
        </div>

        {/* Sort Selector */}
        <div className="md:col-span-3 flex items-center relative">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="default">Sort: Default Order</option>
            <option value="name_asc">Sort: Name (A &rarr; Z)</option>
            <option value="name_desc">Sort: Name (Z &rarr; A)</option>
            <option value="price_asc">Sort: Price (Low &rarr; High)</option>
            <option value="price_desc">Sort: Price (High &rarr; Low)</option>
          </select>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategoryFilter === 'all'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Categories ({localItems.length})
        </button>
        {categories.map((c) => {
          const count = localItems.filter((it) => String(it.categoryId) === String(c._id)).length;
          return (
            <button
              key={c._id}
              type="button"
              onClick={() => setSelectedCategoryFilter(c._id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategoryFilter === c._id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Items Grid or Empty State */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="py-12 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-800">No dishes match your filter</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or adding a new food item to this category.
          </p>
          {(searchQuery || availabilityFilter !== 'all' || selectedCategoryFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setAvailabilityFilter('all');
                setSelectedCategoryFilter('all');
              }}
              className="mt-3 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedItems.map((item) => {
            const cat = categories.find((c) => String(c._id) === String(item.categoryId));
            const displayPrice = item.discountPrice !== null && item.discountPrice !== undefined
              ? item.discountPrice
              : item.price;

            return (
              <div
                key={item._id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  item.isAvailable
                    ? 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
                    : 'bg-gray-50/80 border-gray-200 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image || IMAGE_PRESETS[0]}
                        alt={item.name}
                        className={`w-16 h-16 rounded-xl object-cover ${
                          !item.isAvailable ? 'grayscale opacity-60' : ''
                        }`}
                      />
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                          <Ban className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-bold text-sm truncate ${
                          item.isAvailable ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {item.name}
                        </h4>
                        {item.isFeatured && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current flex-shrink-0" />
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-primary block truncate">
                        {cat?.name || 'Uncategorized'}
                      </span>

                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-extrabold text-gray-900">
                          {currencySymbol}
                          {displayPrice.toFixed(2)}
                        </span>
                        {item.discountPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {currencySymbol}{item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                  )}

                  {/* Modifiers & Prep Time info */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[10px]">
                    {item.prepTime && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded font-semibold">
                        <Clock className="w-3 h-3 text-amber-600" /> {item.prepTime}
                      </span>
                    )}
                    {item.sizes?.length > 0 && (
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                        {item.sizes.length} sizes
                      </span>
                    )}
                    {item.extras?.length > 0 && (
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                        {item.extras.length} add-ons
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons & Instant Availability Toggle */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Click to toggle availability"
                    >
                      {item.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
                        </>
                      ) : (
                        <>
                          <Ban className="w-3 h-3 text-rose-600" /> Sold Out
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(item)}
                      className={`p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors ${
                        item.isFeatured ? 'text-amber-500' : ''
                      }`}
                      title="Toggle featured dish"
                    >
                      <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal for Deletion */}
      {itemToDelete && (
        <div className="modal-overlay animate-fade-in" onClick={() => setItemToDelete(null)}>
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Delete Food Item?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <img
                src={itemToDelete.image || IMAGE_PRESETS[0]}
                alt={itemToDelete.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-gray-900 truncate">{itemToDelete.name}</h4>
                <p className="text-xs text-gray-500">
                  {currencySymbol}{itemToDelete.price.toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-gray-900">"{itemToDelete.name}"</span>? It will immediately disappear from your restaurant storefront and dashboard.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Food Item'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Pitmaster Brisket Burger"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, cooking method, flavor notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Image Input + File Upload + Preset Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-gray-700">Item Image</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:text-primary-hover font-bold text-xs flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo from Device
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    {image ? (
                      <img src={image} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Enter image URL or choose preset below..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">Presets:</span>
                  {IMAGE_PRESETS.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt="preset"
                      onClick={() => setImage(p)}
                      className={`w-9 h-9 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                        image === p
                          ? 'border-primary ring-2 ring-primary/40'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pricing, Prep Time & Availability Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Base Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 11.99"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Prep Time (Opt)</label>
                  <input
                    type="text"
                    placeholder="e.g. 15-20 mins"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isAvailableCheck"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="isAvailableCheck" className="font-semibold text-gray-700 cursor-pointer">
                    In Stock
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeaturedCheck"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="isFeaturedCheck" className="font-semibold text-gray-700 cursor-pointer">
                    Featured
                  </label>
                </div>
              </div>

              {/* Sizes Manager */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <span className="font-bold text-gray-800 block">Sizes (Optional)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Size name (e.g. Single, Double, Large)"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    className="flex-1 p-2 bg-white rounded-lg border border-gray-200 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newSizePrice}
                    onChange={(e) => setNewSizePrice(e.target.value)}
                    className="w-24 p-2 bg-white rounded-lg border border-gray-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs"
                  >
                    Add Size
                  </button>
                </div>
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sizes.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold"
                      >
                        {s.name} ({currencySymbol}{s.price.toFixed(2)})
                        <X
                          onClick={() => handleRemoveSize(idx)}
                          className="w-3 h-3 text-gray-400 hover:text-rose-600 cursor-pointer"
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Extras Manager */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <span className="font-bold text-gray-800 block">Add-Ons & Extras (Optional)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Extra name (e.g. Extra Cheese, Dip Sauce)"
                    value={newExtraName}
                    onChange={(e) => setNewExtraName(e.target.value)}
                    className="flex-1 p-2 bg-white rounded-lg border border-gray-200 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newExtraPrice}
                    onChange={(e) => setNewExtraPrice(e.target.value)}
                    className="w-24 p-2 bg-white rounded-lg border border-gray-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddExtra}
                    className="px-3 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs"
                  >
                    Add Extra
                  </button>
                </div>
                {extras.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {extras.map((ex, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold"
                      >
                        +{ex.name} ({currencySymbol}{ex.price.toFixed(2)})
                        <X
                          onClick={() => handleRemoveExtra(idx)}
                          className="w-3 h-3 text-gray-400 hover:text-rose-600 cursor-pointer"
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-white font-bold shadow-md"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {submitting ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

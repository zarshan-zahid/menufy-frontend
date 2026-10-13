import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductDetailModal({ item, restaurant, onClose }) {
  const { addItem, currencySymbol } = useCart();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Initialize selected size if sizes exist
  useEffect(() => {
    if (item && item.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0]);
    } else {
      setSelectedSize(null);
    }
    setSelectedExtras([]);
    setSpecialInstructions('');
    setQuantity(1);
  }, [item]);

  if (!item) return null;

  // Calculate unit price based on size or base/discount price
  let baseUnitPrice = item.discountPrice !== null && item.discountPrice !== undefined
    ? item.discountPrice
    : item.price;

  if (selectedSize && selectedSize.price !== undefined) {
    baseUnitPrice = selectedSize.price;
  }

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + (e.price || 0), 0);
  const unitPrice = Math.round((baseUnitPrice + extrasTotal) * 100) / 100;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleToggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.name === extra.name);
      if (exists) {
        return prev.filter((e) => e.name !== extra.name);
      } else {
        return [...prev, extra];
      }
    });
  };

  const isAvailable = item.isAvailable !== false;

  const handleAddToCart = () => {
    if (!isAvailable) {
      alert(`Sorry, "${item.name}" is sold out and cannot be added.`);
      return;
    }

    const itemToAdd = {
      menuItemId: item._id,
      name: item.name,
      image: item.image,
      basePrice: item.price,
      isAvailable: true,
      selectedSize: selectedSize || { name: '', price: 0 },
      selectedExtras,
      unitPrice,
      quantity,
      totalPrice,
      specialInstructions: specialInstructions.trim(),
    };

    addItem(itemToAdd, restaurant.slug, restaurant.name, restaurant.currencySymbol);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Image */}
        {item.image && (
          <div className="relative w-full h-56 bg-gray-100 flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover ${!isAvailable ? 'grayscale opacity-60' : ''}`}
            />
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="px-4 py-2 rounded-xl text-sm font-black bg-rose-600 text-white shadow-lg tracking-wider uppercase">
                  Currently Sold Out
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {item.name}
              </h2>
              {!isAvailable && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  Sold Out
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {item.description || 'Deliciously crafted with care and premium ingredients.'}
            </p>
            {item.prepTime && (
              <p className="mt-1 text-xs text-gray-400 font-medium">
                Prep Time: {item.prepTime}
              </p>
            )}
          </div>

          {/* Sizes Selection */}
          {item.sizes && item.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Select Size
                </span>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Required
                </span>
              </div>
              <div className="space-y-2">
                {item.sizes.map((size, idx) => {
                  const isSelected = selectedSize?.name === size.name;
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="sizeOption"
                          checked={isSelected}
                          onChange={() => setSelectedSize(size)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          {size.name}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-gray-900">
                        {currencySymbol}{size.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras / Add-ons Selection */}
          {item.extras && item.extras.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Add-Ons & Extras
                </span>
                <span className="text-xs font-medium text-gray-400">
                  Optional
                </span>
              </div>
              <div className="space-y-2">
                {item.extras.map((extra, idx) => {
                  const isChecked = selectedExtras.some((e) => e.name === extra.name);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleExtra(extra)}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {extra.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        +{currencySymbol}{extra.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Special Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. No onions, sauce on the side, extra crispy..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary text-sm transition-all"
            />
          </div>
        </div>

        {/* Footer: Quantity & Add Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-xs p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-extrabold text-gray-900 text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {isAvailable ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-xl font-bold text-white flex items-center justify-between shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span>Add to Order</span>
              <span className="font-extrabold">{currencySymbol}{totalPrice.toFixed(2)}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-400 bg-gray-200 cursor-not-allowed flex items-center justify-center shadow-none"
            >
              Currently Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

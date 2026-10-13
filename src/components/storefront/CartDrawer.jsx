import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ onProceedToCheckout }) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    currencySymbol,
    deliverySettings,
    orderType,
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    hasUnavailableItems,
    removeUnavailableItems,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const minOrder = deliverySettings?.minOrderAmount || 0;
  const isBelowMin = orderType === 'delivery' && subtotal < minOrder;

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    await applyCoupon(couponInput.trim());
    setApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-extrabold text-gray-900">Your Order</h2>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-rose-600 font-semibold px-2 py-1 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-700">Your cart is empty</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Browse our menu and pick something delicious to get started.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const isUnavailable = Boolean(item.isUnavailable);

                return (
                  <div
                    key={item.itemKey}
                    className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 transition-all ${
                      isUnavailable
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    {/* Item Unavailable Warning Banner */}
                    {isUnavailable && (
                      <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 flex-1">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold block">Sold Out at Restaurant</span>
                            <span className="text-[11px] text-rose-700">
                              {item.unavailableReason || 'This item is no longer available. Please remove it from your cart.'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.itemKey)}
                          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shrink-0 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold leading-snug ${isUnavailable ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.name}
                        </h4>
                        {item.selectedSize?.name && (
                          <span className="inline-block text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.2 rounded-md mt-1">
                            Size: {item.selectedSize.name}
                          </span>
                        )}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedExtras.map((ex, i) => (
                              <span
                                key={i}
                                className="text-[10px] text-gray-600 bg-gray-200/70 px-1.5 py-0.5 rounded"
                              >
                                +{ex.name} ({currencySymbol}{ex.price.toFixed(2)})
                              </span>
                            ))}
                          </div>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[11px] text-gray-500 italic mt-1 bg-white p-1.5 rounded border border-gray-100">
                            Note: "{item.specialInstructions}"
                          </p>
                        )}
                      </div>

                      <span className={`text-sm font-extrabold ${isUnavailable ? 'text-gray-400' : 'text-gray-900'}`}>
                        {currencySymbol}{item.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity & Delete Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                      <button
                        type="button"
                        onClick={() => removeItem(item.itemKey)}
                        className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-2xs p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.itemKey, -1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-extrabold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.itemKey, 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Calculations */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">
                        Code '{appliedCoupon.code}' applied (-{currencySymbol}{discount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. SMOKE15)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-xs font-semibold uppercase border border-gray-200 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={applying || !couponInput.trim()}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                      {applying ? 'Checking...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponError}</p>
                )}
              </div>

              {/* Subtotal & Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{currencySymbol}{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    {orderType === 'delivery' ? 'Estimated Delivery' : 'Pickup fee'}
                  </span>
                  <span className="font-bold text-gray-900">
                    {orderType === 'delivery'
                      ? `${currencySymbol}${deliveryFee.toFixed(2)}`
                      : 'FREE'}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Estimated Tax ({deliverySettings?.taxRate || 0}%)</span>
                    <span className="font-bold text-gray-900">{currencySymbol}{tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Unavailable Items Critical Warning Bar */}
              {hasUnavailableItems && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-rose-800 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Your cart contains sold out items that cannot be ordered.</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeUnavailableItems}
                    className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Remove All Sold Out Items
                  </button>
                </div>
              )}

              {/* Minimum Order Warning */}
              {isBelowMin && !hasUnavailableItems && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Minimum delivery order is {currencySymbol}{minOrder.toFixed(2)}. Add{' '}
                    {currencySymbol}{(minOrder - subtotal).toFixed(2)} more to checkout.
                  </span>
                </div>
              )}

              {/* Proceed to Checkout Action */}
              <button
                type="button"
                disabled={isBelowMin || hasUnavailableItems}
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <span>{hasUnavailableItems ? 'Remove Unavailable Items to Checkout' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

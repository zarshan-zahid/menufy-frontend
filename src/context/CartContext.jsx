import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [restaurantSlug, setRestaurantSlug] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryFee: 4.99,
    minOrderAmount: 15.0,
    taxRate: 5,
    deliveryEnabled: true,
    pickupEnabled: true,
  });

  const [items, setItems] = useState([]);
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'pickup'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('menufy_cart') || localStorage.getItem('foodflow_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed.items && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setRestaurantSlug(parsed.restaurantSlug || null);
          setRestaurantName(parsed.restaurantName || '');
          setCurrencySymbol(parsed.currencySymbol || '$');
          setOrderType(parsed.orderType || 'delivery');
          setAppliedCoupon(parsed.appliedCoupon || null);
          setCouponCode(parsed.appliedCoupon?.code || '');
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from storage:', e);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      const cartData = JSON.stringify({
        restaurantSlug,
        restaurantName,
        currencySymbol,
        orderType,
        items,
        appliedCoupon,
      });
      localStorage.setItem('menufy_cart', cartData);
      localStorage.setItem('foodflow_cart', cartData);
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }, [items, restaurantSlug, restaurantName, currencySymbol, orderType, appliedCoupon]);

  // Set the active restaurant context for the cart
  const initRestaurant = (slug, name, symbol, settings) => {
    // If switching to a new restaurant, only update settings if cart is empty,
    // otherwise warn if item is added
    if (items.length === 0) {
      setRestaurantSlug(slug);
      setRestaurantName(name);
      setCurrencySymbol(symbol || '$');
    }
    if (settings) {
      setDeliverySettings(settings);
    }
  };

  /**
   * Add Item to Cart
   * Checks single-tenant isolation: If cart already has items from another restaurant,
   * prompt user or return false so UI can show confirmation dialog.
   */
  const addItem = (itemToAdd, currentSlug, currentName, currentSymbol) => {
    if (!itemToAdd || itemToAdd.isAvailable === false) {
      alert(`Sorry, "${itemToAdd?.name || 'This item'}" is currently sold out and cannot be added to your cart.`);
      return false;
    }

    if (items.length > 0 && restaurantSlug && restaurantSlug !== currentSlug) {
      const confirmClear = window.confirm(
        `Your cart already contains items from "${restaurantName || restaurantSlug}". Would you like to clear your existing cart to start an order with "${currentName || currentSlug}"?`
      );
      if (!confirmClear) {
        return false;
      }
      // User confirmed reset
      setItems([]);
      setAppliedCoupon(null);
      setCouponCode('');
    }

    setRestaurantSlug(currentSlug);
    setRestaurantName(currentName);
    setCurrencySymbol(currentSymbol || '$');

    // Create unique key for item based on id, size, and sorted extras
    const extrasKey = (itemToAdd.selectedExtras || [])
      .map((e) => e.name)
      .sort()
      .join('|');
    const itemKey = `${itemToAdd.menuItemId}_${itemToAdd.selectedSize?.name || 'def'}_${extrasKey}_${itemToAdd.specialInstructions || ''}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.itemKey === itemKey);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + (itemToAdd.quantity || 1),
          totalPrice:
            Math.round(
              (next[existingIndex].unitPrice *
                (next[existingIndex].quantity + (itemToAdd.quantity || 1))) *
                100
            ) / 100,
        };
        return next;
      } else {
        return [...prev, { ...itemToAdd, itemKey }];
      }
    });

    setIsCartOpen(true);
    return true;
  };

  const updateQuantity = (itemKey, delta) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.itemKey === itemKey) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: Math.round(item.unitPrice * newQty * 100) / 100,
            };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeItem = (itemKey) => {
    setItems((prev) => prev.filter((i) => i.itemKey !== itemKey));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  const deliveryFee =
    orderType === 'delivery' ? (deliverySettings.deliveryFee || 0) : 0;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (roundedSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, roundedSubtotal);
    discount = Math.round(discount * 100) / 100;
  }

  const taxableAmount = Math.max(0, roundedSubtotal - discount);
  const tax =
    deliverySettings.taxRate > 0
      ? Math.round(((taxableAmount * deliverySettings.taxRate) / 100) * 100) / 100
      : 0;

  const total = Math.round((taxableAmount + deliveryFee + tax) * 100) / 100;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Apply Coupon via Backend Validation
  const applyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return false;
    }
    if (!restaurantSlug) {
      setCouponError('No active restaurant found for cart');
      return false;
    }

    try {
      setCouponError('');
      const res = await api.post(`/public/restaurant/${restaurantSlug}/validate-coupon`, {
        code,
        subtotal: roundedSubtotal,
      });

      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponCode(res.coupon.code);
        return true;
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Sync cart item availability against live restaurant menu data
  const syncItemAvailability = (categoriesOrItems) => {
    if (!categoriesOrItems || !Array.isArray(categoriesOrItems)) return;

    const allLiveItems = [];
    categoriesOrItems.forEach((c) => {
      if (c.items && Array.isArray(c.items)) {
        allLiveItems.push(...c.items);
      } else {
        allLiveItems.push(c);
      }
    });

    if (allLiveItems.length === 0) return;

    setItems((prev) => {
      let changed = false;
      const next = prev.map((cartItem) => {
        const liveMatch = allLiveItems.find(
          (li) => String(li._id) === String(cartItem.menuItemId)
        );
        if (liveMatch) {
          const isCurrentlyUnavailable = liveMatch.isAvailable === false;
          if (cartItem.isUnavailable !== isCurrentlyUnavailable) {
            changed = true;
            return {
              ...cartItem,
              isUnavailable: isCurrentlyUnavailable,
              unavailableReason: isCurrentlyUnavailable
                ? `"${cartItem.name}" is now sold out at the restaurant.`
                : '',
            };
          }
        }
        return cartItem;
      });
      return changed ? next : prev;
    });
  };

  const removeUnavailableItems = () => {
    setItems((prev) => prev.filter((i) => !i.isUnavailable));
  };

  const hasUnavailableItems = items.some((i) => i.isUnavailable);

  return (
    <CartContext.Provider
      value={{
        restaurantSlug,
        restaurantName,
        currencySymbol,
        deliverySettings,
        setDeliverySettings,
        initRestaurant,
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        orderType,
        setOrderType,
        subtotal: roundedSubtotal,
        deliveryFee,
        discount,
        tax,
        total,
        totalCount,
        couponCode,
        setCouponCode,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        syncItemAvailability,
        removeUnavailableItems,
        hasUnavailableItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

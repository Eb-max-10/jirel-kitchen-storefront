'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={closeCart}
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream-dark">
              <h2 className="font-heading text-xl font-semibold">
                Your Cart ({items.length})
              </h2>
              <button
                onClick={closeCart}
                className="p-1 text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-warm-gray text-sm">Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-sage hover:text-sage-light text-sm font-medium transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? 'default'}`}
                      className="flex gap-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover bg-[#F5F2EB] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-charcoal truncate">
                          {item.name}
                        </h3>
                        {item.variantName && (
                          <p className="text-xs text-warm-gray mt-0.5">
                            {item.variantName}
                          </p>
                        )}
                        <p className="font-semibold text-sm mt-1">
                          {formatPrice(item.price)}
                        </p>
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            className="w-7 h-7 rounded-full border border-cream-dark flex items-center justify-center hover:bg-cream transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            className="w-7 h-7 rounded-full border border-cream-dark flex items-center justify-center hover:bg-cream transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              removeItem(item.productId, item.variantId)
                            }
                            className="ml-auto text-warm-gray hover:text-sale-red transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Form (toggles in) */}
            <AnimatePresence>
              {showCheckoutForm && items.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-cream-dark"
                >
                  <div className="p-6 space-y-3">
                    <input
                      placeholder="Full Name"
                      name="customer_name"
                      className="w-full border border-cream-dark rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
                      required
                    />
                    <input
                      placeholder="Email Address"
                      name="email"
                      type="email"
                      className="w-full border border-cream-dark rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
                      required
                    />
                    <input
                      placeholder="WhatsApp Number"
                      name="customer_phone"
                      type="tel"
                      className="w-full border border-cream-dark rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
                      required
                    />
                    <textarea
                      placeholder="Delivery Address"
                      name="shipping_address"
                      rows={2}
                      className="w-full border border-cream-dark rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors resize-none"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sticky Bottom Bar */}
            {items.length > 0 && (
              <div className="p-6 border-t border-cream-dark bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-warm-gray text-sm">Subtotal</span>
                  <span className="font-semibold text-lg">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {!showCheckoutForm ? (
                  <button
                    onClick={() => setShowCheckoutForm(true)}
                    className="w-full bg-sage hover:bg-sage-light text-white py-3.5 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      alert(
                        `Payment of ${formatPrice(subtotal)} will be processed via Paystack in Phase 2.`
                      );
                    }}
                    className="w-full bg-charcoal hover:bg-charcoal/90 text-white py-3.5 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Pay {formatPrice(subtotal)}
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

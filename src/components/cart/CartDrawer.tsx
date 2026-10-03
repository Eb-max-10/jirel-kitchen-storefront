'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface CustomerFormData {
  customer_name: string;
  email: string;
  customer_phone: string;
  shipping_address: string;
}

interface FormErrors {
  customer_name?: string;
  email?: string;
  customer_phone?: string;
  shipping_address?: string;
}

function generateTransactionReference(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `JK_${timestamp}_${randomSuffix}`;
}

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_name: '',
    email: '',
    customer_phone: '',
    shipping_address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  const isSimulationMode = !paystackKey || paystackKey.includes('placeholder');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = 'Please enter your full name (at least 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanPhone = formData.customer_phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      newErrors.customer_phone = 'Please enter a valid phone number (at least 7 digits)';
    }

    if (!formData.shipping_address.trim() || formData.shipping_address.trim().length < 5) {
      newErrors.shipping_address = 'Please enter your delivery address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const verifyAndRedirect = async (reference: string) => {
    setStatusMessage('Verifying payment confirmation...');
    const orderData = {
      customer_name: formData.customer_name.trim(),
      email: formData.email.trim(),
      customer_phone: formData.customer_phone.trim(),
      shipping_address: formData.shipping_address.trim(),
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        variantName: item.variantName,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total_price: subtotal,
    };

    try {
      const response = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, orderData }),
      });

      const data = await response.json();

      if (data.success) {
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(`jk_order_${reference}`, JSON.stringify(data.order));
          }
        } catch (e) {
          console.warn('Session storage write error:', e);
        }

        clearCart();
        closeCart();
        setIsProcessing(false);
        setStatusMessage(null);
        router.push(`/order-confirmation?reference=${encodeURIComponent(reference)}`);
      } else {
        setErrorMessage(data.error || data.message || 'Payment verification failed. Please try again.');
        setIsProcessing(false);
        setStatusMessage(null);
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      setErrorMessage('Network error during verification. Please contact support.');
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!validate()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    // Subtotal in Naira converted to integer Kobo
    const amountInKobo = Math.round(subtotal * 100);
    const reference = generateTransactionReference();

    if (isSimulationMode) {
      setStatusMessage('Simulating Paystack payment gateway...');
      setTimeout(async () => {
        await verifyAndRedirect(reference);
      }, 800);
      return;
    }

    try {
      setStatusMessage('Initializing Paystack popup...');
      const { default: PaystackPop } = await import('@paystack/inline-js');
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: paystackKey,
        email: formData.email.trim(),
        amount: amountInKobo,
        currency: 'NGN',
        reference: reference,
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: formData.customer_name.trim(),
            },
            {
              display_name: 'Customer Phone',
              variable_name: 'customer_phone',
              value: formData.customer_phone.trim(),
            },
            {
              display_name: 'Shipping Address',
              variable_name: 'shipping_address',
              value: formData.shipping_address.trim(),
            },
          ],
        },
        onSuccess: async (transaction: { reference: string }) => {
          await verifyAndRedirect(transaction.reference || reference);
        },
        onCancel: () => {
          setIsProcessing(false);
          setStatusMessage(null);
        },
      });
    } catch (err) {
      console.warn('Paystack inline-js failed to load, falling back to simulated mode:', err);
      setStatusMessage('Paystack inline unavailable, executing simulated checkout...');
      setTimeout(async () => {
        await verifyAndRedirect(reference);
      }, 600);
    }
  };

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
            onClick={() => !isProcessing && closeCart()}
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream-dark">
              <div className="flex items-center gap-3">
                {showCheckoutForm && !isProcessing && (
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="p-1 -ml-1 text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                    aria-label="Back to cart items"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="font-heading text-xl font-semibold">
                  {showCheckoutForm ? 'Customer & Delivery Info' : `Your Cart (${items.length})`}
                </h2>
              </div>
              <button
                onClick={() => !isProcessing && closeCart()}
                disabled={isProcessing}
                className="p-1 text-warm-gray hover:text-charcoal transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <p className="text-warm-gray text-sm">Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-sage hover:text-sage-light text-sm font-medium transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : !showCheckoutForm ? (
                /* Cart Items List */
                <div className="space-y-5">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? 'default'}`}
                      className="flex gap-4"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover bg-[#F5F2EB] flex-shrink-0"
                        unoptimized
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
              ) : (
                /* Checkout Form Inputs */
                <div className="space-y-4">
                  {/* Order Summary Mini Banner */}
                  <div className="p-3 bg-cream/60 rounded-lg border border-cream-dark text-xs flex justify-between items-center text-charcoal">
                    <span>
                      Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-sale-red rounded-lg text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">
                      Full Name *
                    </label>
                    <input
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Amara Obi"
                      disabled={isProcessing}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.customer_name
                          ? 'border-sale-red focus:ring-sale-red/20 focus:border-sale-red'
                          : 'border-cream-dark focus:ring-sage/30 focus:border-sage'
                      }`}
                      required
                    />
                    {errors.customer_name && (
                      <p className="text-xs text-sale-red mt-1">{errors.customer_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. amara@example.com"
                      disabled={isProcessing}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.email
                          ? 'border-sale-red focus:ring-sale-red/20 focus:border-sale-red'
                          : 'border-cream-dark focus:ring-sage/30 focus:border-sage'
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-sale-red mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      name="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 08012345678"
                      disabled={isProcessing}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.customer_phone
                          ? 'border-sale-red focus:ring-sale-red/20 focus:border-sale-red'
                          : 'border-cream-dark focus:ring-sage/30 focus:border-sage'
                      }`}
                      required
                    />
                    {errors.customer_phone && (
                      <p className="text-xs text-sale-red mt-1">{errors.customer_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      name="shipping_address"
                      rows={2}
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                      disabled={isProcessing}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                        errors.shipping_address
                          ? 'border-sale-red focus:ring-sale-red/20 focus:border-sale-red'
                          : 'border-cream-dark focus:ring-sage/30 focus:border-sage'
                      }`}
                      required
                    />
                    {errors.shipping_address && (
                      <p className="text-xs text-sale-red mt-1">{errors.shipping_address}</p>
                    )}
                  </div>

                  {/* Simulation Mode Indicator */}
                  {isSimulationMode && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-600" />
                      <span>
                        Test Mode Active — Simulated Paystack checkout flow without live charges.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

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
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-charcoal hover:bg-charcoal/90 text-white py-3.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{statusMessage || 'Processing...'}</span>
                      </>
                    ) : (
                      <span>Pay {formatPrice(subtotal)}</span>
                    )}
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

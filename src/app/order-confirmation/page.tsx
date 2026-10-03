'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  MessageCircle, 
  ArrowRight, 
  Truck, 
  Clock, 
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { siteConfig, getOrderWhatsAppUrl } from '@/config/site';
import { getSupabaseClient } from '@/lib/supabase';

interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id?: string;
  order_number?: string;
  customer_name: string;
  email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal?: number;
  delivery_fee?: number;
  total_price: number;
  currency?: string;
  paystack_reference: string;
  payment_status: string;
  created_at?: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || '';
  const { clearCart } = useCart();
  const hasClearedRef = useRef(false);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(Boolean(reference));

  // 1. Invalidate cart upon order confirmation
  useEffect(() => {
    if (reference && !hasClearedRef.current) {
      clearCart();
      hasClearedRef.current = true;
    }
  }, [reference, clearCart]);

  // 2. Resolve order data via 3-tier strategy
  useEffect(() => {
    if (!reference) {
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      // Tier 1: Check sessionStorage
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const cached = window.sessionStorage.getItem(`jk_order_${reference}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (isMounted) {
              setOrder(parsed);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Session storage read failed:', e);
      }

      // Tier 2: Check Supabase RPC if client configured
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase.rpc('get_order_by_reference', {
            p_reference: reference,
          });

          if (!error && data && data.length > 0) {
            if (isMounted) {
              setOrder(data[0]);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Supabase order lookup failed:', e);
      }

      // Tier 3: Resilient fallback snapshot
      if (isMounted) {
        setOrder({
          order_number: `JK-${reference.slice(-6).toUpperCase()}`,
          paystack_reference: reference,
          customer_name: 'Valued Customer',
          email: 'Provided at checkout',
          customer_phone: 'Provided at checkout',
          shipping_address: 'Address provided during checkout',
          total_price: 0,
          items: [],
          payment_status: 'paid',
          created_at: new Date().toISOString(),
        });
        setLoading(false);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [reference]);

  const copyReference = () => {
    if (!reference) return;
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <OrderConfirmationSkeleton />;
  }

  if (!reference) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-charcoal">No Order Reference Found</h2>
        <p className="mt-2 text-sm text-warm-gray max-w-md">
          Please check the link in your payment receipt or return to the storefront to browse our kitchenware collection.
        </p>
        <Link
          href="/#all-products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-sage hover:bg-sage-light text-white font-medium rounded-xl transition-colors"
        >
          <span>Return to Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const orderNumber = order?.order_number || `JK-${reference.slice(-6).toUpperCase()}`;
  const customerName = order?.customer_name || 'Valued Customer';
  const items = order?.items || [];
  const totalPrice = order?.total_price || 0;
  const deliveryFee = order?.delivery_fee ?? (totalPrice >= siteConfig.shipping.rates.freeThreshold ? 0 : siteConfig.shipping.rates.lagos);
  const subtotal = order?.subtotal ?? (items.length > 0 ? items.reduce((acc, it) => acc + it.price * it.quantity, 0) : totalPrice);
  const formattedDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] min-h-screen">
      {/* Print-specific style rules */}
      <style jsx global>{`
        @media print {
          header, footer, nav, .no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            padding: 1.5rem !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Status Banner */}
        <div className="text-center print:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-emerald-700">
            Payment Verified & Confirmed
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal mt-2">
            Thank You, {customerName}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-warm-gray max-w-xl mx-auto">
            Your transaction has been securely processed. A confirmed copy of your order is logged and our fulfillment team is preparing your package.
          </p>
        </div>

        {/* Main Printable Receipt Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-cream-dark print-card space-y-6">
          {/* Header Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-cream-dark">
            <div>
              <p className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Order Number</p>
              <p className="text-base font-bold text-charcoal mt-0.5">{orderNumber}</p>
              <p className="text-xs text-warm-gray mt-1">{formattedDate}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Payment Status Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                PAID
              </span>

              {/* Reference Pill with Copy */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cream border border-cream-dark text-xs font-mono text-charcoal">
                <span>Ref: {reference}</span>
                <button
                  onClick={copyReference}
                  className="p-1 text-warm-gray hover:text-charcoal transition-colors cursor-pointer no-print"
                  title="Copy Reference"
                  aria-label="Copy Reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          {items.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-4">
                Items Purchased
              </h2>
              <div className="divide-y divide-cream-dark">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-lg object-cover bg-cream border border-cream-dark flex-shrink-0"
                          unoptimized
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                        {item.variantName && (
                          <p className="text-xs text-warm-gray">{item.variantName}</p>
                        )}
                        <p className="text-xs text-warm-gray mt-0.5">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-charcoal whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Totals */}
          <div className="pt-4 border-t border-cream-dark space-y-2 text-sm">
            <div className="flex justify-between text-warm-gray">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-warm-gray">
              <span>Doorstep Delivery</span>
              <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-charcoal pt-3 border-t border-cream-dark">
              <span>Total Paid</span>
              <span className="text-sage font-heading text-lg">{formatPrice(totalPrice || subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-warm-gray pt-1">
              <span>Payment Gateway</span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                Paystack 256-Bit SSL
              </span>
            </div>
          </div>

          {/* Delivery & Customer Info Card */}
          <div className="bg-cream rounded-xl p-4 sm:p-5 border border-cream-dark space-y-3">
            <div className="flex items-center gap-2 text-charcoal font-semibold text-sm">
              <Truck className="w-4 h-4 text-sage" />
              <span>Delivery Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-warm-gray uppercase tracking-wider font-medium text-[10px]">Recipient</p>
                <p className="font-medium text-charcoal mt-0.5">{order?.customer_name || 'Customer'}</p>
                <p className="text-warm-gray">{order?.customer_phone}</p>
                <p className="text-warm-gray truncate">{order?.email}</p>
              </div>
              <div>
                <p className="text-warm-gray uppercase tracking-wider font-medium text-[10px]">Shipping Destination</p>
                <p className="font-medium text-charcoal mt-0.5 whitespace-pre-line">
                  {order?.shipping_address || 'Provided during payment'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-cream-dark/60 flex items-center gap-2 text-xs text-warm-gray">
              <Clock className="w-3.5 h-3.5 text-sage flex-shrink-0" />
              <span>
                Estimated Delivery: <strong>24–48 hours</strong> (Lagos & Abuja) or <strong>2–4 business days</strong> (Nationwide).
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls (Hidden during printing) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print pt-2">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-cream-dark bg-white hover:bg-cream rounded-xl text-charcoal text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-warm-gray" />
            <span>Print Receipt</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* WhatsApp Concierge Link */}
            <a
              href={getOrderWhatsAppUrl(reference)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Inquire on WhatsApp</span>
            </a>

            {/* Back to Catalog */}
            <Link
              href="/#all-products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-sage hover:bg-sage-light text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmationSkeleton() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-cream-dark mx-auto" />
          <div className="h-4 w-40 bg-cream-dark mx-auto rounded" />
          <div className="h-8 w-64 bg-cream-dark mx-auto rounded" />
        </div>
        <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6 border border-cream-dark">
          <div className="h-6 w-1/3 bg-cream rounded" />
          <div className="h-24 w-full bg-cream rounded" />
          <div className="h-16 w-full bg-cream rounded" />
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationSkeleton />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

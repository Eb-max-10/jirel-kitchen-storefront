/**
 * Jirel Kitchen - Centralized Storefront & Business Configuration
 * 
 * Single source of truth for storefront metadata, customer concierge channels,
 * fulfillment logistics, delivery rates, and payment gateway keys.
 */

export interface ShippingRates {
  lagos: number;
  abujaAndPH: number;
  nationwide: number;
  freeThreshold: number;
}

export interface DeliveryEstimates {
  lagosAndAbuja: string;
  nationwide: string;
}

export interface SiteContact {
  whatsappNumber: string;
  defaultWhatsAppMessage: string;
  supportEmail: string;
  location: string;
  workingHours: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  url: string;
  currency: {
    code: string;
    symbol: string;
  };
  contact: SiteContact;
  shipping: {
    rates: ShippingRates;
    estimates: DeliveryEstimates;
  };
  paystack: {
    publicKey: string;
  };
}

export const siteConfig: SiteConfig = {
  name: 'Jirel Kitchen',
  shortName: 'Jirel',
  description:
    'Premium culinary cookware, precision knives, and handcrafted kitchenware delivered across Nigeria.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  currency: {
    code: 'NGN',
    symbol: '₦',
  },

  contact: {
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '2348000000000',
    defaultWhatsAppMessage:
      'Hi Jirel Kitchen, I have an inquiry regarding your cookware collection.',
    supportEmail:
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@jirelkitchen.com',
    location: 'Victoria Island, Lagos, Nigeria',
    workingHours: 'Mon – Sat: 8:00 AM – 7:00 PM WAT',
  },

  shipping: {
    rates: {
      lagos: 2500,
      abujaAndPH: 4000,
      nationwide: 5500,
      freeThreshold: 80000,
    },
    estimates: {
      lagosAndAbuja: '24–48 hours',
      nationwide: '2–4 business days',
    },
  },

  paystack: {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  },
};

/**
 * Generates a properly encoded WhatsApp chat link for customer inquiries.
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const phone = siteConfig.contact.whatsappNumber.replace(/[^0-9]/g, '');
  const message = customMessage || siteConfig.contact.defaultWhatsAppMessage;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an inquiry WhatsApp link pre-filled with an order reference.
 */
export function getOrderWhatsAppUrl(reference: string): string {
  const message = `Hi Jirel Kitchen, I'm inquiring about my order ${reference}.`;
  return getWhatsAppUrl(message);
}

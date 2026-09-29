import { Truck, ShieldCheck, Lock, MessageCircle } from 'lucide-react';

const trustItems = [
  {
    icon: Truck,
    title: 'Fast Nationwide Delivery',
    subtitle: '24–48 hrs in Lagos & Abuja',
  },
  {
    icon: ShieldCheck,
    title: 'Premium Food-Grade Quality',
    subtitle: 'Non-toxic, PFOA-free cookware',
  },
  {
    icon: Lock,
    title: 'Secure Paystack Checkout',
    subtitle: 'Instant card & bank transfer verification',
  },
  {
    icon: MessageCircle,
    title: 'Direct WhatsApp Support',
    subtitle: 'Assistance from real people',
  },
];

export default function TrustBar() {
  return (
    <section className="bg-[#F0EBE3] border-y border-[#E6DFD5] py-5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E0D7CB]/60">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`flex items-center gap-3.5 ${
                index > 0 ? 'sm:pl-6 pt-4 sm:pt-0' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sage flex-shrink-0 shadow-xs">
                <Icon className="w-5 h-5 text-sage" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-charcoal leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-warm-gray mt-0.5 leading-tight">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

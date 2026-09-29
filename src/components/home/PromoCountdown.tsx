'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useCountdown } from '@/hooks/useCountdown';
import type { Promo } from '@/data/promo';

export default function PromoCountdown({ promo }: { promo: Promo }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(promo.endDate);

  if (isExpired) return null;

  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Seconds' },
  ];

  return (
    <section
      className="py-16"
      style={{ backgroundColor: promo.bgColor }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
          {promo.title}
        </h2>
        <p className="text-white/70 mb-10 text-lg">
          {promo.subtitle}
        </p>

        <div className="flex justify-center gap-3 sm:gap-5">
          {units.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={value}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl sm:text-3xl font-bold"
                  >
                    {value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[10px] sm:text-xs mt-2 text-white/60 uppercase tracking-[0.15em]">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-white/90 font-semibold text-lg">
          {promo.discountText}
        </p>
      </div>
    </section>
  );
}

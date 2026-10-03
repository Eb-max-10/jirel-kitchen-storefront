'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const faqs = [
  {
    question: 'When will my cookware order be dispatched?',
    answer:
      'Orders placed before 1:00 PM (WAT) on business days are dispatched same-day. Delivery takes 24–48 hours for Lagos and Abuja addresses, and 2–4 business days for all other states across Nigeria.',
  },
  {
    question: 'What are the delivery rates across Nigeria?',
    answer:
      'We offer flat-rate doorstep shipping: ₦2,500 within Lagos state, ₦4,000 for Abuja and Port Harcourt, and ₦5,500 for regional deliveries nationwide. Orders over ₦80,000 qualify for free shipping.',
  },
  {
    question: 'How is the cookware packaged to avoid damage?',
    answer:
      'Every pot, lid, and knife set is encased in custom molded shock-absorbent high-density padding and corrugated heavy-duty exterior boxes to ensure zero transit damage.',
  },
  {
    question: 'What is your return & exchange policy?',
    answer:
      'We provide a 7-day hassle-free inspection guarantee. If your cookware arrives damaged, defective, or with missing pieces, we replace it immediately at zero extra cost.',
  },
];

export default function ContactSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 bg-[#FAF7F2] border-t border-cream-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-sage mb-2">
            We are here for you
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal">
            Delivery FAQ & Support Hub
          </h2>
          <p className="mt-3 text-sm sm:text-base text-warm-gray">
            Clear answers on shipping, care instructions, and instant customer service from our Lagos team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Delivery FAQ Accordion */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-cream-dark/60 space-y-4">
            <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
              Frequently Asked Questions
            </h3>

            <div className="divide-y divide-cream-dark/80">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left gap-4 font-medium text-sm sm:text-base text-charcoal hover:text-sage transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-warm-gray transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? 'rotate-180 text-sage' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-xs sm:text-sm text-warm-gray leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Direct Contact Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-cream-dark/60 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase mb-3">
                Live Support
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                Need Help With an Order?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-warm-gray leading-relaxed">
                Connect directly with our dedicated kitchen concierge on WhatsApp for quick stock checks, custom invoice requests, or delivery updates.
              </p>

              {/* WhatsApp CTA Button */}
              <a
                href="https://wa.me/2348000000000?text=Hi%20Jirel%20Hitchen%20Hub,%20I%20have%20an%20inquiry%20regarding%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 shadow-sm shadow-[#25D366]/20 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Contact Details List */}
              <div className="mt-8 space-y-4 pt-6 border-t border-cream-dark">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-sage flex-shrink-0">
                    <Mail className="w-4 h-4 text-sage" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-warm-gray uppercase tracking-wider">
                      Email Inquiries
                    </p>
                    <a
                      href="mailto:support@jirelkitchen.com"
                      className="text-xs sm:text-sm font-medium text-charcoal hover:text-sage transition-colors"
                    >
                      support@jirelkitchen.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-sage flex-shrink-0">
                    <MapPin className="w-4 h-4 text-sage" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-warm-gray uppercase tracking-wider">
                      Fulfillment Hub
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-charcoal">
                      Victoria Island, Lagos, Nigeria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-sage flex-shrink-0">
                    <Clock className="w-4 h-4 text-sage" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-warm-gray uppercase tracking-wider">
                      Working Hours
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-charcoal">
                      Mon – Sat: 8:00 AM – 7:00 PM WAT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-warm-gray/70 text-center">
              All transactions are secured & verified with 256-bit encryption.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

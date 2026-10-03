import Link from 'next/link';

const shopLinks = [
  { name: 'Pots & Pans', href: '#' },
  { name: 'Knives', href: '#' },
  { name: 'Tableware', href: '#' },
  { name: 'Utensils', href: '#' },
  { name: 'Appliances', href: '#' },
];

const companyLinks = [
  { name: 'About Us', href: '#' },
  { name: 'Contact', href: '#contact' },
  { name: 'Shipping & Delivery', href: '#' },
  { name: 'Returns Policy', href: '#' },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="font-heading text-2xl font-bold">
              Jirel Hitchen Hub
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              Premium kitchenware for the modern kitchen. Quality cookware,
              knives, and essentials delivered across Nigeria.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Jirel Hitchen Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

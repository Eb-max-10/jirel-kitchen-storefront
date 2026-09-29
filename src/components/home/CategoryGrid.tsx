import type { Category } from '@/data/categories';

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="font-heading text-3xl text-center mb-10 font-semibold">
        Shop By Category
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.slug}`}
            className="flex flex-col items-center group"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#F5F2EB] group-hover:ring-2 ring-sage ring-offset-2 transition-all duration-300">
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-3 text-xs sm:text-sm text-warm-gray group-hover:text-charcoal transition-colors text-center">
              {cat.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

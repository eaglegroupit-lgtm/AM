import { forwardRef } from "react";
import { motion } from "framer-motion";
import { CategoryIcon } from "../../lib/categoryIcons";
import ItemCard from "./ItemCard";

const CategorySection = forwardRef(function CategorySection({ category, items }, ref) {
  if (!items || items.length === 0) return null;

  return (
    <section ref={ref} id={`category-${category.id}`} className="scroll-mt-32 mt-12">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-2.5 px-1 mb-4"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full gold-border bg-surface/60 text-gold-light">
          <CategoryIcon icon={category.icon} size={17} />
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-cream">{category.name}</h2>
        <span className="text-xs text-cream/40">({items.length})</span>
        <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent ml-2" />
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, i) => (
          <ItemCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
});

export default CategorySection;

import { motion } from "framer-motion";
import ItemCard from "./ItemCard";

export default function FeaturedRow({ title, icon, items, onItemClick }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-10">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-2 px-1 mb-4"
      >
        {icon}
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-cream">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent ml-2" />
      </motion.div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1 snap-x snap-mandatory">
        {items.map((item, i) => (
          <div key={item.id} className="min-w-[220px] sm:min-w-[250px] snap-start">
            <ItemCard item={item} index={i} onClick={onItemClick} />
          </div>
        ))}
      </div>
    </section>
  );
}

import { motion } from "framer-motion";

export default function StatCard({ label, value, icon: Icon, tone = "gold" }) {
  const tones = {
    gold: "text-gold-light",
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-sky-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card gold-border rounded-2xl p-3.5 sm:p-5 flex items-center gap-2.5 sm:gap-4"
    >
      <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-black/5 shrink-0 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold font-display text-cream leading-tight">{value}</p>
        <p className="text-[11px] sm:text-xs text-cream/50 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

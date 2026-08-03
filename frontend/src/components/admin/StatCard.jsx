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
      className="glass-card gold-border rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-cream">{value}</p>
        <p className="text-xs text-cream/50">{label}</p>
      </div>
    </motion.div>
  );
}

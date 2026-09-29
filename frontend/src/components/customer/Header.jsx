import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { branchAddresses } from "../../lib/translations";
import { LuMapPin, LuExternalLink, LuSparkles } from "react-icons/lu";

export default function Header({ settings }) {
  const { language } = useLanguage();
  const name = settings?.restaurant_name || "Amutha Surabi Restaurant";
  const tagline = settings?.tagline || "Experience Authentic Taste";
  const branches = branchAddresses[language] || branchAddresses.en;

  return (
    <header className="relative overflow-hidden pt-1 pb-3 sm:pb-4 bg-gradient-to-b from-[#220B04] via-[#2F1005] to-[#FAF5EB] text-[#2B2013]">
      {/* Dynamic Ambient Background with Toran & Kolam Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep warm rich background gradient with golden spotlight */}
        <div
          className="absolute inset-0 opacity-95"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(184, 134, 11, 0.38) 0%, rgba(139, 30, 19, 0.45) 45%, rgba(34, 11, 4, 0.98) 90%)",
          }}
        />

        {/* Traditional Festive Toran (Mango Leaves & Marigolds Garland) - Sleek & Compact */}
        <svg
          className="absolute top-0 inset-x-0 w-full h-4 sm:h-5 opacity-85"
          preserveAspectRatio="none"
          viewBox="0 0 1200 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 H1200 V8 Q1150 20 1100 8 Q1050 20 1000 8 Q950 20 900 8 Q850 20 800 8 Q750 20 700 8 Q650 20 600 8 Q550 20 500 8 Q450 20 400 8 Q350 20 300 8 Q250 20 200 8 Q150 20 100 8 Q50 20 0 8 Z"
            fill="#1E5E3A"
          />
          <path
            d="M0 0 H1200 V4 Q1150 14 1100 4 Q1050 14 1000 4 Q950 14 900 4 Q850 14 800 4 Q750 14 700 4 Q650 14 600 4 Q550 14 500 4 Q450 14 400 4 Q350 14 300 4 Q250 14 200 4 Q150 14 100 4 Q50 14 0 4 Z"
            fill="#D4AF37"
          />
          {[50, 150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150].map((x, idx) => (
            <circle key={idx} cx={x} cy={16} r={3.5} fill="#F77F00" />
          ))}
        </svg>

        {/* Subtle Kolam / Mandala Watermarks Left & Right */}
        <div className="absolute top-2 -left-12 sm:left-2 w-36 sm:w-44 h-36 sm:h-44 opacity-15 pointer-events-none animate-float-slow">
          <svg viewBox="0 0 200 200" fill="none" stroke="#F5CB5C" strokeWidth="1.2">
            <circle cx="100" cy="100" r="90" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="70" />
            <circle cx="100" cy="100" r="48" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <path key={deg} d="M100 10 Q108 55 100 70 Q92 55 100 10" transform={`rotate(${deg} 100 100)`} fill="rgba(245, 203, 92, 0.08)" />
            ))}
          </svg>
        </div>

        <div className="absolute top-2 -right-12 sm:right-2 w-36 sm:w-44 h-36 sm:h-44 opacity-15 pointer-events-none animate-float-slow" style={{ animationDelay: "-3s" }}>
          <svg viewBox="0 0 200 200" fill="none" stroke="#F5CB5C" strokeWidth="1.2">
            <circle cx="100" cy="100" r="90" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="70" />
            <circle cx="100" cy="100" r="48" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <path key={deg} d="M100 10 Q108 55 100 70 Q92 55 100 10" transform={`rotate(${deg} 100 100)`} fill="rgba(245, 203, 92, 0.08)" />
            ))}
          </svg>
        </div>
      </div>

      {/* Main Decorated Content - Perfectly Proportioned & Reduced Height */}
      <div className="relative z-10 px-3 sm:px-4 pt-3 pb-1 text-center max-w-4xl mx-auto">
        {/* Top Auspicious Vegetarian & Heritage Pill Badge - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1A0A05]/80 border border-[#D4AF37]/50 shadow-md backdrop-blur-md text-[#FDE047] text-[10px] sm:text-[11px] font-semibold tracking-wide mb-1.5"
        >
          {/* Authentic Indian Veg Symbol (Green Dot inside Square) */}
          <span className="flex h-3 w-3 items-center justify-center rounded-xs border border-emerald-400 bg-white/95 p-0.5 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </span>
          <span className="text-[#F3E8D0] font-bold">
            {language === "ta" ? "100% தூய சைவம்" : "100% PURE VEGETARIAN"}
          </span>
          <span className="text-[#D4AF37]">•</span>
          <span className="text-[#EEDB91]">
            {language === "ta" ? "கோவை பாரம்பரிய சுவை" : "Coimbatore Heritage"}
          </span>
          <LuSparkles className="text-[#F5CB5C] text-[10px]" />
        </motion.div>

        {/* Unified Centerpiece: Diya Crest + Welcome + Main Title */}
        <div className="relative py-2 px-3 sm:px-5 rounded-2xl bg-black/30 backdrop-blur-sm border border-[#D4AF37]/30 shadow-xl max-w-2xl mx-auto">
          {/* Subtle Corner Ornaments */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/80 rounded-tl-md" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/80 rounded-tr-md" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/80 rounded-bl-md" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/80 rounded-br-md" />

          {/* Diya / Logo Crest - Compact & Sleek */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#D4AF37]/70 bg-gradient-to-br from-[#4A150D] to-[#170503] shadow-md">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={name}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                />
              ) : (
                <div className="animate-diya">
                  <svg className="w-5 h-5 text-[#FFD166]" viewBox="0 0 64 64" fill="none">
                    <path
                      d="M32 6 C32 6, 22 20, 22 28 C22 34 26.5 38 32 38 C37.5 38 42 34 42 28 C42 20 32 6 32 6 Z"
                      fill="#FFB703"
                    />
                    <path
                      d="M32 14 C32 14, 26 23, 26 29 C26 33 28.5 36 32 36 C35.5 36 38 33 38 29 C38 23 32 14 32 14 Z"
                      fill="#FFF3B0"
                    />
                    <path
                      d="M14 36 C14 46, 50 46, 50 36 C50 36, 42 42, 32 42 C22 42, 14 36, 14 36 Z"
                      fill="#D4AF37"
                    />
                    <path d="M22 42 L20 48 L44 48 L42 42 Z" fill="#8B6914" />
                  </svg>
                </div>
              )}
            </div>

            <div className="text-left sm:text-center">
              <span className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#EEDB91] uppercase">
                {language === "ta" ? "அன்புடன் வரவேற்கிறோம் • WELCOME TO" : "WELCOME TO • அன்புடன் வரவேற்கிறோம்"}
              </span>
            </div>
          </div>

          {/* Restaurant Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl md:text-4xl font-black shimmer-text tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          >
            {name}
          </motion.h1>

          {/* Subtitle & Tagline in one compact line */}
          <div className="mt-1 flex items-center justify-center flex-wrap gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-[#FAF5EB]/85 font-medium">
            <span className="text-[#FFD166] font-semibold">
              {language === "ta" ? "ஸ்ரீ அமுத சுரபி உணவகம்" : "Sri Amutha Surabi"}
            </span>
            <span className="text-[#D4AF37]">•</span>
            <span className="italic text-cream-light/90">"{tagline}"</span>
          </div>
        </div>

        {/* Requirement 2: Correct Two Branch Addresses - Sleek, Low-Profile Twin Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto text-left"
        >
          {branches.map((b, idx) => (
            <div
              key={idx}
              className="group flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-[#FFFDF8]/95 backdrop-blur-md border border-[#B8860B]/35 shadow-md hover:border-[#B8860B] hover:shadow-lg transition-all"
            >
              {/* Location Pin Icon */}
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#A6291A] to-[#780000] text-white shadow-xs">
                <LuMapPin size={13} className="text-[#FFD166]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-[#FAF0D7] text-[#8B1E13] border border-[#D4AF37]/40">
                    {b.title}
                  </span>
                  {b.area && (
                    <span className="text-[10px] font-bold text-[#8B6914] truncate">
                      {b.area}
                    </span>
                  )}
                </div>

                <p className="text-[11px] sm:text-xs font-semibold text-[#2B2013] leading-snug">
                  {b.address}
                </p>

                {/* Google Maps link */}
                {b.mapsUrl && (
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#A6291A] hover:text-[#7A150A] group/link transition-colors"
                  >
                    <span className="underline underline-offset-1">
                      {language === "ta" ? "வரைபடம் (Directions)" : "Get Directions"}
                    </span>
                    <LuExternalLink size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </header>
  );
}

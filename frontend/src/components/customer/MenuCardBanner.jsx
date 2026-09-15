import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiZoomIn, FiEye } from "react-icons/fi";
import { GiScrollQuill, GiSparkles } from "react-icons/gi";
import { useLanguage } from "../../context/LanguageContext";

const SESSIONS = [
  {
    id: "breakfast",
    icon: "🌅",
    labelEn: "Morning Breakfast",
    labelTa: "காலை உணவு",
    titleEn: "Morning Breakfast Menu Card",
    titleTa: "காலை உணவு மெனு அட்டை",
    taImg: "/images/menu-cards/breakfast-ta.jpg",
    enImg: "/images/menu-cards/breakfast-en.jpg",
  },
  {
    id: "lunch",
    icon: "☀️",
    labelEn: "Authentic Lunch",
    labelTa: "மதிய உணவு",
    titleEn: "Authentic Lunch Menu Card",
    titleTa: "மதிய உணவு மெனு அட்டை",
    taImg: "/images/menu-cards/lunch-ta.jpg",
    enImg: "/images/menu-cards/lunch-en.jpg",
  },
  {
    id: "dinner",
    icon: "🌙",
    labelEn: "Night Tiffin",
    labelTa: "இரவு டிபன்",
    titleEn: "Night Tiffin Special Card",
    titleTa: "இரவு நேர டிபன் மெனு அட்டை",
    taImg: "/images/menu-cards/dinner-ta.jpg",
    enImg: "/images/menu-cards/dinner-en.jpg",
  },
];

export default function MenuCardBanner({ activeMealFilter = "all", onOpenCard }) {
  const { language } = useLanguage();
  
  // Default session to the active filter if it matches one of the sessions, otherwise default to lunch
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    if (activeMealFilter === "breakfast" || activeMealFilter === "lunch" || activeMealFilter === "dinner") {
      return activeMealFilter;
    }
    return "lunch";
  });

  // Sync with active filter changes if user clicks breakfast/lunch/dinner tab above
  useEffect(() => {
    if (activeMealFilter === "breakfast" || activeMealFilter === "lunch" || activeMealFilter === "dinner") {
      setSelectedSessionId(activeMealFilter);
    }
  }, [activeMealFilter]);

  const activeSession = SESSIONS.find((s) => s.id === selectedSessionId) || SESSIONS[1];

  return (
    <div className="relative my-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2D0D09] via-[#4A1610] to-[#200705] p-4 sm:p-5 text-white shadow-xl border-2 border-[#B8860B]/40">
      {/* Decorative Gold Corner Borders */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#EEDB91]/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#EEDB91]/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#EEDB91]/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#EEDB91]/60 pointer-events-none" />

      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#B8860B]/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-[#A6291A]/30 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left Info Column */}
        <div className="flex-1 text-center md:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EC]/10 border border-[#EEDB91]/40 text-[#EEDB91] text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
              <GiSparkles className="text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
              <span>{language === "ta" ? "அசல் உணவக மெனு அட்டை" : "Original Printed Menu Card"}</span>
            </div>

            {/* Session Selector Chips (Breakfast / Lunch / Dinner) */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-[#B8860B]/30">
              {SESSIONS.map((s) => {
                const isActive = s.id === selectedSessionId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#A6291A] to-[#8B0000] text-white shadow-sm ring-1 ring-[#EEDB91]/60"
                        : "text-[#EEDB91]/70 hover:text-white"
                    }`}
                  >
                    <span>{s.icon} {language === "ta" ? s.labelTa : s.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#FFF8EA] drop-shadow-sm">
            {language === "ta" ? (
              <>
                ஸ்ரீ அமுத சுரபி <span className="text-[#EEDB91]">{activeSession.titleTa}</span>
              </>
            ) : (
              <>
                Sri Amutha Surabhi <span className="text-[#EEDB91]">{activeSession.titleEn}</span>
              </>
            )}
          </h3>

          <p className="text-xs sm:text-sm text-[#E6D4BA] max-w-lg leading-relaxed">
            {language === "ta"
              ? "எங்கள் உணவகத்தின் அசல் அச்சிடப்பட்ட மெனு அட்டையை (தமிழ் & ஆங்கிலம்) பெரிதாக்கி வாசிக்க கிளிக் செய்யவும்."
              : "Explore our authentic restaurant printed menu card with smooth zoom & pan controls."}
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <button
              onClick={() => onOpenCard("ta", selectedSessionId)}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A6291A] to-[#8B0000] hover:from-[#BA3020] hover:to-[#A00000] text-white font-bold text-xs sm:text-sm shadow-lg border border-[#EEDB91]/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <GiScrollQuill size={17} className="text-[#EEDB91] group-hover:rotate-12 transition-transform" />
              <span>{language === "ta" ? "தமிழ் மெனு அட்டை (Zoom)" : "Tamil Menu Card (Zoom)"}</span>
              <FiZoomIn size={15} className="text-[#EEDB91]" />
            </button>

            <button
              onClick={() => onOpenCard("en", selectedSessionId)}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#241712] hover:bg-[#38241D] text-[#EEDB91] hover:text-white font-bold text-xs sm:text-sm shadow-md border border-[#B8860B]/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <FiEye size={16} className="text-[#EEDB91]" />
              <span>English Menu Card (Zoom)</span>
            </button>
          </div>
        </div>

        {/* Right Visual Previews (Side by side / layered realistic cards) */}
        <div className="flex items-center justify-center gap-3 shrink-0">
          {/* Tamil Card Preview */}
          <motion.div
            key={`ta-${selectedSessionId}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            onClick={() => onOpenCard("ta", selectedSessionId)}
            className="group relative cursor-pointer rounded-xl overflow-hidden shadow-2xl border-2 border-[#B8860B]/50 w-24 sm:w-28 bg-[#180E09] transform -rotate-3 transition-all"
            title={language === "ta" ? "தமிழ் மெனுவை பெரிதாக்கு" : "Zoom Tamil Menu"}
          >
            <img
              src={activeSession.taImg}
              alt={`${activeSession.labelEn} Tamil Menu`}
              className="h-32 sm:h-36 w-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-1.5">
              <span className="text-[9px] font-bold bg-[#A6291A]/90 text-white px-1.5 py-0.5 rounded self-start border border-[#EEDB91]/40">
                தமிழ்
              </span>
              <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-[#EEDB91] bg-black/60 backdrop-blur-xs rounded py-0.5">
                <FiZoomIn size={11} />
                <span>Zoom</span>
              </div>
            </div>
          </motion.div>

          {/* English Card Preview */}
          <motion.div
            key={`en-${selectedSessionId}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            onClick={() => onOpenCard("en", selectedSessionId)}
            className="group relative cursor-pointer rounded-xl overflow-hidden shadow-2xl border-2 border-[#B8860B]/50 w-24 sm:w-28 bg-[#180E09] transform rotate-3 transition-all"
            title={language === "ta" ? "ஆங்கில மெனுவை பெரிதாக்கு" : "Zoom English Menu"}
          >
            <img
              src={activeSession.enImg}
              alt={`${activeSession.labelEn} English Menu`}
              className="h-32 sm:h-36 w-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-1.5">
              <span className="text-[9px] font-bold bg-[#8B0000]/90 text-white px-1.5 py-0.5 rounded self-start border border-[#EEDB91]/40">
                English
              </span>
              <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-[#EEDB91] bg-black/60 backdrop-blur-xs rounded py-0.5">
                <FiZoomIn size={11} />
                <span>Zoom</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

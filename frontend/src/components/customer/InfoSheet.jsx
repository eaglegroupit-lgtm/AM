import { AnimatePresence, motion } from "framer-motion";
import { LuX, LuMapPin, LuPhone, LuClock } from "react-icons/lu";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import { branchAddresses } from "../../lib/translations";

export default function InfoSheet({ open, onClose, settings }) {
  const { language } = useLanguage();
  const branches = branchAddresses[language] || branchAddresses.en;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 glass-card gold-border rounded-t-3xl bg-surface p-6 pb-10 max-w-lg mx-auto"
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-cream/20" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold gold-text">
                {settings?.restaurant_name || "Amutha Surabi Restaurant"}
              </h3>
              <button onClick={onClose} className="text-cream/60 hover:text-gold-light">
                <LuX size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-cream/80">
              {branches.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <LuMapPin className="mt-0.5 text-[#A6291A] shrink-0" size={18} />
                  <div>
                    <span className="block text-[11px] font-bold tracking-wider text-[#8B6914] uppercase">
                      {b.title}
                    </span>
                    <span className="text-xs text-[#2B2013]">{b.address}</span>
                  </div>
                </div>
              ))}
              {settings?.phone && (
                <div className="flex items-center gap-3">
                  <LuPhone className="text-gold-light shrink-0" size={18} />
                  <a href={`tel:${settings.phone}`} className="hover:text-gold-light">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings?.opening_hours && (
                <div className="flex items-center gap-3">
                  <LuClock className="text-gold-light shrink-0" size={18} />
                  <span>{settings.opening_hours}</span>
                </div>
              )}
            </div>

            {(settings?.facebook || settings?.instagram || settings?.whatsapp) && (
              <div className="mt-5 flex gap-3">
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full gold-border text-gold-light hover:bg-gold/10"
                  >
                    <FaFacebookF />
                  </a>
                )}
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full gold-border text-gold-light hover:bg-gold/10"
                  >
                    <FaInstagram />
                  </a>
                )}
                {settings.whatsapp && (
                  <a
                    href={settings.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full gold-border text-gold-light hover:bg-gold/10"
                  >
                    <FaWhatsapp />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

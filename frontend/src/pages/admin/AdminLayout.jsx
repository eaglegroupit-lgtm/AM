import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuLayoutDashboard,
  LuUtensilsCrossed,
  LuFolderTree,
  LuQrCode,
  LuSettings,
  LuLogOut,
  LuMenu,
  LuX,
  LuExternalLink,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LuLayoutDashboard, end: true },
  { to: "/admin/items", label: "Menu Items", icon: LuUtensilsCrossed },
  { to: "/admin/categories", label: "Categories", icon: LuFolderTree },
  { to: "/admin/qr", label: "QR Code", icon: LuQrCode },
  { to: "/admin/settings", label: "Settings", icon: LuSettings },
];

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-gold/10 bg-surface/60 backdrop-blur">
        <SidebarContent username={username} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur border-b border-gold/10">
        <span className="font-display gold-text font-bold">Amutha Surabi Admin</span>
        <button onClick={() => setMobileOpen(true)} className="text-cream/70">
          <LuMenu size={22} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface border-r border-gold/10 lg:hidden"
            >
              <div className="flex justify-end p-3">
                <button onClick={() => setMobileOpen(false)} className="text-cream/60">
                  <LuX size={20} />
                </button>
              </div>
              <SidebarContent username={username} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ username, onLogout, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-gold/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full gold-border bg-surface-2">
            <span className="font-display text-lg font-bold gold-text">A</span>
          </div>
          <div>
            <p className="font-display font-semibold text-cream leading-tight">Amutha Surabi</p>
            <p className="text-[11px] text-cream/40">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-gold/20 to-gold/5 text-gold-light gold-border"
                  : "text-cream/60 hover:text-cream hover:bg-black/5"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-cream/50 hover:text-cream hover:bg-black/5 transition-colors"
        >
          <LuExternalLink size={17} />
          View Live Menu
        </a>
      </nav>

      <div className="px-4 py-4 border-t border-gold/10">
        <p className="px-2 text-xs text-cream/40 mb-2">Signed in as {username}</p>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LuLogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

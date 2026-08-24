import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuLock, LuUser, LuEye, LuEyeOff } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("ams");
  const [password, setPassword] = useState("ams");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center px-4 relative overflow-hidden text-[#2B2013]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.18),transparent_50%)]" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm glass-card gold-border rounded-3xl p-8 bg-[#FFFDF8]/95 shadow-[0_12px_40px_rgba(166,41,26,0.12)]"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#B8860B]/40 bg-[#FFF8EA] shadow-md">
          <span className="font-display text-2xl font-black text-[#A6291A]">A</span>
        </div>
        <h1 className="text-center font-display text-2xl font-bold gold-text">Admin Dashboard</h1>
        <p className="text-center text-xs text-[#6B5238] mt-1 mb-7">Amutha Surabi Restaurant</p>

        <label className="block text-xs font-bold text-[#4A3825] mb-1.5">Username</label>
        <div className="relative mb-4">
          <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8860B]" size={16} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full rounded-xl bg-[#FAF6EC] border border-[#B8860B]/30 py-2.5 pl-10 pr-3 text-sm text-[#2B2013] outline-none focus:border-[#A6291A] font-semibold transition-colors"
            placeholder="ams"
          />
        </div>

        <label className="block text-xs font-bold text-[#4A3825] mb-1.5">Password</label>
        <div className="relative mb-6">
          <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8860B]" size={16} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl bg-[#FAF6EC] border border-[#B8860B]/30 py-2.5 pl-10 pr-10 text-sm text-[#2B2013] outline-none focus:border-[#A6291A] font-semibold transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5238] hover:text-[#A6291A]"
          >
            {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-[#A6291A] via-[#B8860B] to-[#D4AF37] hover:from-[#8B0000] hover:to-[#B8860B] py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60 transition-all cursor-pointer"
        >
          {submitting ? "Signing in..." : "Sign In (ams / ams)"}
        </motion.button>

        <p className="mt-6 text-center text-[11px] text-cream/30">
          Authorized personnel only. This panel manages menu items & availability.
        </p>
      </motion.form>
    </div>
  );
}

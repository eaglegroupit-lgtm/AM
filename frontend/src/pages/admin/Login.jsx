import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuLock, LuUser, LuEye, LuEyeOff } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.12),transparent_50%)]" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm glass-card gold-border gold-glow rounded-3xl p-8"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full gold-border bg-surface">
          <span className="font-display text-2xl font-bold gold-text">A</span>
        </div>
        <h1 className="text-center font-display text-2xl font-bold gold-text">Admin Dashboard</h1>
        <p className="text-center text-xs text-cream/50 mt-1 mb-7">Amutha Surabi Restaurant</p>

        <label className="block text-xs font-medium text-cream/60 mb-1.5">Username</label>
        <div className="relative mb-4">
          <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-light/60" size={16} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full rounded-xl bg-surface-2/70 border border-black/10 py-2.5 pl-10 pr-3 text-sm text-cream outline-none focus:border-gold/50 transition-colors"
            placeholder="admin"
          />
        </div>

        <label className="block text-xs font-medium text-cream/60 mb-1.5">Password</label>
        <div className="relative mb-6">
          <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-light/60" size={16} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl bg-surface-2/70 border border-black/10 py-2.5 pl-10 pr-10 text-sm text-cream outline-none focus:border-gold/50 transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold-light"
          >
            {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-gold-light to-gold py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </motion.button>

        <p className="mt-6 text-center text-[11px] text-cream/30">
          Authorized personnel only. This panel manages menu items & availability.
        </p>
      </motion.form>
    </div>
  );
}

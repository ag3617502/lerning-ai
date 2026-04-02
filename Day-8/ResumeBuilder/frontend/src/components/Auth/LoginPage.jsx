// ============================================================
// LoginPage — Register / Login with dark glassmorphism UI
// ============================================================
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage({ onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb orb-1" />
      <div className="login-bg-orb orb-2" />
      <div className="login-bg-orb orb-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">✨</div>
        <h1 className="login-title">AI Resume Builder</h1>
        <p className="login-sub">
          {mode === "login"
            ? "Welcome back! Sign in to access your resumes."
            : "Create your account to get started."}
        </p>

        {/* Tab switch */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="login-submit-btn" type="submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        <p className="login-footer">
          {mode === "login" ? "Don't have an account? " : "Already registered? "}
          <button
            className="login-switch-btn"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: var(--bg-primary); position: relative; overflow: hidden;
        }
        .login-bg-orb {
          position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
        }
        .orb-1 { width: 400px; height: 400px; background: rgba(0,212,255,0.08); top: -100px; left: -100px; }
        .orb-2 { width: 300px; height: 300px; background: rgba(124,58,237,0.1); bottom: -50px; right: -50px; }
        .orb-3 { width: 200px; height: 200px; background: rgba(236,72,153,0.07); top: 50%; left: 50%; transform: translate(-50%,-50%); }
        .login-card {
          background: rgba(13,21,38,0.9); border: 1px solid var(--border-glass);
          border-radius: 24px; padding: 44px 40px; width: 420px; max-width: 90vw;
          backdrop-filter: blur(20px); position: relative; z-index: 1;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
          animation: fadeSlideIn 0.4s ease;
        }
        .login-logo { font-size: 36px; text-align: center; margin-bottom: 12px; }
        .login-title { text-align: center; font-size: 22px; font-weight: 700; color: var(--text-primary); }
        .login-sub { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 6px; margin-bottom: 28px; }
        .login-tabs { display: flex; gap: 4px; background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: 10px; padding: 4px; margin-bottom: 24px; }
        .login-tab {
          flex: 1; padding: 9px; font-size: 13px; font-weight: 600; font-family: inherit;
          background: transparent; border: none; color: var(--text-secondary); border-radius: 7px; cursor: pointer; transition: all 0.2s;
        }
        .login-tab.active { background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); color: #fff; }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .form-input {
          background: var(--bg-glass); border: 1px solid var(--border-glass);
          border-radius: 10px; color: var(--text-primary); font-family: inherit; font-size: 14px;
          padding: 12px 14px; outline: none; transition: border-color 0.2s;
        }
        .form-input:focus { border-color: var(--border-accent); }
        .form-input::placeholder { color: var(--text-muted); }
        .form-error { font-size: 12px; color: #f87171; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); border-radius: 8px; padding: 10px 12px; }
        .login-submit-btn {
          padding: 14px; font-size: 14px; font-weight: 700; font-family: inherit;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          border: none; border-radius: 10px; color: #fff; cursor: pointer; margin-top: 4px;
          transition: all 0.2s; letter-spacing: 0.3px;
        }
        .login-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,212,255,0.25); }
        .login-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-footer { text-align: center; font-size: 12px; color: var(--text-secondary); margin-top: 20px; }
        .login-switch-btn { background: none; border: none; color: var(--accent-cyan); cursor: pointer; font-size: 12px; font-weight: 600; text-decoration: underline; font-family: inherit; }
      `}</style>
    </div>
  );
}

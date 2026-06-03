import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
    animation: 'fadeUp 0.5s ease',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '12px',
    boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 6px',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    margin: 0,
  },
  form: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.07)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
    transition: 'opacity 0.2s, transform 0.15s',
    letterSpacing: '0.3px',
    boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
  },
  error: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#fca5a5',
    fontSize: '13px',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
  },
  link: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...styles.input,
    borderColor: focusedField === field
      ? 'rgba(124,58,237,0.7)'
      : 'rgba(255,255,255,0.12)',
    boxShadow: focusedField === field
      ? '0 0 0 3px rgba(124,58,237,0.2)'
      : 'none',
  });

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        button:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        button:active:not(:disabled) { transform: translateY(0); }
        button:disabled { opacity: 0.55; cursor: not-allowed; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #1e1b3a inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your AI Task Platform account</p>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>⚠️ {error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('email')}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('password')}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '⏳ Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

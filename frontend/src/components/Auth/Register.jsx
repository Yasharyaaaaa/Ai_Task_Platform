import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─── Password strength helper ─────────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { level: 1, label: 'Weak',    color: '#ef4444' },
    { level: 2, label: 'Fair',    color: '#f97316' },
    { level: 3, label: 'Good',    color: '#eab308' },
    { level: 4, label: 'Strong',  color: '#22c55e' },
  ];
  return map[score - 1] ?? { level: 0, label: '', color: 'transparent' };
};

/* ─── Styles ────────────────────────────────────────────────────────────────── */
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
    maxWidth: '440px',
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
  strengthBar: {
    display: 'flex',
    gap: '4px',
    marginTop: '6px',
  },
  strengthLabel: {
    fontSize: '11px',
    marginTop: '4px',
    fontWeight: '500',
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
  terms: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: '12px',
    lineHeight: '1.5',
  },
};

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 style={styles.title}>Create an account</h1>
          <p style={styles.subtitle}>Start automating tasks with AI in seconds</p>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>⚠️ {error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('name')}
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
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

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('password')}
              required
              autoComplete="new-password"
            />
            {/* Strength indicator */}
            {form.password && (
              <>
                <div style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '4px',
                        background: n <= strength.level ? strength.color : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                <span style={{ ...styles.strengthLabel, color: strength.color }}>
                  {strength.label}
                </span>
              </>
            )}
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '⏳ Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p style={styles.terms}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

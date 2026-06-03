import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🔠', title: 'Uppercase',  desc: 'Transform any text to ALL CAPS instantly.' },
  { icon: '🔡', title: 'Lowercase',  desc: 'Convert text to lowercase with one click.' },
  { icon: '🔃', title: 'Reverse',    desc: 'Reverse the order of characters in a string.' },
  { icon: '🔢', title: 'Word Count', desc: 'Count words in any block of text.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .hero-btn-primary {
          display: inline-block; padding: 14px 32px; border-radius: 12px; font-size: 15px;
          font-weight: 600; text-decoration: none; color: #fff;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          box-shadow: 0 8px 24px rgba(124,58,237,0.4);
          transition: opacity 0.2s, transform 0.2s;
        }
        .hero-btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }
        .hero-btn-secondary {
          display: inline-block; padding: 14px 32px; border-radius: 12px; font-size: 15px;
          font-weight: 600; text-decoration: none; color: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.15); background: transparent;
          transition: all 0.2s;
        }
        .hero-btn-secondary:hover { color: #fff; border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.05); }
        .feature-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 28px 24px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover {
          border-color: rgba(124,58,237,0.4); transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center', padding: '100px 24px 80px',
        animation: 'fadeUp 0.6s ease both',
        maxWidth: '760px', margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
          color: '#a78bfa', fontSize: '13px', fontWeight: '600', marginBottom: '28px',
          letterSpacing: '0.5px',
        }}>
          ⚡ Powered by Redis + Python Workers
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: '800', color: '#fff',
          margin: '0 0 20px', lineHeight: '1.1', letterSpacing: '-1.5px',
        }}>
          Automate Text Tasks{' '}
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            with AI Workers
          </span>
        </h1>

        <p style={{
          fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7',
          margin: '0 auto 40px', maxWidth: '520px',
        }}>
          Submit a task, pick an operation, and let our background workers process it in real time.
          Fast, reliable, and built for scale.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {user
            ? <Link to="/dashboard" className="hero-btn-primary">Go to Dashboard →</Link>
            : <>
                <Link to="/register" className="hero-btn-primary">Get started free →</Link>
                <Link to="/login"    className="hero-btn-secondary">Sign in</Link>
              </>
          }
        </div>
      </section>

      {/* ── Features grid ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 100px' }}>
        <h2 style={{
          textAlign: 'center', fontSize: '13px', fontWeight: '600', letterSpacing: '2px',
          color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '36px',
        }}>
          Available Operations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div style={{ fontSize: '32px', marginBottom: '14px', animation: 'float 3s ease-in-out infinite' }}>
                {f.icon}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '600', color: '#fff' }}>
                {f.title}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{
        maxWidth: '900px', margin: '0 auto 80px', padding: '0 24px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.2))',
          border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px',
          padding: '48px 32px', textAlign: 'center',
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: '700', color: '#fff' }}>
            Ready to get started?
          </h2>
          <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
            Create a free account and run your first task in under 60 seconds.
          </p>
          <Link to="/register" className="hero-btn-primary">Create free account →</Link>
        </div>
      </section>
    </div>
  );
}

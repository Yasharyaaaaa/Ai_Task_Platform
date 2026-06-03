import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .nav-link {
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .logout-btn {
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.7);
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
      `}</style>

      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: '62px',
        background: 'rgba(15,12,41,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
          }}>⚡</span>
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#fff', letterSpacing: '-0.3px' }}>
            AI Task Platform
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <span style={{
                width: '1px', height: '20px',
                background: 'rgba(255,255,255,0.12)', margin: '0 8px',
              }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginRight: '8px' }}>
                👋 {user.name}
              </span>
              <button className="logout-btn" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="nav-link">Sign in</Link>
              <Link to="/register" style={{
                marginLeft: '6px',
                padding: '7px 16px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff', textDecoration: 'none',
                fontSize: '14px', fontWeight: '600',
                boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                transition: 'opacity 0.2s',
              }}>Get started</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

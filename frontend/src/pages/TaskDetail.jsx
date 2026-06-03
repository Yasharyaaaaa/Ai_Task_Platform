import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_CONFIG = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '⏳', label: 'Pending'  },
  running: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: '⚙️', label: 'Running'  },
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: '✅', label: 'Success'  },
  failed:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)',icon: '❌', label: 'Failed'   },
};

const OP_ICON = {
  uppercase: '🔠', lowercase: '🔡', reverse: '🔃', wordcount: '🔢',
  summarize: '📝', rewrite: '✍️', translate: '🌐', keywords: '🏷️',
  sentiment: '😊', explain: '💡', custom: '⚡',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  // Mirror the latest status into a ref so the polling interval can read it
  // without being torn down and recreated on every status change.
  const statusRef = useRef(null);

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data);
      statusRef.current = data.status;
    } catch (err) {
      setError(err?.response?.data?.message || 'Task not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    // A single interval lives for the lifetime of this task id; it polls only
    // while the task is still pending/running.
    const interval = setInterval(() => {
      if (statusRef.current === 'pending' || statusRef.current === 'running') {
        fetchTask();
      }
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const s = task ? (STATUS_CONFIG[task.status] || STATUS_CONFIG.pending) : null;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>
      ⏳ Loading task…
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <p style={{ color: '#fca5a5', fontSize: '15px' }}>{error}</p>
      <button onClick={() => navigate('/dashboard')} style={{
        marginTop: '16px', padding: '10px 20px', borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
        color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
      }}>← Back to Dashboard</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .back-btn { border: 1px solid rgba(255,255,255,0.12); background: transparent;
          color: rgba(255,255,255,0.5); padding: 8px 14px; border-radius: 9px; font-size: 13px;
          cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
        .refresh-btn { border: 1px solid rgba(124,58,237,0.35); background: rgba(124,58,237,0.1);
          color: #a78bfa; padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .refresh-btn:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.6); color: #fff; }
      `}</style>

      {/* Nav row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <button className="refresh-btn" onClick={fetchTask}>🔄 Refresh</button>
      </div>

      {/* Main card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '18px', padding: '28px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Running shimmer */}
        {task.status === 'running' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #7c3aed, #60a5fa, #7c3aed)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite',
          }} />
        )}

        {/* Title + status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#fff', flex: 1 }}>
            {task.title}
          </h1>
          <span style={{
            padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
            background: s.bg, color: s.color, border: `1px solid ${s.color}44`,
          }}>
            {s.icon} {s.label}
          </span>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '12px', padding: '3px 10px', borderRadius: '7px',
            background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
            border: '1px solid rgba(124,58,237,0.25)', fontWeight: '500',
          }}>
            {OP_ICON[task.operation]} {task.operation}
          </span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>
            Created {timeAgo(task.createdAt)}
          </span>
        </div>

        {/* Input */}
        <div style={{ marginTop: '24px' }}>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: '600',
            letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Input Text
          </label>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '14px', fontSize: '14px', color: 'rgba(255,255,255,0.7)',
            lineHeight: '1.6', wordBreak: 'break-word',
          }}>
            {task.inputText}
          </div>
        </div>

        {/* Result */}
        {task.result && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '11px', color: '#4ade80', fontWeight: '600',
              letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              ✅ Result
            </label>
            <div style={{
              background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '10px', padding: '14px', fontSize: '14px', color: '#fff',
              lineHeight: '1.6', wordBreak: 'break-word',
            }}>
              {task.result}
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      {task.logs && task.logs.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.5)',
            letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Activity Log
          </h2>
          <div style={{
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            {task.logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', flexShrink: 0, paddingTop: '2px' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

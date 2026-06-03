import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  icon: '⏳', label: 'Pending'  },
  running: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', icon: '⚙️', label: 'Running'  },
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', icon: '✅', label: 'Success'  },
  failed:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)',border: 'rgba(248,113,113,0.3)',icon: '❌', label: 'Failed'   },
};

const OP_ICON = {
  uppercase: '🔠', lowercase: '🔡', reverse: '🔃', wordcount: '🔢',
  summarize: '📝', rewrite: '✍️', translate: '🌐', keywords: '🏷️',
  sentiment: '😊', explain: '💡', custom: '⚡',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function TaskCard({ task, onRefresh }) {
  const navigate = useNavigate();
  const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '14px', padding: '18px 20px',
      transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
    }}
      onClick={() => navigate(`/tasks/${task._id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Running pulse bar */}
      {task.status === 'running' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #7c3aed)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s linear infinite',
        }} />
      )}

      <style>{`
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .refresh-btn { border: 1px solid rgba(255,255,255,0.12); background: transparent;
          color: rgba(255,255,255,0.5); padding: 5px 10px; border-radius: 7px; font-size: 12px;
          cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .refresh-btn:hover { border-color: rgba(124,58,237,0.5); color: #fff; background: rgba(124,58,237,0.1); }
      `}</style>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontSize: '15px', fontWeight: '600', color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{task.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            {/* Operation badge */}
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
              background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.25)', fontWeight: '500',
            }}>
              {OP_ICON[task.operation]} {task.operation}
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              {timeAgo(task.createdAt)}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
          background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {s.icon} {s.label}
        </span>
      </div>

      {/* Input preview */}
      <p style={{
        margin: '12px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {task.inputText}
      </p>

      {/* Result */}
      {task.result && (
        <div style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
          background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.18)',
        }}>
          <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: '600', display: 'block', marginBottom: '3px' }}>
            RESULT
          </span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', wordBreak: 'break-word' }}>
            {task.result}
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '14px' }}
        onClick={e => e.stopPropagation()}>
        <button className="refresh-btn" onClick={onRefresh} title="Refresh status">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

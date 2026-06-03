import TaskCard from './TaskCard';

const STATUS_FILTERS = ['all', 'pending', 'running', 'success', 'failed'];

export default function TaskList({ tasks, onRefresh }) {
  return (
    <div>
      <style>{`
        .filter-btn {
          border: 1px solid rgba(255,255,255,0.1); background: transparent;
          color: rgba(255,255,255,0.5); padding: 5px 12px; border-radius: 8px;
          font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit;
          transition: all 0.2s; text-transform: capitalize;
        }
        .filter-btn:hover { border-color: rgba(124,58,237,0.45); color: #fff; }
        .filter-btn.active {
          background: rgba(124,58,237,0.2); border-color: #7c3aed;
          color: #a78bfa; box-shadow: 0 0 0 2px rgba(124,58,237,0.2);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>
          My Tasks
          <span style={{
            marginLeft: '8px', fontSize: '12px', padding: '2px 8px',
            borderRadius: '20px', background: 'rgba(124,58,237,0.2)',
            color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)',
          }}>{tasks.length}</span>
        </h2>
        <button
          onClick={onRefresh}
          style={{
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: 'rgba(255,255,255,0.5)', padding: '6px 12px',
            borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          🔄 Refresh all
        </button>
      </div>

      {/* Empty state */}
      {tasks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px', color: 'rgba(255,255,255,0.3)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
          <p style={{ margin: 0, fontSize: '14px' }}>No tasks yet. Create your first one above!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

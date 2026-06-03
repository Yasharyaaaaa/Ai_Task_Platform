import TaskCard from './TaskCard';
import { STATUS_FILTERS } from '../../config/operations';

export default function TaskList({
  tasks, loading, total,
  statusFilter, onStatusChange,
  search, onSearchChange,
  page, pages, onPageChange,
  onRefresh, onReRun, onDelete,
}) {
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
        .list-search {
          width: 100%; padding: 9px 12px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06);
          color: #fff; font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .list-search:focus { border-color: rgba(124,58,237,0.6); }
        .list-search::placeholder { color: rgba(255,255,255,0.25); }
        .page-btn {
          border: 1px solid rgba(255,255,255,0.12); background: transparent;
          color: rgba(255,255,255,0.6); padding: 6px 12px; border-radius: 8px;
          font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) { border-color: rgba(124,58,237,0.5); color: #fff; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .refresh-all-btn {
          border: 1px solid rgba(255,255,255,0.1); background: transparent;
          color: rgba(255,255,255,0.5); padding: 6px 12px; border-radius: 8px;
          font-size: 12px; cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .refresh-all-btn:hover { color: #fff; border-color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>
          My Tasks
          <span style={{
            marginLeft: '8px', fontSize: '12px', padding: '2px 8px',
            borderRadius: '20px', background: 'rgba(124,58,237,0.2)',
            color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)',
          }}>{total}</span>
        </h2>
        <button className="refresh-all-btn" onClick={onRefresh}>🔄 Refresh all</button>
      </div>

      {/* Search */}
      <input
        className="list-search"
        type="text"
        placeholder="🔍 Search by title or input text…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ marginBottom: '12px' }}
      />

      {/* Status filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn${statusFilter === f ? ' active' : ''}`}
            onClick={() => onStatusChange(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List / loading / empty */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          ⏳ Loading tasks…
        </div>
      ) : tasks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px', color: 'rgba(255,255,255,0.3)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {search || statusFilter !== 'all'
              ? 'No tasks match your filters.'
              : 'No tasks yet. Create your first one above!'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onRefresh={onRefresh}
                onReRun={onReRun}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '20px' }}>
              <button className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Prev</button>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Page {page} of {pages}</span>
              <button className="page-btn" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

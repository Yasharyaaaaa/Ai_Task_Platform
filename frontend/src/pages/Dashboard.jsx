import { useEffect, useState } from 'react';
import api from '../api/axios';
import TaskForm from '../components/Tasks/TaskForm';
import TaskList from '../components/Tasks/TaskList';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      setError('');
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleTaskCreated = async (form) => {
    await api.post('/tasks', form);
    fetchTasks();
  };

  const stats = {
    total:   tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    success: tasks.filter(t => t.status === 'success').length,
    failed:  tasks.filter(t => t.status === 'failed').length,
  };

  return (
    <div style={{
      maxWidth: '860px', margin: '0 auto',
      padding: '36px 24px', fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
          Welcome back, <span style={{ color: '#a78bfa', fontWeight: '500' }}>{user?.name}</span> 👋
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px', marginBottom: '28px', animation: 'fadeUp 0.4s ease 0.05s both',
      }}>
        {[
          { label: 'Total',   value: stats.total,   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.2)' },
          { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)'  },
          { label: 'Running', value: stats.running, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.2)'  },
          { label: 'Success', value: stats.success, color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.2)'  },
          { label: 'Failed',  value: stats.failed,  color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.2)' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: '12px',
            padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px',
              fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px',
          marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchTasks} style={{
            border: '1px solid rgba(248,113,113,0.4)', background: 'transparent', color: '#fca5a5',
            padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
          }}>Retry</button>
        </div>
      )}

      {/* Task form */}
      <div style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <TaskForm onTaskCreated={handleTaskCreated} />
      </div>

      {/* Task list */}
      <div style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            ⏳ Loading tasks…
          </div>
        ) : (
          <TaskList tasks={tasks} onRefresh={fetchTasks} />
        )}
      </div>
    </div>
  );
}
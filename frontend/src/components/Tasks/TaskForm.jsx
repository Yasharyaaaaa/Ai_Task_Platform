import { useState } from 'react';
import { STRING_OPS, AI_OPS, OP_META, MODELS, isAiOp } from '../../config/operations';

export default function TaskForm({ onTaskCreated }) {
  const [form, setForm] = useState({
    title: '', inputText: '', operation: 'uppercase', prompt: '', model: 'claude-haiku-4-5',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const selectOp = (op) => {
    setForm({ ...form, operation: op });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.inputText.trim()) {
      setError('Title and input text are required.');
      return;
    }
    if (form.operation === 'custom' && !form.prompt.trim()) {
      setError('Custom operation requires an instruction prompt.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Only send prompt/model when relevant; backend ignores them otherwise.
      const payload = {
        title: form.title,
        inputText: form.inputText,
        operation: form.operation,
        ...(form.operation === 'custom' ? { prompt: form.prompt } : {}),
        ...(isAiOp(form.operation) ? { model: form.model } : {}),
      };
      await onTaskCreated(payload);
      setForm({ title: '', inputText: '', operation: form.operation, prompt: '', model: form.model });
      setSuccess('Task queued! It will update below as it runs.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: `1px solid ${focused === field ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: focused === field ? '0 0 0 3px rgba(124,58,237,0.18)' : 'none',
    background: 'rgba(255,255,255,0.06)', color: '#fff',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    resize: (field === 'inputText' || field === 'prompt') ? 'vertical' : undefined,
    minHeight: field === 'inputText' ? '90px' : field === 'prompt' ? '60px' : undefined,
  });

  const renderPills = (ops) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {ops.map((op) => (
        <button
          key={op} type="button"
          className={`op-pill${form.operation === op ? ' active' : ''}`}
          onClick={() => selectOp(op)}
          title={OP_META[op].desc}
        >
          {OP_META[op].icon} {OP_META[op].label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '16px', padding: '24px',
      marginBottom: '28px',
    }}>
      <style>{`
        .op-pill { cursor: pointer; border: 1px solid rgba(255,255,255,0.1); padding: 8px 14px;
          border-radius: 10px; background: transparent; color: rgba(255,255,255,0.55);
          font-size: 13px; font-weight: 500; font-family: inherit; transition: all 0.2s; display: flex;
          align-items: center; gap: 6px; }
        .op-pill:hover { border-color: rgba(124,58,237,0.5); color: #fff; background: rgba(124,58,237,0.1); }
        .op-pill.active { border-color: #7c3aed; color: #fff; background: rgba(124,58,237,0.2);
          box-shadow: 0 0 0 2px rgba(124,58,237,0.25); }
        .submit-btn { width: 100%; padding: 12px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; font-size: 14px;
          font-weight: 600; cursor: pointer; font-family: inherit; letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(124,58,237,0.3); transition: opacity 0.2s, transform 0.15s; }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .op-group-label { font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 600;
          letter-spacing: 0.5px; text-transform: uppercase; margin: 0 0 7px; }
        .model-select { width: 100%; padding: 10px 12px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06);
          color: #fff; font-size: 13px; font-family: inherit; outline: none; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#fff' }}>
        ✨ New Task
      </h2>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '14px',
        }}>⚠️ {error}</div>
      )}
      {success && (
        <div style={{
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: '8px', padding: '10px 14px', color: '#86efac', fontSize: '13px', marginBottom: '14px',
        }}>✅ {success}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', fontWeight: '500' }}>
            Task title
          </label>
          <input
            id="task-title" name="title" type="text" placeholder="e.g. Summarize my notes"
            value={form.title} onChange={handleChange}
            onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
            style={inputStyle('title')} required
          />
        </div>

        {/* Input text */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', fontWeight: '500' }}>
            Input text
          </label>
          <textarea
            id="task-input" name="inputText" placeholder="Paste or type your text here…"
            value={form.inputText} onChange={handleChange}
            onFocus={() => setFocused('inputText')} onBlur={() => setFocused(null)}
            style={inputStyle('inputText')} required
          />
        </div>

        {/* Operation pills, grouped */}
        <div>
          <p className="op-group-label">Basic</p>
          {renderPills(STRING_OPS)}
          <p className="op-group-label" style={{ marginTop: '14px' }}>✨ AI-powered (Claude)</p>
          {renderPills(AI_OPS)}
        </div>

        {/* Custom prompt — only for the 'custom' operation */}
        {form.operation === 'custom' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', fontWeight: '500' }}>
              Custom instruction
            </label>
            <textarea
              name="prompt" placeholder="e.g. Turn this into a formal email…"
              value={form.prompt} onChange={handleChange}
              onFocus={() => setFocused('prompt')} onBlur={() => setFocused(null)}
              style={inputStyle('prompt')}
            />
          </div>
        )}

        {/* Model selector — only for AI operations */}
        {isAiOp(form.operation) && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', fontWeight: '500' }}>
              Model
            </label>
            <select name="model" value={form.model} onChange={handleChange} className="model-select">
              {MODELS.map((m) => (
                <option key={m.value} value={m.value} style={{ background: '#1e1b2e' }}>{m.label}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Queuing task…' : '▶ Run Task'}
        </button>
      </form>
    </div>
  );
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskCard from '../components/Tasks/TaskCard';

const baseTask = {
  _id: '1',
  title: 'My Task',
  operation: 'summarize',
  status: 'success',
  inputText: 'hello world',
  result: 'done',
  createdAt: new Date().toISOString(),
};

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <TaskCard task={baseTask} {...props} />
    </MemoryRouter>
  );

describe('TaskCard', () => {
  beforeEach(() => {
    window.confirm = vi.fn(() => true);
  });

  it('renders the title and status', () => {
    renderCard();
    expect(screen.getByText('My Task')).toBeInTheDocument();
    expect(screen.getByText(/Success/)).toBeInTheDocument();
  });

  it('calls onReRun with the task id', () => {
    const onReRun = vi.fn();
    renderCard({ onReRun });
    fireEvent.click(screen.getByText(/Re-run/));
    expect(onReRun).toHaveBeenCalledWith('1');
  });

  it('confirms before deleting', () => {
    const onDelete = vi.fn();
    renderCard({ onDelete });
    fireEvent.click(screen.getByText(/Delete/));
    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('hides Re-run for pending tasks', () => {
    render(
      <MemoryRouter>
        <TaskCard task={{ ...baseTask, status: 'pending' }} onReRun={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Re-run/)).toBeNull();
  });
});

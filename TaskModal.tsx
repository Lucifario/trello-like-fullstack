import { useState, useEffect } from 'react';
import './modal.css';
import type { Task } from './api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  mode: 'add' | 'edit';
  task?: Task;
  tasksCount?: number;
}

export default function TaskModal({ isOpen, onClose, onSave, mode, task, tasksCount = 0 }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setDescription(task.description);
    } else if (mode === 'add') {
      setTitle(`Task ${tasksCount + 1}`);
      setDescription('');
    }
  }, [mode, task, tasksCount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(task && { id: task.id }),
      title,
      description,
      ...(mode === 'add' && { status: 'todo' as const })
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{mode === 'add' ? 'Add Task' : 'Edit Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="title">{mode === 'add' ? 'Add Title' : 'Edit Title'}</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'add' ? `Task ${tasksCount + 1}` : ''}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="description">{mode === 'add' ? 'Add Description' : 'Edit Description'}</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
            />
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
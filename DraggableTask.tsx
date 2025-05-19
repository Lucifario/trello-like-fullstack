import { useDrag } from 'react-dnd';
import './basecs.css';
import './modal.css';
import type { Task } from './api';
import type { CSSProperties } from 'react';

interface DraggableTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function DraggableTask({ task, onEdit, onDelete }: DraggableTaskProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'TASK',
    item: { 
      id: task.id, 
      status: task.status, 
      index: task.order || 0 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const taskStyle: CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Open a confirmation dialog for edit/delete
    const shouldEdit = window.confirm('What would you like to do with this task?\n\nOK - Edit task\nCancel - Delete task');
    
    if (shouldEdit) {
      onEdit(task);
    } else {
      onDelete(task);
    }
  };

  return (
    <div 
      // @ts-ignore - react-dnd ref typing issue
      ref={dragRef}
      className="tasks"
      style={taskStyle}
      onClick={handleClick}
    >
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
}
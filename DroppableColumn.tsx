import { useDrop } from 'react-dnd';
import type { Task } from './api';
import DraggableTask from './DraggableTask';
import TaskDropZone from './TaskDropZone';
import './basecs.css';
import type { CSSProperties } from 'react';

interface DroppableColumnProps {
  title: string;
  status: "todo" | "in-progress" | "done";
  tasks: Task[];
  onDrop: (taskId: number, newStatus: "todo" | "in-progress" | "done", index: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

interface DragItem {
  id: number;
  status: string;
  index: number;
}

export default function DroppableColumn({ 
  title, 
  status, 
  tasks, 
  onDrop,
  onEditTask,
  onDeleteTask
}: DroppableColumnProps) {
  const [{ isOver }, dropRef] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: 'TASK',
    drop: (item, monitor) => {
      // Only handle the drop if it wasn't handled by a nested target
      if (monitor.didDrop()) return;
      onDrop(item.id, status, tasks.length); // Default to end of list
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  const columnStyle: CSSProperties = {
    backgroundColor: isOver ? '#e2e8f0' : '#f0f0f0',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div 
      // @ts-ignore - react-dnd ref typing issue
      ref={dropRef}
      className="columns"
      style={columnStyle}
    >
      <h3>{title}</h3>
      
      {/* Initial drop zone at the top of the column */}
      <TaskDropZone 
        index={0} 
        status={status} 
        onDrop={onDrop} 
      />
      
      {tasks.length === 0 ? (
        <p>Drop tasks here.</p>
      ) : (
        <>
          {tasks.map((task, index) => (
            <div key={task.id}>
              <DraggableTask 
                task={task} 
                onEdit={onEditTask} 
                onDelete={onDeleteTask}
              />
              {/* Drop zone after each task */}
              <TaskDropZone 
                index={index + 1} 
                status={status} 
                onDrop={onDrop} 
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
import Tasks from './tasks';
import type { Task } from './api';
import './basecs.css';

interface ColumnProps {
  title: string;
  tasks: Task[];
}

export default function Column({ title, tasks }: ColumnProps) {
  return (
    <div className="columns">
      <h3>{title}</h3>
      {tasks.length === 0 ? (
        <p>No tasks here.</p>
      ) : (
        tasks.map((task) => (
          <Tasks key={task.id} task={task} />
        ))
      )}
    </div>
  );
}

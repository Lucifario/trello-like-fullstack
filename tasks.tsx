import './basecs.css';
import type { Task } from './api';

export default function Tasks({ task }: { task: Task }) {
  return (
    <div className="tasks">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
}

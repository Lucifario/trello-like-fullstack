import './modal.css';

interface TaskControlBarProps {
  onAddTask: () => void;
}

export default function TaskControlBar({ onAddTask }: TaskControlBarProps) {
  return (
    <div className="task-control-bar">
      <button className="add-task-button" onClick={onAddTask}>
        <span>+</span> Add Task
      </button>
      <div className="task-info">
        To edit or remove a task, simply click on the task and then choose from the options.
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DroppableColumn from "./DroppableColumn";
import TaskControlBar from "./TaskControlBar";
import TaskModal from "./TaskModal";
import DeleteModal from "./DeleteModal";
import { fetchTasks, updateTaskStatus, createTask, updateTask, deleteTask } from "./api";
import type { Task } from './api';

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Task modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'add' | 'edit'>('add');
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  
  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const taskData = await fetchTasks();
      setTasks(taskData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTaskClick = () => {
    setTaskModalMode('add');
    setCurrentTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskModalMode('edit');
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      if (taskModalMode === 'add') {
        // Create new task
        const newTask = await createTask(taskData as Omit<Task, 'id'>);
        setTasks(currentTasks => [...currentTasks, newTask]);
      } else if (taskModalMode === 'edit' && currentTask) {
        // Update existing task
        const updatedTask = await updateTask(currentTask.id, taskData);
        setTasks(currentTasks => 
          currentTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      }
    } catch (err) {
      console.error("Failed to save task:", err);
      setError("Failed to save task. Please try again.");
    }
  };

  const handleTaskDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask(taskToDelete.id);
      // Remove from local state
      setTasks(currentTasks => 
        currentTasks.filter(task => task.id !== taskToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const handleDrop = async (taskId: number, newStatus: "todo" | "in-progress" | "done", dropIndex: number) => {
    try {
      // Find the task that's being moved
      const taskToMove = tasks.find(t => t.id === taskId);
      if (!taskToMove) return;
      
      // Get tasks in the target column, excluding the task being moved
      const targetColumnTasks = tasks
        .filter(t => t.status === newStatus && t.id !== taskId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Create new orders based on drop position
      const updatedTasks = [...tasks];
      let newOrder = 0;
      
      // If dropping at a specific position
      if (dropIndex < targetColumnTasks.length) {
        // Get the order of the task at the drop position
        const targetOrder = targetColumnTasks[dropIndex].order || dropIndex;
        
        // Adjust orders of tasks after the drop position
        targetColumnTasks.forEach((task, index) => {
          const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
          if (index >= dropIndex) {
            updatedTasks[taskIndex].order = (task.order || index) + 1;
          }
        });
        
        newOrder = targetOrder;
      } else {
        // If dropping at the end, use the next order number
        newOrder = targetColumnTasks.length > 0 
          ? ((targetColumnTasks[targetColumnTasks.length - 1].order || 0) + 1) 
          : 0;
      }
      
      // Update the moved task's status and order
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      updatedTasks[taskIndex].status = newStatus;
      updatedTasks[taskIndex].order = newOrder;
      
      // Optimistically update UI
      setTasks(updatedTasks);
      
      // Send update to server
      await updateTaskStatus(taskId, newStatus, newOrder);
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Revert to original state if request fails
      loadTasks();
    }
  };

  // Filter tasks by status and sort by order
  const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
  const todoTasks = sortedTasks.filter(task => task.status === "todo");
  const inProgressTasks = sortedTasks.filter(task => task.status === "in-progress");
  const doneTasks = sortedTasks.filter(task => task.status === "done");

  if (loading) {
    return <div className="flex gap-6 mt-4">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={loadTasks} className="bg-purple-600 text-white border-none py-2 px-5 rounded-md cursor-pointer transition-colors duration-200 hover:bg-purple-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <TaskControlBar onAddTask={handleAddTaskClick} />
        
        <div className="flex gap-6 mt-4">
          <DroppableColumn 
            title="To Do" 
            status="todo" 
            tasks={todoTasks} 
            onDrop={handleDrop}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <DroppableColumn 
            title="In Progress" 
            status="in-progress" 
            tasks={inProgressTasks} 
            onDrop={handleDrop}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <DroppableColumn 
            title="Done" 
            status="done" 
            tasks={doneTasks} 
            onDrop={handleDrop}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
        
        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleTaskSave}
          mode={taskModalMode}
          task={currentTask}
          tasksCount={tasks.length}
        />
        
        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleTaskDelete}
          taskTitle={taskToDelete?.title || ''}
        />
      </div>
    </DndProvider>
  );
}
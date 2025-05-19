export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  order?: number; // Add order field for task positioning
}

const API_URL = "http://localhost:8000";

export async function fetchTasks(): Promise<Task[]> {
  try {
    const res = await fetch(`${API_URL}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export async function updateTask(id: number, task: Partial<Task>): Promise<Task> {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

export async function deleteTask(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error("Failed to delete task");
    return;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

export async function updateTaskStatus(id: number, status: "todo" | "in-progress" | "done", order?: number): Promise<Task> {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, order }),
    });
    if (!res.ok) throw new Error("Failed to update task status");
    return res.json();
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}
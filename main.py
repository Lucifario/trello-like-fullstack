from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

class Task(BaseModel):
    id: int
    title: str
    description: str = ""
    status: str
    order: Optional[int] = None

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    order: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    status: str
    order: Optional[int] = None

mock_tasks: List[Task] = []
next_id = 7  # Starting ID after the initial 6 tasks

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_data():
    global mock_tasks
    if not mock_tasks:
        mock_tasks = [
            Task(
                id=1,
                title="Design Dashboard UI",
                description="Create wireframes and hi-fi mockups for the main dashboard view.",
                status="todo"
            ),
            Task(
                id=2,
                title="Implement Authentication",
                description="Add signup, login, and JWT-based session handling in FastAPI.",
                status="in-progress"
            ),
            Task(
                id=3,
                title="Set Up Database Migrations",
                description="Configure Alembic for versioned schema changes on PostgreSQL.",
                status="done"
            ),
            Task(
                id=4,
                title="Build Task CRUD API",
                description="Develop REST endpoints for creating, reading, updating, and deleting tasks.",
                status="todo"
            ),
            Task(
                id=5,
                title="Write Unit & Integration Tests",
                description="Cover both backend endpoints and React components with Jest and Pytest.",
                status="todo"
            ),
            Task(
                id=6,
                title="Deploy to Staging",
                description="Containerize services with Docker and push to staging on Heroku.",
                status="in-progress"
            )
        ]

@app.get("/tasks", response_model=List[Task])
def get_tasks():
    # Sort tasks by order if available
    return sorted(mock_tasks, key=lambda x: (x.order if x.order is not None else float('inf')))

@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate):
    global next_id
    # Validate status value
    if task.status not in ["todo", "in-progress", "done"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    # Create new task
    new_task = Task(
        id=next_id,
        title=task.title,
        description=task.description,
        status=task.status
    )
    mock_tasks.append(new_task)
    next_id += 1
    return new_task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_update: TaskUpdate):
    # Find the task
    task = next((t for t in mock_tasks if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields if provided
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        if task_update.status not in ["todo", "in-progress", "done"]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        task.status = task_update.status
    if task_update.order is not None:
        task.order = task_update.order
    
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    global mock_tasks
    # Find the task index
    index = next((i for i, t in enumerate(mock_tasks) if t.id == task_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete the task
    del mock_tasks[index]
    return {"message": "Task deleted successfully"}

@app.put("/tasks/{task_id}/status", response_model=Task)
def update_task_status(task_id: int, status_update: TaskStatusUpdate):
    # Validate status value
    if status_update.status not in ["todo", "in-progress", "done"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    # Find the task
    task = next((t for t in mock_tasks if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update the task status
    task.status = status_update.status
    
    # Update order if provided
    if status_update.order is not None:
        task.order = status_update.order
    
    return task


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
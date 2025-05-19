import { useDrop } from 'react-dnd';
import type { CSSProperties } from 'react';

interface TaskDropZoneProps {
  index: number;
  status: "todo" | "in-progress" | "done";
  onDrop: (taskId: number, newStatus: "todo" | "in-progress" | "done", index: number) => void;
}

export default function TaskDropZone({ index, status, onDrop }: TaskDropZoneProps) {
  const [{ isOver }, dropRef] = useDrop<{id: number, status: string}, void, {isOver: boolean}>(() => ({
    accept: 'TASK',
    drop: (item) => onDrop(item.id, status, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const style: CSSProperties = {
    height: '10px',
    width: '100%',
    backgroundColor: isOver ? '#60a5fa' : 'transparent',
    transition: 'background-color 0.2s ease',
    marginBottom: '4px',
    marginTop: '4px',
    border: isOver ? '2px dashed #2563eb' : 'none',
    borderRadius: '4px',
  };

  return (
    <div 
      // @ts-ignore - react-dnd ref typing issue
      ref={dropRef}
      style={style}
    />
  );
}
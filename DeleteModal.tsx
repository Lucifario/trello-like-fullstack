import './modal.css';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, taskTitle }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete task: <strong>{taskTitle}</strong>?</p>
        <div className="delete-buttons">
          <button className="cancel-button" onClick={onClose}>
            No, Cancel
          </button>
          <button className="delete-button" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
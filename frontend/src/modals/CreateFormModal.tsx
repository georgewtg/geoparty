import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBoard } from "../api/board.api";
import type { CreateBoardPayload } from "../types/board";
import './CreateFormModal.css';

type CreateFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateFormModal: React.FC<CreateFormModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateBoardPayload>({
    name: "GeoParty Template",
    title: "GeoParty",
    num_of_categories: 6,
    num_of_questions: 5
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null; // Close Floating Form Modal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await createBoard(formData);
      navigate(`/board/${data.payload}`);

    } catch (error) {
      setError('Failed to create board');
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Board</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="title">Title</label>
            <textarea
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="field row">
            <div className="field number">
              <label htmlFor="categories">Categories</label>
              <input className="input"
                id="categories"
                name="num_of_categories"
                type="number"
                required
                value={formData.num_of_categories}
                onChange={handleChange}
              />
            </div>
            <div className="field number">
              <label htmlFor="questions">Questions</label>
              <input
                id="questions"
                name="num_of_questions"
                type="number"
                required
                value={formData.num_of_questions}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field row">
            <button className="cancel-button" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFormModal;
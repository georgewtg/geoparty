import { useEffect, useState } from "react";
import type { BoardData, BoardItem, BoardPage } from "../types/board";
import './EditFormModal.css';
import { updateBoard } from "../api/board.api";

type EditFormModalProps = {
  isOpen: boolean;
  page: BoardPage;
  boardId: number;
  boardData: BoardData;
  setBoard: (board: BoardItem) => void;
  onClose: () => void;
}

const EditFormModal: React.FC<EditFormModalProps> = ({ isOpen, page, boardId, boardData, setBoard, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tempBoardData, setTempBoardData] = useState<BoardData>(boardData);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null; // close modal

  const getDiffUpdates = (): { key: string; value: string }[] => {
    const updates: { key: string; value: string }[] = [];

    // Title Diff
    if (tempBoardData.title !== boardData.title) {
      updates.push({ key: "title", value: tempBoardData.title });
    }

    // Categories & Clues Diffs
    tempBoardData.categories?.forEach((cat, catIdx) => {
      const origCat = boardData.categories?.[catIdx];

      // Check category name change
      if (origCat && cat.name !== origCat.name) {
        updates.push({ key: `categories,${catIdx},name`, value: cat.name });
      }

      // Check clues changes inside category
      cat.clues?.forEach((clue, clueIdx) => {
        const origClue = origCat?.clues?.[clueIdx];
        if (origClue && clue.score !== origClue.score) {
          updates.push({
            key: `categories,${catIdx},clues,${clueIdx},score`,
            value: clue.score,
          });
        }
      });
    });

    return updates;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempBoardData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = await updateBoard(boardId, getDiffUpdates());
      setBoard(data.payload);
      onClose();

    } catch (error) {
      setError('Failed to update board data');
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => {
    switch (page) {
      case 'TITLE':
        return (
          <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
              <div className="modal-header">
                <h2>Edit Title</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
              </div>

              {error && <div className="error">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="field row">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={tempBoardData.title}
                    onChange={handleTitleChange}
                  />
                </div>

                <div className="field row">
                  <button className="cancel-button" type="button" onClick={onClose} disabled={loading}>
                    Cancel
                  </button>
                  <button className="submit-button" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
    }
  };

  return renderModal();
};

export default EditFormModal;
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
};

const EditFormModal: React.FC<EditFormModalProps> = ({ isOpen, page, boardId, boardData, setBoard, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tempBoardData, setTempBoardData] = useState<BoardData>(boardData);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null; // close modal

  // toggle category dropdown
  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

  const handleTitleChange = (value: string) => {
    setTempBoardData((prev) => ({ ...prev, title: value }));
  };

  const handleCategoryNameChange = (catIdx: number, value: string) => {
    setTempBoardData((prev) => {
      const updatedCategories = [...(prev.categories || [])];
      updatedCategories[catIdx] = { ...updatedCategories[catIdx], name: value };
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleClueScoreChange = (catIdx: number, clueIdx: number, value: string) => {
    setTempBoardData((prev) => {
      const updatedCategories = [...(prev.categories || [])];
      const updatedClues = [...(updatedCategories[catIdx].clues || [])];
      
      updatedClues[clueIdx] = { ...updatedClues[catIdx], score: value };
      updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };
      
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updates = getDiffUpdates();

    if (updates.length === 0) {
      onClose();
      setLoading(false);
      return;
    }

    try {
      const data = await updateBoard(boardId, updates);
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
    return (
      <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <h2>{page === 'TITLE' ? 'Edit Title' : 'Edit Categories & Scores'}</h2>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {page === 'TITLE' && (
              <div className="field row">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={tempBoardData.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
            )}

            {page === 'BOARD' && (
              <div className="categories-list">
                {tempBoardData.categories?.map((category, catIdx) => (
                  <div key={category.id || catIdx} className="category-item">
                    <div className="category-header row">
                      <input
                        type="text"
                        value={category.name}
                        placeholder="Category Name"
                        onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        className="dropdown-toggle" 
                        onClick={() => toggleCategory(catIdx)}
                      >
                        {expandedCategories[catIdx] ? '▲ Clues' : '▼ Clues'}
                      </button>
                    </div>

                    {expandedCategories[catIdx] && (
                      <div className="clues-dropdown">
                        {category.clues?.map((clue, clueIdx) => (
                          <div key={clueIdx} className="clue-row row">
                            <label>Clue #{clueIdx + 1} Score:</label>
                            <input
                              type="text"
                              value={clue.score}
                              onChange={(e) => handleClueScoreChange(catIdx, clueIdx, e.target.value)}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="field row modal-actions">
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
    );
  };

  return renderModal();
};

export default EditFormModal;
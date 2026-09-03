import { useEffect, useState } from "react";
import { updateBoard } from "../api/board.api";
import { uploadFile } from "../api/upload.api";
import {
  DATA_TYPES,
  type BoardData,
  type BoardItem,
  type BoardPage,
  type ClueData,
  type DataType,
  type PageData
} from "../types/board";
import './EditFormModal.css';
import { useAuth } from "../context/AuthContext";

type EditFormModalProps = {
  isOpen: boolean;
  page: BoardPage;
  boardId: string;
  boardData: BoardData;
  setBoard: (board: BoardItem) => void;
  isShowAnswer: boolean;
  selectedClueInfo: { catIdx: number, clueIdx: number }
  setClueData: ( clueData: ClueData ) => void;
  onClose: () => void;
};

const EditFormModal: React.FC<EditFormModalProps> = ({ isOpen, page, boardId, boardData, setBoard, isShowAnswer, selectedClueInfo, setClueData, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tempBoardData, setTempBoardData] = useState<BoardData>(boardData);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const section = isShowAnswer ? 'answer' : 'question';
  const {catIdx, clueIdx} = selectedClueInfo;
  const { user } = useAuth();

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

  const getDiffUpdates = (): { key: string; value: string | PageData[] }[] => {
    const updates: { key: string; value: string | PageData[] }[] = [];

    // title diff
    if (tempBoardData.title !== boardData.title) {
      updates.push({ key: "title", value: tempBoardData.title });
    }

    // nested diff (category, clue, question, answer)
    tempBoardData.categories?.forEach((cat, catIdx) => {
      const origCat = boardData.categories[catIdx];

      // Check category name change
      if (origCat && cat.name !== origCat.name) {
        updates.push({ key: `categories,${catIdx},name`, value: cat.name });
      }

      // Check clues changes inside category
      cat.clues.forEach((clue, clueIdx) => {
        const origClue = origCat.clues[clueIdx];
        if (origClue && clue.score !== origClue.score) {
          updates.push({
            key: `categories,${catIdx},clues,${clueIdx},score`,
            value: clue.score,
          });
        }

        // compare question items
        const origQuestion = origClue.question;
        if (clue.question && JSON.stringify(clue.question) !== JSON.stringify(origQuestion)) {
          updates.push({ key: `categories,${catIdx},clues,${clueIdx},question`, value: clue.question });
        }

        // compare answer items
        const origAnswer = origClue.answer;
        if (clue.answer && JSON.stringify(clue.answer) !== JSON.stringify(origAnswer)) {
          updates.push({ key: `categories,${catIdx},clues,${clueIdx},answer`, value: clue.answer });
        }
      });
    });

    // final jeopardy diff
    const origFinalQuestion = boardData.final_jeopardy.question;
    const origFinalAnswer = boardData.final_jeopardy.answer;
    const tempFinalQuestion = tempBoardData.final_jeopardy.question;
    const tempFinalAnswer = tempBoardData.final_jeopardy.answer;
    if (tempFinalQuestion && JSON.stringify(tempFinalQuestion) !== JSON.stringify(origFinalQuestion)) {
      updates.push({ key: `final_jeopardy,question`, value: tempFinalQuestion });
    }
    if (tempFinalAnswer && JSON.stringify(tempFinalAnswer) !== JSON.stringify(origFinalAnswer)) {
      updates.push({ key: `final_jeopardy,answer`, value: tempFinalAnswer });
    }


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

  const handlePageDataChange = (
    catIdx: number,
    clueIdx: number,
    section: 'question' | 'answer',
    itemIdx: number,
    field: 'type' | 'value',
    value: string
  ) => {
    if (catIdx === -1 && clueIdx === -1) {
      setTempBoardData((prev) => {
        const targetClue = { ...prev.final_jeopardy };
        const targetList = [...(targetClue[section] || [])];

        targetList[itemIdx] = {
          ...targetList[itemIdx],
          [field]: value as DataType,
        };

        targetClue[section] = targetList;

        return { ...prev, final_jeopardy: targetClue };
      });
    } else {
      setTempBoardData((prev) => {
        const updatedCategories = [...(prev.categories || [])];
        const updatedClues = [...(updatedCategories[catIdx].clues || [])];
        const targetClue = { ...updatedClues[clueIdx] };
        const targetList = [...(targetClue[section] || [])];

        targetList[itemIdx] = {
          ...targetList[itemIdx],
          [field]: value as DataType,
        };

        targetClue[section] = targetList;
        updatedClues[clueIdx] = targetClue;
        updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

        return { ...prev, categories: updatedCategories };
      });
    }
  }

  const addPageDataItem = (
    catIdx: number,
    clueIdx: number,
    section: 'question' | 'answer'
  ) => {
    if (catIdx === -1 && clueIdx === -1) {
      setTempBoardData((prev) => {
        const targetClue = { ...prev.final_jeopardy };
        const newItem: PageData = { type: 'TEXT', value: '' };

        targetClue[section] = [...(targetClue[section] || []), newItem];

        return { ...prev, final_jeopardy: targetClue };
      });
    } else {
      setTempBoardData((prev) => {
        const updatedCategories = [...(prev.categories || [])];
        const updatedClues = [...(updatedCategories[catIdx].clues || [])];
        const targetClue = { ...updatedClues[clueIdx] };
        const newItem: PageData = { type: 'TEXT', value: '' };

        targetClue[section] = [...(targetClue[section] || []), newItem];
        updatedClues[clueIdx] = targetClue;
        updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

        return { ...prev, categories: updatedCategories };
      });
    }
  }

  const removePageDataItem = (
    catIdx: number,
    clueIdx: number,
    section: 'question' | 'answer',
    itemIdx: number
  ) => {
    if (catIdx === -1 && clueIdx === -1) {
      setTempBoardData((prev) => {
        const targetClue = { ...prev.final_jeopardy };

        targetClue[section] = (targetClue[section] || []).filter((_, idx) => idx !== itemIdx);

        return { ...prev, final_jeopardy: targetClue };
      });
    } else {
      setTempBoardData((prev) => {
        const updatedCategories = [...(prev.categories || [])];
        const updatedClues = [...(updatedCategories[catIdx].clues || [])];
        const targetClue = { ...updatedClues[clueIdx] };

        targetClue[section] = (targetClue[section] || []).filter((_, idx) => idx !== itemIdx);
        updatedClues[clueIdx] = targetClue;
        updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

        return { ...prev, categories: updatedCategories };
      });
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      if (!user) throw new Error('User must be logged in to upload files');

      const data = uploadFile(file, user.id);
      return data;
    } catch (error) {
      setError('Failed to upload file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

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
      if (catIdx === -1 && clueIdx === -1) setClueData(data.payload.board_data.final_jeopardy);
      else setClueData(data.payload.board_data.categories[catIdx].clues[clueIdx]);
      onClose();

    } catch (error) {
      setError('Failed to update board data');
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  const renderPageDataSection = (
    catIdx: number,
    clueIdx: number,
    section: 'question' | 'answer',
    items: PageData[] = []
  ) => {
    if (!Array.isArray(items)) items = [];

    return (
      <div className={`clue-section ${section}-section`}>
        <div className="section-header row">
          <button
            type="button"
            className="add-button"
            onClick={() => addPageDataItem(catIdx, clueIdx, section)}
          >
            + Add Item
          </button>
        </div>

        {items.map((item, itemIdx) => (
          <div key={itemIdx} className="page-data-row row">
            <select
              value={item.type}
              onChange={(e) =>
                handlePageDataChange(catIdx, clueIdx, section, itemIdx, 'type', e.target.value)
              }
            >
              {DATA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Value / Content URL"
              value={item.value}
              onChange={(e) =>
                handlePageDataChange(catIdx, clueIdx, section, itemIdx, 'value', e.target.value)
              }
              required
            />

            {/* Hidden File Input triggered by the Upload Button */}
            <label className="upload-button">
              {uploading ? 'Uploading...' : '📤'}
              <input
                type="file"
                id={`file-upload-${catIdx}-${clueIdx}-${section}-${itemIdx}`}
                style={{ display: 'none' }}
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const data = await handleFileUpload(file);
                    const fileName = data?.public_id.split('/').pop() || '';
                    handlePageDataChange(catIdx, clueIdx, section, itemIdx, 'value', fileName);
                  }
                }}
              />
            </label>

            <button
              type="button"
              className="delete-button"
              onClick={() => removePageDataItem(catIdx, clueIdx, section, itemIdx)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    )
  };

  const renderModal = () => {
    return (
      <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <h2>{page === 'TITLE' ? 'Edit Title' : ( page === 'BOARD' ? 'Edit Categories & Score' : 'Edit Page' )}</h2>
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

            {page === 'CLUE' && (
              <div className="clues-container">
                <div key={clueIdx} className="clue-edit-block">
                  {renderPageDataSection(catIdx, clueIdx, section, (catIdx === -1 && clueIdx === -1) ? tempBoardData.final_jeopardy[section] : tempBoardData.categories[catIdx].clues[clueIdx][section])}
                </div>
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
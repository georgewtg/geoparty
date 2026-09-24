import React, { useRef, useState, type Dispatch, type SetStateAction } from "react";
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
import { useAuth } from "../context/AuthContext";
import { useShortcut } from "../hooks/useShortcut";
import "./SideModal.css"


interface EditModalProps {
  page: BoardPage;
  boardId: string;
  boardData: BoardData;
  setBoard: Dispatch<SetStateAction<BoardItem | null>>;
  selectedClueInfo: { catIdx: number, clueIdx: number }
  setClueData: Dispatch<SetStateAction<ClueData>>;
};


const EditModal: React.FC<EditModalProps> = ({ page, boardId, boardData, setBoard, selectedClueInfo, setClueData }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingItemKey, setUploadingItemKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempBoardData, setTempBoardData] = useState<BoardData>(boardData);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedPages, setExpandedPages] = useState<Record<number, boolean>>({});
  const mouseDownTarget = useRef<EventTarget | null>(null);
  const {catIdx, clueIdx} = selectedClueInfo;
  const { user } = useAuth();

  const MAX_FILE_SIZE_MB = 100;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  useShortcut({
    Escape: () => setIsOpen(false)
  }, isOpen);


  // toggle dropdown
  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const togglePage = (index: number) => {
    setExpandedPages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getDiffUpdates = (): { key: string; value: string | PageData[][] }[] => {
    const updates: { key: string; value: string | PageData[][] }[] = [];

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
        if (!origClue) return;
        
        if (clue.score !== origClue.score) {
          updates.push({
            key: `categories,${catIdx},clues,${clueIdx},score`,
            value: clue.score,
          });
        }

        // compare clues
        if (clue.pages && JSON.stringify(clue.pages) !== JSON.stringify(origClue.pages)) {
          updates.push({
            key: `categories,${catIdx},clues,${clueIdx},pages`,
            value: clue.pages,
          });
        }
      });
    });

    // final jeopardy diff
    const origFinalPages = boardData.final_jeopardy?.pages;
    const tempFinalPages = tempBoardData.final_jeopardy?.pages;
    if (tempFinalPages && JSON.stringify(tempFinalPages) !== JSON.stringify(origFinalPages)) {
      updates.push({ key: `final_jeopardy,pages`, value: tempFinalPages });
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
    pageIdx: number,
    itemIdx: number,
    field: 'type' | 'value',
    value: string
  ) => {
    setTempBoardData((prev) => {
      const isFinal = catIdx === -1 && clueIdx === -1;
      const targetClue = isFinal
      ? { ...prev.final_jeopardy }
      : { ...prev.categories[catIdx].clues[clueIdx] };

      const updatedPages = (targetClue.pages || []).map((page, pIdx) => {
        if (pIdx !== pageIdx) return page;
        return page.map((item, iIdx) => {
          if (iIdx !== itemIdx) return item;
          return { ...item, [field]: value as DataType };
        });
      });

      targetClue.pages = updatedPages;

      if (isFinal) return { ...prev, final_jeopardy: targetClue };

      const updatedCategories = [...prev.categories || []];
      const updatedClues = [...updatedCategories[catIdx].clues || []];
      updatedClues[clueIdx] = targetClue;
      updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

      return { ...prev, categories: updatedCategories };
    });
  };

  const addPageDataItem = (
    catIdx: number,
    clueIdx: number,
    pageIdx: number
  ) => {
    setTempBoardData((prev) => {
      const isFinal = catIdx === -1 && clueIdx === -1;
      const targetClue = isFinal
        ? { ...prev.final_jeopardy }
        : { ...prev.categories[catIdx].clues[clueIdx] };

      const newItem: PageData = { type: 'TEXT', value: '' };

      const updatedPages = (targetClue.pages || []).map((page, pIdx) => {
        if (pIdx !== pageIdx) return page;
        return [...page, newItem];
      });

      targetClue.pages = updatedPages;

      if (isFinal) return { ...prev, final_jeopardy: targetClue };

      const updatedCategories = [...(prev.categories || [])];
      const updatedClues = [...(updatedCategories[catIdx].clues || [])];
      updatedClues[clueIdx] = targetClue;
      updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

      return { ...prev, categories: updatedCategories };
    });
  };

  const removePageDataItem = (
    catIdx: number,
    clueIdx: number,
    pageIdx: number,
    itemIdx: number
  ) => {
    setTempBoardData((prev) => {
      const isFinal = catIdx === -1 && clueIdx === -1;
      const targetClue = isFinal
        ? { ...prev.final_jeopardy }
        : { ...prev.categories[catIdx].clues[clueIdx] };

      const updatedPages = (targetClue.pages || []).map((page, pIdx) => {
        if (pIdx !== pageIdx) return page;
        return page.filter((_, iIdx) => iIdx !== itemIdx);
      });

      targetClue.pages = updatedPages;

      if (isFinal) return { ...prev, final_jeopardy: targetClue };

      const updatedCategories = [...(prev.categories || [])];
      const updatedClues = [...(updatedCategories[catIdx].clues || [])];
      updatedClues[clueIdx] = targetClue;
      updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

      return { ...prev, categories: updatedCategories };
    });
  };

  const handleAddPage = () => {
    setTempBoardData((prev) => {
      const isFinal = catIdx === -1 && clueIdx === -1;
      const targetClue = isFinal
        ? { ...prev.final_jeopardy }
        : { ...prev.categories[catIdx].clues[clueIdx] };

      targetClue.pages = [...(targetClue.pages || []), []];

      if (isFinal) return { ...prev, final_jeopardy: targetClue };

      const updatedCategories = [...(prev.categories || [])];
      const updatedClues = [...(updatedCategories[catIdx].clues || [])];
      updatedClues[clueIdx] = targetClue;
      updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

      return { ...prev, categories: updatedCategories };
    });
  };

  const handleRemovePage = (
    catIdx: number,
    clueIdx: number,
    pageIdx: number
  ) => {
    setTempBoardData((prev) => {
      const isFinal = catIdx === -1 && clueIdx === -1;
      const targetClue = isFinal
        ? { ...prev.final_jeopardy }
        : { ...prev.categories[catIdx].clues[clueIdx] };

      const updatedPages = targetClue.pages.filter((_, iIdx) => iIdx !== pageIdx);
      targetClue.pages = updatedPages;

      if (isFinal) return { ...prev, final_jeopardy: targetClue };

      const updatedCategories = [...(prev.categories || [])];
      const updatedClues = [...(updatedCategories[catIdx].clues || [])];
      updatedClues[clueIdx] = targetClue;
      updatedCategories[catIdx] = { ...updatedCategories[catIdx], clues: updatedClues };

      return { ...prev, categories: updatedCategories };
    });
  };

  const handleFileUpload = async (file: File, uploadKey: string) => {
    try {
      setUploadingItemKey(uploadKey);
      if (!user) throw new Error('User must be logged in to upload files');

      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isAudio && !isVideo) {
        throw new Error('Please select a valid image, audio, or video file.');
      }
      if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File size exceeds ${MAX_FILE_SIZE_MB} MB limit`);

      const data = await uploadFile(file, user.id);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      setError(errorMessage);
      console.error(error);
    } finally {
      setUploadingItemKey(null);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updates = getDiffUpdates();

    if (updates.length === 0) {
      setIsOpen(false);
      setLoading(false);
      return;
    }

    try {
      const data = await updateBoard(boardId, updates);
      setBoard(data.payload);
      if (catIdx === -1 && clueIdx === -1) setClueData(data.payload.board_data.final_jeopardy);
      else setClueData(data.payload.board_data.categories[catIdx].clues[clueIdx]);
      setIsOpen(false);

    } catch (error) {
      setError('Failed to update board data');
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  const renderPageDataEdit = (
    catIdx: number,
    clueIdx: number,
    pages: PageData[][]
  ) => {
    if (!Array.isArray(pages)) pages = [];

    return (
      pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="edit-item">
          <div className="edit-header page">
            <span className="page-number">Page {pageIdx + 1}</span>
            <div className="header-button">
              <button
                type="button"
                className="button remove"
                onClick={() => handleRemovePage(catIdx, clueIdx, pageIdx)}
              >
                &times; Remove Page
              </button>
              <button 
                type="button" 
                className="button dropdown" 
                onClick={() => togglePage(pageIdx)}
              >
                {expandedPages[pageIdx] ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {expandedPages[pageIdx] && (
            <>
              <div className="edit-dropdown">
                {(pageItems || []).map((item, itemIdx) => (
                  <div key={itemIdx} className="edit-row page">
                    <select
                      value={item.type}
                      onChange={(e) =>
                        handlePageDataChange(catIdx, clueIdx, pageIdx, itemIdx, 'type', e.target.value)
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
                      placeholder="text / filename"
                      value={item.value}
                      onChange={(e) =>
                        handlePageDataChange(catIdx, clueIdx, pageIdx, itemIdx, 'value', e.target.value)
                      }
                      required
                    />

                    {/* Hidden File Input triggered by the Upload Button */}
                    <label className="button upload">
                      {(uploadingItemKey === `${pageIdx}-${itemIdx}`) ? (
                        <svg 
                          className="spinner" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : '📤'}
                      <input
                        type="file"
                        id={`file-upload-${catIdx}-${clueIdx}-${pageIdx}-${itemIdx}`}
                        style={{ display: 'none' }}
                        accept="image/*,audio/*,video/*"
                        disabled={uploadingItemKey === `${pageIdx}-${itemIdx}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const data = await handleFileUpload(file, `${pageIdx}-${itemIdx}`);
                            if (data) {
                              const fileName = data?.public_id.split('/').pop() || '';
                              handlePageDataChange(catIdx, clueIdx, pageIdx, itemIdx, 'value', fileName);
                            }
                          }
                          e.target.value='';
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      className="button delete"
                      onClick={() => removePageDataItem(catIdx, clueIdx, pageIdx, itemIdx)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button add"
                onClick={() => addPageDataItem(catIdx, clueIdx, pageIdx)}
              >
                + Add Item
              </button>
            </>
          )}
        </div>
      ))
    )
  };

  const renderTitleEdit = () => {
    return (
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
    )
  };

  const renderBoardEdit = () => {
    return (
      <div className="edit-list">
        {tempBoardData.categories?.map((category, catIdx) => (
          <div key={category.id || catIdx} className="edit-item">
            <div className="edit-header">
              <input
                type="text"
                value={category.name}
                placeholder="Category Name"
                onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                required
              />
              <button 
                type="button" 
                className="button dropdown" 
                onClick={() => toggleCategory(catIdx)}
              >
                {expandedCategories[catIdx] ? '▲' : '▼'}
              </button>
            </div>

            {expandedCategories[catIdx] && (
              <div className="edit-dropdown">
                {category.clues?.map((clue, clueIdx) => (
                  <div key={clueIdx} className="edit-row">
                    <label>Value #{clueIdx + 1}:</label>
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
    )
  };

  const renderClueEdit = () => {
    return (
      <div className="edit-list">
        {renderPageDataEdit(catIdx, clueIdx, (catIdx === -1 && clueIdx === -1) ? tempBoardData.final_jeopardy.pages : tempBoardData.categories[catIdx].clues[clueIdx].pages)}
      </div>
    )
  }

  const renderModal = () => {
    return (
      <div
        id="edit-modal" className="modal-backdrop"
        onMouseDown={(e) => mouseDownTarget.current = e.target}
        onClick={(e) => e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget && setIsOpen(false)}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>{page === 'TITLE' ? 'Edit Title' : ( page === 'BOARD' ? 'Edit Categories & Score' : 'Edit Clues' )}</h2>
            {page === 'CLUE' && (
              <button type="button" className="button add" onClick={handleAddPage}>
                + Add Page
              </button>)}
            <button className="button close" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {page === 'TITLE' && renderTitleEdit()}
            {page === 'BOARD' && renderBoardEdit()}
            {page === 'CLUE' && renderClueEdit()}

            <div className="field row">
              <button className="cancel-button" type="button" disabled={loading} onClick={() => {
                setIsOpen(false);
                setTempBoardData(boardData);
              }}>
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


  return (
    <>
      <button
        id="edit-tab"
        className="side-tab settings"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
      >
        <span className="tab-icon">&#9998;</span>
        <span className="tab-label">Edit Page</span>
      </button>
      { isOpen && renderModal()}
    </>
  );
};

export default EditModal;
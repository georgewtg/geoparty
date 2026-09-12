import { useState } from 'react';
import { MediaItem } from './MediaItem';
import type { ClueData, PageData } from '../types/board';
import { useAuth } from '../context/AuthContext';
import { useShortcut } from '../hooks/useShortcut';
import './Text.css'


interface ClueProps {
  clueData: ClueData;
  onNext: () => void;
  disabled?: boolean;
  hostId?: string;
  roomId?: string;
  pageIndex?: number;
  onPageChange?: (newIndex: number) => void;
};

const Clue: React.FC<ClueProps> = ({
  clueData,
  onNext,
  disabled = false,
  hostId = '',
  roomId = '',
  pageIndex: externalPageIdx,
  onPageChange
}) => {
  const { user } = useAuth();
  const [localPageIdx, setLocalPageIdx] = useState(0);
  const currPageIdx = externalPageIdx ?? localPageIdx;
  
  
  const updatePageIndex = (newIndex: number) => {
    if (disabled && externalPageIdx !== undefined) return;

    if (onPageChange) onPageChange(newIndex);
    else setLocalPageIdx(newIndex);
  };
  
  const handleNext = () => {
    if (disabled) return;
    const pages = clueData.pages;
    if (!Array.isArray(pages) || !pages || pages.length === 0) return;
    if (currPageIdx < (pages.length - 1)) updatePageIndex(currPageIdx + 1);
  }

  const handlePrevious = () => {
    if (disabled) return;
    if (currPageIdx > 0) updatePageIndex(currPageIdx - 1);
  }

  // keyboard shortcut
  useShortcut({
    Escape: () => !disabled && onNext(),
    ArrowLeft: handlePrevious,
    ArrowRight: handleNext,
    // ' ': handleNext
  });

  const renderClue = (pages: PageData[][], fallbackText: string) => {
    if (!Array.isArray(pages) || !pages || pages.length === 0) return <span>{fallbackText}</span>;
    const items = pages[currPageIdx];
    if (!Array.isArray(items) || !items || items.length === 0) return <span>{fallbackText}</span>;
    // const assetPath = "http://localhost:8000/assets";
    const basePath = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}`;
    const assetPath = `upload/geoparty/assets/${(hostId !== '') ? hostId : user?.id}`;

    return items.map((element, index) => {
      const mediaId = `page-${currPageIdx}-item-${index}`;
      const mediaSrc = `${basePath}/video/${assetPath}/${element.value}`;

      switch (element.type) {
        case 'IMAGE':
          return <img key={index} src={`${basePath}/image/${assetPath}/${element.value}`} alt="clue" />;
        case 'AUDIO':
        case 'VIDEO':
          return (
            <MediaItem
              key={mediaId}
              roomId={roomId!}
              mediaId={mediaId}
              type={element.type}
              src={mediaSrc}
              disabled={disabled}
            />
          );
        default:
          return <span key={index}>{element.value}</span>;
      }
    });
  }

  return (
    <div className='page-container'>
      {/* Top Left Return Button */}
      <button
        className="nav-btn top-left"
        onClick={onNext}
        aria-label="Go back"
        disabled={disabled}
      >
        ➜
      </button>

      {/* Question Score */}
      <div className='score-display'>
        {clueData.score ?? ""}
      </div>

      {/* Left Arrow / Previous Page */}
      <button
        className="nav-btn left"
        onClick={handlePrevious}
        disabled={currPageIdx === 0 || disabled}
        aria-label="Previous page"
      >
        &#10094;
      </button>

      {/* Clue Content */}
      <div className='text'>
        {renderClue(clueData.pages, "No Content Found")}
      </div>

      {/* Right Arrow / Next Page */}
      <button 
        className="nav-btn right"
        onClick={handleNext}
        disabled={
          currPageIdx === (clueData.pages.length - 1) ||
          !Array.isArray(clueData.pages) || !clueData.pages || clueData.pages.length === 0 ||
          disabled
        }
        aria-label="Next page"
      >
        &#10095;
      </button>
    </div>
  );
};


export default Clue;
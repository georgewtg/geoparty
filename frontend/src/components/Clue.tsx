import { useState } from 'react';
import type { ClueData, PageData } from '../types/board';
import { useAuth } from '../context/AuthContext';
import { useVolume } from '../context/VolumeContext';
import './Text.css'


type ClueProps = {
  clueData: ClueData;
  onNext: () => void;
};

const Clue: React.FC<ClueProps> = ({ clueData, onNext }) => {
  const { user } = useAuth();
  const { getAudioVolume } = useVolume();
  const mediaRef = (node: HTMLMediaElement | null) => {
    if (node) node.volume = getAudioVolume();
  }
  const [currPageIdx, setCurrPageIdx] = useState(0);
  
  const handleNext = () => {
    const pages = clueData.pages;
    if (!Array.isArray(pages) || !pages || pages.length === 0) onNext();
    else if (currPageIdx < (pages.length - 1)) setCurrPageIdx((prev) => prev + 1);
    else onNext();
  }

  const handlePrevious = () => {
    if (currPageIdx > 0) setCurrPageIdx((prev) => prev - 1);
  }

  const renderClue = (pages: PageData[][], fallbackText: string) => {
    if (!Array.isArray(pages) || !pages || pages.length === 0) return <span>{fallbackText}</span>;
    const items = pages[currPageIdx];
    if (!Array.isArray(items) || !items || items.length === 0) return <span>{fallbackText}</span>;
    // const assetPath = "http://localhost:8000/assets";
    const basePath = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}`;
    const assetPath = `upload/geoparty/assets/${user?.id}`;

    return items.map((element, index) => {
      switch (element.type) {
        case 'IMAGE':
          console.log(`${assetPath}/${element.value}`)
          return <img key={index} src={`${basePath}/image/${assetPath}/${element.value}`} alt="clue" />;
        case 'AUDIO':
          return (
            <audio key={index} ref={mediaRef} controls src={`${basePath}/video/${assetPath}/${element.value}`}>
              Your browser does not support the audio element.
            </audio>
          );
        case 'VIDEO':
          return (
            <video key={index} ref={mediaRef} controls src={`${basePath}/image/${assetPath}/${element.value}`}>
              Your browser does not support the video tag.
            </video>
          );
        default:
          return <span key={index}>{element.value}</span>;
      }
    });
  }

  return (
    <div className='page-container'>
      {/* Question Score */}
      <div className='score-display'>
        {clueData.score ?? ""}
      </div>

      {/* Left Arrow / Previous Page */}
      <button
        className="nav-btn left"
        onClick={handlePrevious}
        disabled={currPageIdx === 0}
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
        aria-label="Next page"
      >
        &#10095;
      </button>
    </div>
  );
};


export default Clue;
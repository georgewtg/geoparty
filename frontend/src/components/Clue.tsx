import { useEffect } from 'react';
import type { ClueData, PageData } from '../types/board';
import { useAuth } from '../context/AuthContext';
import './Text.css'


type ClueProps = {
  clueData: ClueData;
  isShowAnswer: boolean;
  setIsShowAnswer: (status: boolean) => void;
  onNext: () => void;
};


const Clue: React.FC<ClueProps> = ({ clueData, isShowAnswer, setIsShowAnswer, onNext }) => {
  const { user } = useAuth();

  useEffect(() => {
    setIsShowAnswer(false);
  }, [setIsShowAnswer]);
  
  const handleNext = () => {
    if (!isShowAnswer) setIsShowAnswer(true);
    else onNext();
  }

  const handlePrevious = () => {
    if (isShowAnswer) setIsShowAnswer(false);
  }

  const renderClue = (items: PageData[], fallbackText: string) => {
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
            <audio key={index} controls src={`${basePath}/video/${assetPath}/${element.value}`}>
              Your browser does not support the audio element.
            </audio>
          );
        case 'VIDEO':
          return (
            <video key={index} controls src={`${basePath}/image/${assetPath}/${element.value}`}>
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
        disabled={!isShowAnswer}
        aria-label="Previous page"
      >
        &#10094;
      </button>

      {/* Clue Content */}
      <div className='text'>
        {!isShowAnswer ? (
          renderClue(clueData.question, "No Questions Found")
        ) : (
          renderClue(clueData.answer, "No Answers Found")
        )}
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
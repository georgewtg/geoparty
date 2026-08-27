import { useState} from 'react';
import './Text.css'
import type { ClueData, PageData } from '../types/board';


interface ClueProps {
  clueData: ClueData;
  onNext: () => void;
}


const Clue: React.FC<ClueProps> = ({ clueData, onNext }) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const handleNext = () => {
    if (!showAnswer) setShowAnswer(true);
    else onNext();
  }

  const handlePrevious = () => {
    if (showAnswer) setShowAnswer(false);
  }

  const renderClue = (items: PageData[], fallbackText: string) => {
    if (!items || items.length === 0) return <span>{fallbackText}</span>;

    return items.map((element, index) => {
      switch (element.type) {
        case 'IMAGE':
          return <img key={index} src={`../boards/asset/${element.value}`} alt="clue" />;
        case 'AUDIO':
          return (
            <audio key={index} controls src={`../boards/asset/${element.value}`}>
              Your browser does not support the audio element.
            </audio>
          );
        case 'VIDEO':
          return (
            <video key={index} controls src={`../boards/asset/${element.value}`}>
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
        ${clueData.score ?? ""}
      </div>

      {/* Left Arrow / Previous Page */}
      <button
        className="nav-btn left"
        onClick={handlePrevious}
        disabled={!showAnswer}
        aria-label="Previous page"
      >
        &#10094;
      </button>

      {/* Clue Content */}
      <div className='text'>
        {!showAnswer ? (
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
}


export default Clue;
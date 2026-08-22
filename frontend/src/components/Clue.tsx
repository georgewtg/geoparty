import { useRef, useState} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../contexts/gameContext';
import './Text.css'


const Clue: React.FC = () => {
  const navigate = useNavigate();
  const { boardData } = useGame();
  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get('cat');
  const scoreParam = searchParams.get('score');
  const score = scoreParam !== null ? parseInt(scoreParam, 10) : null;

  const category = boardData.categories.find((cat) => cat.id.toLowerCase() === categoryId?.toLowerCase());
  const clue = (category && score !== null) ? category.clues.find((clue) => clue.score === score) : null;

  
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const handleMouseDown = (e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // calculate distance between mouse press down and mouse release up
    const deltaX = Math.abs(e.clientX - startPos.current.x);
    const deltaY = Math.abs(e.clientY - startPos.current.y);

    // if move more than 5px, user was clicking and dragging to select text
    if (deltaX > 5 || deltaY > 5) {
      return; // ignore navigate click
    }

    if (!showAnswer) {
      setShowAnswer(true);
    } else {
      navigate('/board');
    }
  };

  return (
    <div className='page-container' onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      {/* Question Score */}
      <div className='score-display'>
        ${clue?.score ?? ""}
      </div>

      <div className='text'>
        {!showAnswer ? (
          clue?.question?.map((element, index) => {
            if (element.type === "image") {
              return (
                <img key={index} src={`../boards/asset/${element.value}`} alt="clue" />
              );
            } else if (element.type === "audio") {
              return (
                <audio key={index} controls src={`../boards/asset/${element.value}`}>
                  Your browser does not support the audio element.
                </audio>
              );
            } else if (element.value) {
              return <span key={index}>{element.value}</span>;
            } else {
              return <span key={index}>No Question Found</span>;
            }
          })
        ) : (
          clue?.answer?.map((element, index) => {
            if (element.type === "image") {
              return (
                <img key={index} src={`../boards/asset/${element.value}`} alt="clue" />
              );
            } else if (element.type === "audio") {
              return (
                <audio key={index} controls src={`../boards/asset/${element.value}`}>
                  Your browser does not support the audio element.
                </audio>
              );
            } else if (element.value) {
              return <span key={index}>{element.value}</span>;
            } else {
              return <span key={index}>No Answer Found</span>;
            }
          })
        )}
      </div>
    </div>
  );
}


export default Clue;
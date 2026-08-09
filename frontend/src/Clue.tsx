import { useRef, useState} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from './gameContext';
import './Text.css'

const Clue = () => {
  const navigate = useNavigate();
  const { boardData } = useGame();
  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get('cat');
  const valueParam = searchParams.get('value');
  const value = valueParam !== null ? parseInt(valueParam, 10) : null;

  const category = boardData.categories.find((cat) => cat.id.toLowerCase() === categoryId?.toLowerCase());
  const clue = (category && value !== null) ? category.clues.find((clue) => clue.value === value) : null;

  
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
      <div className='text'>
        {!showAnswer ? (
          clue?.question ?? "No Question Found"
        ) : (
          clue?.answer ?? "No Answer Found"
        )}
      </div>
    </div>
  )
}

export default Clue;
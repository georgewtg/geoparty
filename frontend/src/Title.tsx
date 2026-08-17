import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from './gameContext';
import './Text.css';


const Title: React.FC = () => {
  const navigate = useNavigate();
  const { boardData } = useGame();
  const title = boardData.title;

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

    navigate('/board');
  };

  return (
    <div className='page-container' onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className='text'>
        {title ?? "JEOPARDY"}
      </div>
    </div>
  )
}


export default Title;
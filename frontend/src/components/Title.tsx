import { useRef } from 'react';
import './Text.css';


interface TitleProps {
  title: string;
  onNext: () => void;
}


const Title: React.FC<TitleProps> = ({ title, onNext }) => {
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

    onNext(); // go to next page
  };

  return (
    <div className='page-container' onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className='text'>
        {title ?? "GeoParty"}
      </div>
    </div>
  )
}


export default Title;
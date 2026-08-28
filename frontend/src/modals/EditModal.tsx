import React, { useRef, useState } from "react";
import "./EditModal.css"


type EditModalProps = {
  onClick: () => void;
};


const EditModal: React.FC<EditModalProps> = ({ onClick }) => {
  const [pos, setPos] = useState({ x: 20, y: 20 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;

    // get bounding rectangle of button
    const rect = buttonRef.current?.getBoundingClientRect();

    // store mouse drag offset
    dragOffset.current = {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };

    const handleMouseMove = (e: MouseEvent) => {
      isDragging.current = true;
      // get edit button size
      const btnWidth = buttonRef.current?.offsetWidth ?? 50;
      const btnHeight = buttonRef.current?.offsetHeight ?? 50;

      // calculate max boundaries
      const maxX = window.innerWidth - btnWidth;
      const maxY = window.innerHeight - btnHeight;
      
      // calculate next raw position
      const nextX = e.clientX - dragOffset.current.x;
      const nextY = e.clientY - dragOffset.current.y;

      setPos(({ // clamp position within boundaries
        x: Math.max(0, Math.min(nextX, maxX)),
        y: Math.max(0, Math.min(nextY, maxY))
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  return (
    <button
      className="edit-button"
      ref={buttonRef}
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      aria-label="Edit Clue"
    >
      &#9998; {/* Pen / Edit Icon */}
    </button>
  )
}

export default EditModal;
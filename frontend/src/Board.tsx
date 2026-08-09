import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from './gameContext';
import './Board.css';

interface BoardProps {
  rows?: number
  cols?: number
}

const Board: React.FC<BoardProps> = ({ rows = 5, cols = 6 }) => {
  const navigate = useNavigate();
  const { boardData } = useGame();
  const categories = boardData.categories;
  const totalCells = rows * cols;

  // Track Clicked Cells
  const [visitedCells, setVisitedCells] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('visitedClues');
    return saved ? JSON.parse(saved) : [];
  });

  const handleClick = (colIndex: number, value: number) => {
    const cellId = `${colIndex}-${value}`;

    if (!visitedCells.includes(cellId)) {
      const updated = [...visitedCells, cellId];
      setVisitedCells(updated);
      sessionStorage.setItem('visitedClues', JSON.stringify(updated));
    }

    const categoryId = categories[colIndex].id;

    navigate(`/clue?cat=${categoryId}&value=${value}`)
  }

  return (
    <>
      {/* Categories */}
      <div className='grid-container category'>
        {Array.from({ length: cols }).map((_, index) => {
          const category = categories[index];
          
          return (
            <div key={category?.id ?? index} className="grid-cell category">
              <span>{category?.name ?? `Category ${index + 1}`}</span>
            </div>
          )
        })}
      </div>

      {/* Board Values */}
      <div className="grid-container" style={{ '--rows': rows, '--cols': cols, } as React.CSSProperties}>
        {Array.from({ length: totalCells }).map((_, index) => {
          const rowIndex = Math.floor(index / cols);
          const colIndex = index % cols;
          const value = (rowIndex + 1) * 200;

          const cellId = `${colIndex}-${value}`;
          const isVisited = visitedCells.includes(cellId);

          return (
            <div
              key={index}
              className={`grid-cell ${isVisited ? 'visited' : 'clickable'}`}
              onClick={() => handleClick(colIndex, value)}
            >
                <span>{value}</span>
            </div>
          );
        })}
      </div>
    </>
  )
}

export default Board;
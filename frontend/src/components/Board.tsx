import React, { useState } from 'react';
import type { BoardData, ClueData } from '../types/board';
import './Board.css';


type BoardProps = {
  boardData: BoardData
  onSelectClue: (clueData: ClueData, catIdx: number, clueIdx: number, final?: boolean) => void;
  defaultRows?: number;
  defaultCols?: number;
};


const Board: React.FC<BoardProps> = ({ boardData, onSelectClue, defaultRows = 5, defaultCols = 6 }) => {
  const categories = boardData.categories;
  const rows = categories[0].clues.length || defaultCols;
  const cols = categories.length || defaultRows;
  const totalCells = rows * cols;

  // Track Clicked Cells
  const [visitedCells, setVisitedCells] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('visitedClues');
    return saved ? JSON.parse(saved) : [];
  });

  const handleClick = (colIndex: number, rowIndex: number) => {
    const cellId = `${colIndex}-${rowIndex}`;

    if (!visitedCells.includes(cellId)) {
      const updated = [...visitedCells, cellId];
      setVisitedCells(updated);
      sessionStorage.setItem('visitedClues', JSON.stringify(updated));
    }

    const selectedCategory = categories[colIndex];
    const selectedClue = selectedCategory.clues[rowIndex];
    if (selectedClue) onSelectClue(selectedClue, colIndex, rowIndex);
  }

  const handleClickFinal = () => {
    const cellId = 'final';

    if (!visitedCells.includes(cellId)) {
      const updated = [...visitedCells, cellId];
      setVisitedCells(updated);
      sessionStorage.setItem('visitedClues', JSON.stringify(updated));
    }

    const selectedClue = boardData.final_jeopardy;
    if (selectedClue) onSelectClue(selectedClue, -1, -1, true);
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
          const score = categories?.[colIndex]?.clues?.[rowIndex]?.score ?? (rowIndex + 1) * 200;

          const cellId = `${colIndex}-${rowIndex}`;
          const isVisited = visitedCells.includes(cellId);

          return (
            <div
              key={index}
              className={`grid-cell ${isVisited ? 'visited' : 'clickable'}`}
              onClick={() => handleClick(colIndex, rowIndex)}
            >
                <span>{score}</span>
            </div>
          );
        })}

        {/* Final Jeopardy */}
        <div
          className="grid-cell final-box clickable"
          onClick={handleClickFinal}
        >
          <span>Final GeoParty</span>
        </div>
      </div>
    </>
  );
};


export default Board;
import React, { memo, useMemo, useState } from 'react';
import type { BoardData } from '../types/board';
import './Board.css';


interface BoardProps {
  boardData: BoardData
  onSelectClue: (catIdx: number, clueIdx: number) => void;
  disabled?: boolean;
  visitedCells?: string[];
  onCellClick?: (cellId: string) => void;
  defaultRows?: number;
  defaultCols?: number;
};

interface CellProps {
  score: number | string;
  isVisited: boolean;
  isDisabled: boolean;
  isFinal?: boolean;
  onClick: () => void;
};


const Cell = memo(({ score, isVisited, isDisabled, isFinal, onClick }: CellProps) => {
  const baseClass = isFinal ? 'grid-cell final-box' : 'grid-cell';
  const statusClass = isVisited ? 'visited' : 'clickable';
  const disabledClass = isDisabled ? 'disabled' : '';

  return (
    <div
      className={`${baseClass} ${statusClass} ${disabledClass}`}
      onClick={onClick}
    >
      <span>{score}</span>
    </div>
  );
});
Cell.displayName = 'Cell';


const Board: React.FC<BoardProps> = ({
  boardData,
  onSelectClue,
  disabled = false,
  visitedCells,
  onCellClick,
  defaultRows = 5,
  defaultCols = 6 }) => {
  const categories = boardData.categories;
  const rows = categories[0].clues.length || defaultCols;
  const cols = categories.length || defaultRows;
  const totalCells = rows * cols;

  // Track Clicked Cells
  const [localVisitedCells, setLocalVisitedCells] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('visitedCells');
    return saved ? JSON.parse(saved) : [];
  });
  const activeVisitedCells = visitedCells ?? localVisitedCells;

  const visitedSet = useMemo(
    () => new Set(activeVisitedCells),
    [activeVisitedCells]
  );

  const markVisitedCell = (cellId: string) => {
    onCellClick?.(cellId);
    if (!visitedCells && !localVisitedCells.includes(cellId)) {
      const updated = [...localVisitedCells, cellId];
      setLocalVisitedCells(updated);
      sessionStorage.setItem('visitedCells', JSON.stringify(updated));
    }
  }

  const handleClick = (colIndex: number, rowIndex: number) => {
    if (disabled) return;

    const cellId = `${colIndex}-${rowIndex}`;
    markVisitedCell(cellId);
    onSelectClue(colIndex, rowIndex);
  }

  const handleClickFinal = () => {
    if (disabled) return;

    markVisitedCell('final');
    onSelectClue(-1, -1);
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

          return (
            <Cell
              key={cellId}
              score={score}
              isVisited={visitedSet.has(cellId)}
              isDisabled={disabled}
              onClick={() => handleClick(colIndex, rowIndex)}
            />
          );
        })}

        {/* Final Jeopardy */}
        <Cell
          score="Final GeoParty"
          isVisited={visitedSet.has('final')}
          isDisabled={disabled}
          isFinal
          onClick={handleClickFinal}
        />
      </div>
    </>
  );
};


export default Board;
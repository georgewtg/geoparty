import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from './gameContext';
import './Board.css';


interface BoardProps {
  defaultRows?: number
  defaultCols?: number
}

interface Player {
  id: number
  name: string
  score: number
}


const Board: React.FC<BoardProps> = ({ defaultRows = 5, defaultCols = 6 }) => {
  const navigate = useNavigate();
  const { boardData } = useGame();
  const categories = boardData.categories;
  const rows = categories[0].clues.length || defaultCols;
  const cols = categories.length || defaultRows;
  const totalCells = rows * cols;

  // Track Clicked Cells
  const [visitedCells, setVisitedCells] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('visitedClues');
    return saved ? JSON.parse(saved) : [];
  });

  const handleClick = (colIndex: number, score: number) => {
    const cellId = `${colIndex}-${score}`;

    if (!visitedCells.includes(cellId)) {
      const updated = [...visitedCells, cellId];
      setVisitedCells(updated);
      sessionStorage.setItem('visitedClues', JSON.stringify(updated));
    }

    const categoryId = categories[colIndex].id;

    navigate(`/clue?cat=${categoryId}&score=${score}`)
  }

  // Initialize Player State
  const [players, setPlayers] = useState<Player[]>(() => {
    const savedPlayers = sessionStorage.getItem('players');
    if (savedPlayers) {
      try {
        return JSON.parse(savedPlayers);
      } catch (e) {
        console.error('Failed to parse players from sessionStorage', e);
      }
    }

    return Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      score: 0,
    }));
  });

  const playerCount = players.length;

  useEffect(() => {
    sessionStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  // Handler to update score on typing
  const handleScoreChange = (id: number, newScore: string) => {
    const parsedScore = parseInt(newScore, 10);

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, score: isNaN(parsedScore) ? 0 : parsedScore } : player
      )
    );
  };

  // Handler to update player name
  const handleNameChange = (id: number, newName: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, name: newName } : player
      )
    );
  };

  // Handler to dynamically add/remove players
  const updatePlayerCount = (newCount: number) => {
    if (newCount < 1) return;
    
    setPlayers((prev) => {
      const oldCount = prev.length;
      if (newCount > oldCount) {
        // Add new players
        const extraPlayers: Player[] = Array.from(
          { length: newCount - oldCount },
          (_, i) => ({
            id: oldCount + i + 1,
            name: `Player ${oldCount + i + 1}`,
            score: 0,
          })
        );
        return [...prev, ...extraPlayers];
      } else {
        // Trim players
        return prev.slice(0, newCount);
      }
    });
  };

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

          const cellId = `${colIndex}-${score}`;
          const isVisited = visitedCells.includes(cellId);

          return (
            <div
              key={index}
              className={`grid-cell ${isVisited ? 'visited' : 'clickable'}`}
              onClick={() => handleClick(colIndex, score)}
            >
                <span>{score}</span>
            </div>
          );
        })}
      </div>

      {/* Score Board Footer */}
      <div className="scoreboard-container">
        <div className="player-count-controls">
          <span>Players:</span>
          <button onClick={() => updatePlayerCount(playerCount - 1)}>-</button>
          <span>{playerCount}</span>
          <button onClick={() => updatePlayerCount(playerCount + 1)}>+</button>
        </div>

        <div className="scores-grid">
          {players.map((player) => (
            <div key={player.id} className="player-score-card">
              {/* Name */}
              <input
                type="text"
                className="player-name-input"
                value={player.name}
                onChange={(e) => handleNameChange(player.id, e.target.value)}
              />

              {/* Score */}
              <input
                type="number"
                className="player-score-input"
                value={player.score}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}


export default Board;
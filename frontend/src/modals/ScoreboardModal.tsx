import { useEffect, useState } from "react";
import './ScoreboardModal.css'

type Player = {
  id: number;
  name: string;
  score: number;
};

const ScoreBoard: React.FC = () => {
  // initialize Player State
  const [players, setPlayers] = useState<Player[]>(() => {
    const savedPlayers = sessionStorage.getItem('players');
    if (savedPlayers) {
      try {
        return JSON.parse(savedPlayers);
      } catch (error) {
        console.error('Failed to parse players from sessionStorage', error);
      }
    }

    return Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      score: 0,
    }));
  });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const playerCount = players.length;

  useEffect(() => {
    sessionStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  // update score on typing
  const handleScoreChange = (id: number, newScore: string) => {
    const parsedScore = parseInt(newScore, 10);

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, score: isNaN(parsedScore) ? 0 : parsedScore } : player
      )
    );
  };

  // update player name
  const handleNameChange = (id: number, newName: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, name: newName } : player
      )
    );
  };

  // dynamically add/remove players
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
        // trim players
        return prev.slice(0, newCount);
      }
    });
  };

  return (
    <div className="scoreboard-container">
      <div
        className="scoreboard-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
      >
        <div />
        <span>{isCollapsed ? "▲" : "▼"}</span>
        <div className="player-count-controls" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => updatePlayerCount(playerCount - 1)}>-</button>
          <span>{playerCount}</span>
          <button onClick={() => updatePlayerCount(playerCount + 1)}>+</button>
        </div>
      </div>

      {!isCollapsed && (
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
      )}
    </div>
  );
};

export default ScoreBoard;
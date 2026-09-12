import { useState, type Dispatch, type SetStateAction } from "react";
import type { PlayerItem } from "../types/multiplayer";
import './ScoreboardModal.css'

interface ScoreboardModalProps {
  hostName: string;
  roomId: string;
  players: Record<string, PlayerItem>;
  setPlayers: Dispatch<SetStateAction<Record<string, PlayerItem>>>;
  disabled?: boolean;
  onUpdateScore?: (playerId: string, score: number) => void;
};

const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ hostName, roomId, players, setPlayers, disabled = false, onUpdateScore }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // update score locally on typing
  const handleScoreChange = (playerId: string, newScore: string) => {
    const parsedScore = parseInt(newScore, 10);

    setPlayers((prev) => {
      if (!prev[playerId]) return prev;

      return {
        ...prev,
        [playerId]: {
          ...prev[playerId],
          score: parsedScore
        }
      };
    });
  };

  return (
    <div className="scoreboard-container">
      <div className="scoreboard-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
      >
        <span className="scoreboard-host">Host: {hostName}</span>
        <span>{isCollapsed ? "▲" : "▼"}</span>
        <span className="scoreboard-host">Code: {roomId}</span>
      </div>

      {!isCollapsed && (
        <div className="scores-grid">
          {Object.entries(players).map(([playerId, player]) => (
            <div key={playerId} className="player-score-card">
              {/* Name */}
              <span className="player-name">{player.username}</span>

              {/* Score */}
              <input
                type="number"
                className="player-score-input"
                value={player.score}
                onChange={(e) => handleScoreChange(playerId, e.target.value)}
                onBlur={() => onUpdateScore?.(playerId, player.score)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoreboardModal;
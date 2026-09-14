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
  const [copied, setCopied] = useState(false);

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

  // copy toom code when clicked
  const handleCopy = async (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset feedback after 2s
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
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
        <span className="scoreboard-code" onClick={handleCopy}>Code: {roomId} {copied ? 'Copied!' : ''}</span>
      </div>

      {!isCollapsed && (
        <div className="scores-grid">
          {Object.entries(players).map(([playerId, player]) => (
            <div key={playerId} className="player-score-card">
              {/* Name */}
              <span className={`player-name${player.isConnected ? '' : ' disconnected'}`}>{player.username}{player.isConnected ? '' : ' ❌'}</span>

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
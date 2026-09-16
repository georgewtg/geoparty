import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { BuzzEvent } from '../types/multiplayer';
import { socket } from '../api/socket';
import { resetBuzzer, sendBuzzer, toggleBuzzerLock } from '../api/buzzer.api';
import './BuzzerModal.css'

interface BuzzerModalProps {
  roomId: string;
  username: string;

  buzzQueue: BuzzEvent[];
  setBuzzQueue: Dispatch<SetStateAction<BuzzEvent[]>>;
  initialIsUnlocked?: boolean;

  isHost?: boolean;
};

const BuzzerModal: React.FC<BuzzerModalProps> = ({ roomId, username, buzzQueue=[], setBuzzQueue, initialIsUnlocked=true, isHost = false }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(initialIsUnlocked);
  const [hasBuzzed, setHasBuzzed] = useState(buzzQueue.some(queued => queued.name === username));

  useEffect(() => {
    const handleBuzzerSent = () => {
      setHasBuzzed(true);
    };

    const handleUpdateQueue = (queue: BuzzEvent[]) => {
      setBuzzQueue(queue);
    };

    const handleBuzzerState = (isUnlocked: boolean) => {
      setIsUnlocked(isUnlocked);
    };

    const handleBuzzerReseted = () => {
      setBuzzQueue([]);
      setHasBuzzed(false);
    };

    socket.on("buzzer_sent", handleBuzzerSent);
    socket.on("queue_updated", handleUpdateQueue);
    socket.on("buzzer_state_changed", handleBuzzerState);
    socket.on("buzzer_reseted", handleBuzzerReseted);

    return () => {
      socket.off("buzzer_sent", handleBuzzerSent);
      socket.off("update_queue", handleUpdateQueue);
      socket.off("buzzer_state_changed", handleBuzzerState);
      socket.off("buzzer_reseted", handleBuzzerReseted);
    };
  }, [setBuzzQueue]);

  const handleToggleLock = () => {
    if (!isHost) return;
    toggleBuzzerLock(roomId, !isUnlocked);
  };

  const handleResetBuzzer = () => {
    if (!isHost) return;
    resetBuzzer(roomId);
  };

  const handleBuzz = () => {
    if (hasBuzzed) return;
    sendBuzzer(roomId, username, Date.now())
  };

  return (
    <div className="buzzer-container">
      {isHost && (
        <>
          {/* Toggle Buzzer Lock Button */}
          <button className='button lock'
            onClick={handleToggleLock}
          >
            <span>{isUnlocked ? 'LOCK' : 'UNLOCK'}</span>
          </button>

          {/* Reset Buzzer Queue Button */}
          <button className='button reset'
            onClick={handleResetBuzzer}
          >
            <span>RESET</span>
          </button>
        </>
      )}

      {/* Buzzer Button */}
      {!isHost && (
        <button className={`button buzzer${!isUnlocked || hasBuzzed ? ' disabled' : ''}`}
          onClick={handleBuzz}
          disabled={!isUnlocked || hasBuzzed}
        >
          <span>{isUnlocked ? (hasBuzzed ? 'BUZZED' : 'BUZZ') : 'LOCKED'}</span>
        </button>
      )}
        
      {buzzQueue.length > 0 ? (
        buzzQueue.map((queued) => <span className='buzzer-name'>{queued.name}</span>)
      ) : (
        <span>EMPTY</span>
      )}
    </div>
  );
};

export default BuzzerModal;
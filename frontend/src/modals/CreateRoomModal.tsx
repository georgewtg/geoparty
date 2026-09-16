import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket, wakeSocket } from "../api/socket";
import { createRoom } from "../api/room.api";
import type { BoardListItem } from "../types/board";
import type { CreateRoomPayload } from "../types/multiplayer";
import { useAuth } from "../context/AuthContext";
import { useShortcut } from "../hooks/useShortcut";
import './Modal.css';

interface CreateRoomModalProps {
  boards: BoardListItem[];
  isOpen: boolean;
  onClose: () => void;
};

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ boards, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateRoomPayload>({
    board_id: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mouseDownTarget = useRef<EventTarget | null>(null);

  useShortcut({
    Escape: onClose
  }, isOpen);

  useEffect(() => { // wait for backend confirmation
    const handleRoomCreated = (roomId: string) => {
      setLoading(false);
      navigate(`/room/${roomId}`);
    };

    socket.on("room_created", handleRoomCreated);

    return () => {
      socket.off("room_created", handleRoomCreated);
    };
  }, [navigate]);

  if (!isOpen) return null; // close modal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("User must be logged in to create a room");
      await wakeSocket();
      if (!socket.connected) socket.connect();
      createRoom(user, formData.board_id, formData.password);

    } catch (error) {
      setError('Failed to create room');
      console.error(error);
    }
  };

  return (
    <div
      className="overlay"
      onMouseDown={(e) => mouseDownTarget.current = e.target}
      onClick={(e) => e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Room</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field row">
            <label htmlFor="board_id">Boards</label>
            <select
              id="board_id"
              name="board_id"
              required
              value={formData.board_id ?? ""}
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                -- Select Board --
              </option>
              {boards.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="text"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="field row">
            <button
              className="cancel-button"
              type="button"
              disabled={loading}
              onClick={() => {
                setFormData({
                  board_id: '',
                  password: ''
                });
                onClose();
              }}
            >
              Cancel
            </button>
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
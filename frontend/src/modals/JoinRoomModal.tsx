import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../api/socket";
import { joinRoom } from "../api/room.api";
import type { JoinRoomPayload } from "../types/multiplayer";
import { useAuth } from "../context/AuthContext";
import { useShortcut } from "../hooks/useShortcut";
import './Modal.css';

interface JoinRoomModalProps {
 isOpen: boolean;
  onClose: () => void;
};

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<JoinRoomPayload>({
    room_id: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mouseDownTarget = useRef<EventTarget | null>(null);

  useShortcut({
    Escape: onClose
  }, isOpen);

  useEffect(() => { // wait for backend confirmation
    const handleRoomJoined = () => {
      setLoading(false);
      navigate(`/room/${formData.room_id}`);
    };

    const handleRoomNotFound = () => {
      setLoading(false);
      setError("Room Not Found");
    };

    const handleWrongPassword = () => {
      setLoading(false);
      setError("Wrong Password");
    };

    socket.on("room_joined", handleRoomJoined);
    socket.on("room_not_found", handleRoomNotFound);
    socket.on("wrong_password", handleWrongPassword);

    return () => {
      socket.off("room_joined", handleRoomJoined);
      socket.off("room_not_found", handleRoomNotFound);
      socket.off("wrong_password", handleWrongPassword);
    };
  }, [navigate, formData]);

  if (!isOpen) return null; // close modal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("User must be logged in to join a room");
      joinRoom(user, formData.room_id, formData.password);

    } catch (error) {
      setError('Failed to join room');
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
          <h2>Join Room</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field row">
            <label htmlFor="room_id">Room ID</label>
            <input
              id="room_id"
              name="room_id"
              type="text"
              required
              value={formData.room_id}
              onChange={handleChange}
            />
          </div>

          <div className="field row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="text"
              required
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
                  room_id: '',
                  password: ''
                });
                onClose();
              }}
            >
              Cancel
            </button>
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;
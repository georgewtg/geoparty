import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutAccount } from '../api/account.api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useShortcut } from '../hooks/useShortcut';
import './SideModal.css'

const SettingsModal: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const { volume, setVolume } = useSettings();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const mouseDownTarget = useRef<EventTarget | null>(null);

  useShortcut({
    Escape: () => setIsOpen(false)
  }, isOpen);

  const handleLogout = async () => {
    try {
      await logoutAccount();
    } catch (error) {
      console.error("Logout Failed", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  const renderModal = () => {
    return (
      <div
        id="settings-modal"
        className="modal-backdrop"
        onMouseDown={(e) => mouseDownTarget.current = e.target}
        onClick={(e) => e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget && setIsOpen(false)}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>Settings</h2>
            <button id="close-button" className="close-button" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          <div className="settings-list">
            <div className='settings-item volume'>
              <div className='volume-label'>
                <label htmlFor='volume-slider'>Volume:</label>
                <label htmlFor='volume-slider'>{volume}%</label>
              </div>

              {/* volume slider */}
              <input
                id="volume-slider"
                className='volume-slider'
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>
          </div>
          <button className="button logout" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        id="settings-tab"
        className="side-tab"
        onClick={() => setIsOpen(true)}
      >
        <span className="tab-icon">⚙️</span>
        <span className="tab-label">Settings</span>
      </button>
      { isOpen && renderModal()}
    </>
  );
};

export default SettingsModal;
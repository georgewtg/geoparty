import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllTitles } from '../api/board.api';
import CreateBoardModal from '../modals/CreateBoardModal';
import CreateRoomModal from '../modals/CreateRoomModal';
import JoinRoomModal from '../modals/JoinRoomModal';
import type { BoardListItem } from '../types/board';
import './Menu.css';


type ModalType = 'CREATE_BOARD' | 'CREATE_ROOM' | 'JOIN_ROOM' | null;


const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // load boards (list of board titles)
  useEffect(() => {
    const loadTitles = async () => {
      try {
        setLoading(true);
        const data = await fetchAllTitles();
        setBoards(data.payload);
      } catch (error) {
        setError('Failed to fetch board data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    loadTitles();
  }, []);

  if (loading) return <div>Fetching Boards...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  }

  return (
    <>
      <div className='board-list'>
       <button onClick={() => setActiveModal('CREATE_BOARD')}>+ Create Board</button>
        {boards.map((board) => {
          return (
            <div key={board.id} className='board-card' onClick={() => handleClick(board.id)}>
              {board.name}
            </div>
          )
        })}
      </div>
      <div className='room-button-control'>
        <button onClick={() => setActiveModal('CREATE_ROOM')}>Create Room</button>
        <button onClick={() => setActiveModal('JOIN_ROOM')}>Join Room</button>
      </div>
      <CreateBoardModal
        isOpen={activeModal === 'CREATE_BOARD'}
        onClose={() => setActiveModal(null)}
      />
      <CreateRoomModal
        boards={boards}
        isOpen={activeModal === 'CREATE_ROOM'}
        onClose={() => setActiveModal(null)}
      />
      <JoinRoomModal
        isOpen={activeModal === 'JOIN_ROOM'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};


export default Menu;
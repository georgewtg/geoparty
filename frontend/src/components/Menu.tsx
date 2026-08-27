import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.css';
import { fetchAllTitles } from '../api/game.api';
import FloatingFormModal from '../modals/FloatingFormModal';
import type { GameListItem } from '../types/game';


const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<GameListItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // load boards (list of game titles)
  useEffect(() => {
    const loadTitles = async () => {
      try {
        setLoading(true);
        const data = await fetchAllTitles();
        setBoards(data.payload);
      } catch (error) {
        setError('Failed to fetch game data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    loadTitles();
  }, []);

  if (loading) return <div>Fetching Boards...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleClick = (boardId: number) => {
    navigate(`/game/${boardId}`);
  }

  return (
    <>
      <div className='board-list'>
        {boards.map((board) => {
          return (
            <div key={board.id} className='board-card' onClick={() => handleClick(board.id)}>
              {board.name}
            </div>
          )
        })}
       <button onClick={() => setIsModalOpen(true)}>+ Add Game</button>
       <FloatingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      </div>
    </>
  )
}


export default Menu;
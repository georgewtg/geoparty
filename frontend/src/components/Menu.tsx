import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllTitles } from '../api/board.api';
import CreateFormModal from '../modals/CreateFormModal';
import type { BoardListItem } from '../types/board';
import './Menu.css';


const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
       <button onClick={() => setIsModalOpen(true)}>+ Create Board</button>
        {boards.map((board) => {
          return (
            <div key={board.id} className='board-card' onClick={() => handleClick(board.id)}>
              {board.name}
            </div>
          )
        })}
       <CreateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
};


export default Menu;
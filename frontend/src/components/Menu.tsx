import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/gameContext';
import './Menu.css';


const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { boards, selectBoardByName } = useGame();

  const handleClick = (boardName: string) => {
    selectBoardByName(boardName);
    navigate('/title');
  }

  return (
    <>
      <div className='board-list'>
        {Object.entries(boards).map(([boardKey, boardData]) => {
          return (
            <div key={boardKey} className='board-card' onClick={() => handleClick(boardKey)}>
              {boardData.title || boardKey}
            </div>
          )
        })}
      </div>
    </>
  )
}


export default Menu;
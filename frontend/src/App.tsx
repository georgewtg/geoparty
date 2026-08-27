import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu';
import GameController from './components/GameController';
import './App.css';
import { CanvasEditor } from './components/CanvasEditor';


const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigate to="/menu" replace />} />
      <Route path='/menu' element={<Menu />} />
      <Route path='/game/:gameId' element={<GameController />} />
      <Route path='/test' element={<CanvasEditor />} />
    </Routes>
  )
}


export default App

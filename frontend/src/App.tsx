import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Title from './components/Title';
import Board from './components/Board';
import Clue from './components/Clue';
import './App.css';
import { CanvasEditor } from './components/CanvasEditor';


const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Menu />} />
      <Route path='/menu' element={<Menu />} />
      <Route path='/title' element={<Title />} />
      <Route path='/board' element={<Board />} />
      <Route path='/clue' element={<Clue />} />
      <Route path='/test' element={<CanvasEditor />} />
    </Routes>
  )
}


export default App

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Title from './Title';
import Board from './Board';
import Clue from './Clue';
import { FirstVisitRedirect } from './FirstVisitRedirect';
import './App.css';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<FirstVisitRedirect firstTimePath='/title' fallbackPath='/board'/>} />
      <Route path='/title' element={<Title />} />
      <Route path='/board' element={<Board />} />
      <Route path='/clue' element={<Clue />} />
    </Routes>
  )
}

export default App

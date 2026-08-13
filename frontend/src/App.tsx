import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Menu from './Menu';
import Title from './Title';
import Board from './Board';
import Clue from './Clue';
import { FirstVisitRedirect } from './FirstVisitRedirect';
import './App.css';


const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<FirstVisitRedirect firstTimePath='/menu' fallbackPath='/board'/>} />
      <Route path='/menu' element={<Menu />} />
      <Route path='/title' element={<Title />} />
      <Route path='/board' element={<Board />} />
      <Route path='/clue' element={<Clue />} />
    </Routes>
  )
}


export default App

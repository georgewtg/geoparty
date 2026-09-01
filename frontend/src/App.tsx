import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Menu from './components/Menu';
import Login from './components/Login';
import Register from './components/Register';
import BoardController from './components/BoardController';
import { CanvasEditor } from './components/CanvasEditor';
import './App.css';


const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigate to="/menu" replace />} />

      {/* accessible only if not logged in */}
      <Route element={<PublicOnlyRoute />}>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Route>
      
      {/* accessible only if logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path='/menu' element={<Menu />} />
        <Route path='/board/:boardId' element={<BoardController />} />
        <Route path='/test' element={<CanvasEditor />} />
      </Route>
    </Routes>
  )
}


export default App

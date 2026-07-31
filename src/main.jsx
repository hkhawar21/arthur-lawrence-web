import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import PortfolioNew from './pages/Portfolio/PortfolioNew.jsx'
import PortfolioEdit from './pages/Portfolio/PortfolioEdit.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import { useAuthStore } from './store/auth-store'

useAuthStore.getState().hydrate()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio/new"
          element={
            <ProtectedRoute>
              <PortfolioNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio/:id/edit"
          element={
            <ProtectedRoute>
              <PortfolioEdit />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

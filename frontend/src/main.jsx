import '@/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from '@/App'  // ✅ Импортируем App

import HomePage from '@/pages/HomePage'
import ParseVacancies from '@/pages/ParseVacancies'
import SearchVacansy from '@/pages/SearchVacansy'
import ExperimentForm from '@/pages/ExperimentForm'
import UserRegistration from '@/pages/UserRegistration'
import LoginPage from '@/pages/LoginPage'
import FavoritesPage from './pages/FavoritesPages'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from '@/components/ProtectedRoute'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
        <Routes>
            {/* Публичные */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<UserRegistration />} />

            {/* С Navbar */}
            <Route path="/" element={<App />}>
                <Route index element={<HomePage />} />
                <Route path="parser" element={<ParseVacancies />} />
                <Route path="search" element={<SearchVacansy />} />
                <Route path="experiments" element={<ExperimentForm />} />
            {/* Защищенные */}
                <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>}/>
                <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}/>

            </Route>
        </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
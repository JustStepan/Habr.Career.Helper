import '@/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from '@/App'  // ✅ Импортируем App

import HomePage from '@/pages/HomePage';
// import ParseVacancies from '@/pages/ParseVacancies'
import SearchVacancies from '@/pages/SearchVacancies';
import ExperimentForm from '@/pages/ExperimentForm'
import UserRegistration from '@/pages/UserRegistration';
import LoginPage from '@/pages/LoginPage';
import FavoritesPage from './pages/FavoritesPages';
import ProfilePage from './pages/ProfilePage';
import LLMSearchPage from './pages/LLMSearchPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import DetailVacancyPage from '@/pages/DetailVacancyPage';
import StatisticsPage from '@/pages/StatisticsPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/habr-vacancies">
        <Routes>
            {/* Публичные */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<UserRegistration />} />

            {/* С Navbar */}
            <Route path="/" element={<App />}>
                <Route index element={<HomePage />} />
                {/* <Route path="parser" element={<ParseVacancies />} /> */}
                <Route path="search" element={<SearchVacancies />} />
                <Route path="/vacancy/:id" element={<DetailVacancyPage type="regular" />} />
                <Route path="statistics" element={<StatisticsPage />} />
                {/* <Route path="experiments" element={<ExperimentForm />} /> */}
            {/* Защищенные */}
                <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>}/>
                <Route path="favorite/:id" element={<ProtectedRoute><DetailVacancyPage type="favorite"  /></ProtectedRoute>}/>
                <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}/>
                <Route path="llm-search" element={<ProtectedRoute><LLMSearchPage /></ProtectedRoute>}/>

            </Route>
        </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
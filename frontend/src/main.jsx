import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from '@/App'  // ✅ Импортируем App
import HomePage from '@/pages/HomePage'
import ParseVacancies from '@/pages/ParseVacancies'
import SearchVacansy from '@/pages/SearchVacansy'
import ExperimentForm from '@/pages/ExperimentForm'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ✅ App — родительский маршрут (Layout) */}
        <Route path="/" element={<App />}>
          {/* ✅ Дочерние маршруты — страницы */}
          <Route index element={<HomePage />} />
          <Route path="parser" element={<ParseVacancies />} />
          <Route path="search" element={<SearchVacansy />} />
          <Route path="experiments" element={<ExperimentForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
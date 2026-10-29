import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudySetProvider } from './context/StudySetContext';
import { QuizProvider } from './context/QuizContext';
import AmbientBackground from './components/AmbientBackground';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CreateSetPage from './pages/CreateSetPage';
import StudyResultsPage from './pages/StudyResultsPage';
import QuizPage from './pages/QuizPage';
import QuizScorePage from './pages/QuizScorePage';

function App() {
  return (
    <StudySetProvider>
    <QuizProvider>
      <BrowserRouter>
        <AmbientBackground />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create" element={<CreateSetPage />} />
          <Route path="/results" element={<StudyResultsPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/score" element={<QuizScorePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QuizProvider>
    </StudySetProvider>
  );
}

export default App;

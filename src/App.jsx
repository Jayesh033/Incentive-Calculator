import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FebNonTermPage from './pages/FebNonTermPage';
import FebTermPage from './pages/FebTermPage';
import JanNonTermPage from './pages/JanNonTermPage';
import JanTermSMPage from './pages/JanTermSMPage';
import JanTermOutsourcePage from './pages/JanTermOutsourcePage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator/feb/nonterm/:type" element={<FebNonTermPage />} />
        <Route path="/calculator/feb/term/:type" element={<FebTermPage />} />
        <Route path="/calculator/jan/nonterm/:type" element={<JanNonTermPage />} />
        <Route path="/calculator/jan/term/sm/:type" element={<JanTermSMPage />} />
        <Route path="/calculator/jan/term/outsource/:type" element={<JanTermOutsourcePage />} />
      </Routes>
    </HashRouter>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import MainLayout1 from './components/homepage';
import AIAssistance from './components/AIAssistance';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainLayout1 />} />
          <Route path="/ai-assistance" element={<MainLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



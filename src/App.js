import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyceliumMixCalculator from './components/MyceliumMixCalculator';
import CalculatorsPage from './components/CalculatorsPage';
import SporeFinderPage from './components/SporeFinderPage';
import SuppliersPage from './components/SuppliersPage';
import BackgroundContainer from './components/BackgroundContainer';
import Menu from './components/Menu';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen relative">
        {/* Menu with higher z-index to ensure visibility */}
        <div className="sticky top-0 z-50">
          <Menu />
        </div>
        
        <div className="flex-grow">
          <BackgroundContainer>
            <Routes>
              <Route path="/" element={<MyceliumMixCalculator />} />
              <Route path="/calculator" element={<MyceliumMixCalculator />} />
              <Route path="/calculators" element={<CalculatorsPage />} />
              <Route path="/spore-finder" element={<SporeFinderPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Routes>
          </BackgroundContainer>
        </div>
        
        {/* Footer with higher z-index to ensure visibility */}
        <div className="relative z-40">
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
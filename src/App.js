import React from 'react';
import MyceliumMixCalculator from './components/MyceliumMixCalculator';
import BackgroundContainer from './components/BackgroundContainer';
import './App.css';

function App() {
  return (
    <div className="App">
      <BackgroundContainer>
        <MyceliumMixCalculator />
      </BackgroundContainer>
    </div>
  );
}

export default App;
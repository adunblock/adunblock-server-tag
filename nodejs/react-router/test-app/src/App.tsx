import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ServerTag from './ServerTag';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Welcome to the React Router Test App!
        </p>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ServerTag remoteUrl="http://localhost:3000/scripts.json" />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
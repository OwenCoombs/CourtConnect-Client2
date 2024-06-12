import React from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate(); // Move the useNavigate hook inside the component

  const handleOnClick = () => {
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CourtConnect</h1>
      </header>
      <main className="App-main">
        <h2>Find Your Next Pickup Game</h2>
        <p>Discover and join basketball games near you.</p>
        <button 
          className="cta-button"
          onClick={handleOnClick}
        >
          Get Started
        </button>
      </main>
      <footer className="App-footer">
        <p>&copy; 2024 CourtConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;


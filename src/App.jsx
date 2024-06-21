// App.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import Hero from "./assets/Hero1.svg"
import Arrow from "./assets/down-chevron.png"

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleLoadingFinish = () => {
    setLoading(false);
  };

  const handleFindGames = () => {
    // Redirect to the page for finding pickup games
    navigate('/playnow');
  };

  const handleLogin = () => {
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className="App">
      {loading && <LoadingScreen onFinish={handleLoadingFinish} />}
      <header className={`App-header ${loading ? 'loading' : ''}`}>
        <div className="hero-section">
          <img src={Hero} alt="Hero" className="hero-image" />
          <div className="hero-text">
            <h1>CourtConnect</h1>
            <h2>Find your next game here</h2>
            <div>
            <button 
              className="cta-button"
              onClick={handleFindGames}
            >
              Find Games
            </button>
            </div>
            <img src={Arrow} className="arrow-down"></img>
          </div>
        </div>
      </header>
      <main className={`App-main ${loading ? 'loading' : ''}`}>
        <h2>Find Your Next Pickup Game</h2>
        <p>Discover and join basketball games near you.</p>
        <div className="info">
          <h3>Why CourtConnect?</h3>
          <p>CourtConnect makes finding and joining pickup basketball games easy and convenient.</p>
          <h3>Features:</h3>
          <ul>
            <li>Discover nearby basketball courts.</li>
            <li>See who's playing at each court in real-time.</li>
            <li>Join games with a click of a button.</li>
            <li>Connect with other basketball enthusiasts.</li>
          </ul>
        </div>
      </main>
      <footer className={`App-footer ${loading ? 'loading' : ''}`}>
        <p>&copy; 2024 CourtConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;






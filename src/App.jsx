// App.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleLoadingFinish = () => {
    setLoading(false);
  };

  const handleOnClick = () => {
    navigate('/login');
  };

  return (
    <div className="App">
      {loading && <LoadingScreen onFinish={handleLoadingFinish} />}
      <header className={`App-header ${loading ? 'loading' : ''}`}>
        <h1>CourtConnect</h1>
      </header>
      <main className={`App-main ${loading ? 'loading' : ''}`}>
        <h2>Find Your Next Pickup Game</h2>
        <p>Discover and join basketball games near you.</p>
        <button 
          className="cta-button"
          onClick={handleOnClick}
        >
          Get Started
        </button>
      </main>
      <footer className={`App-footer ${loading ? 'loading' : ''}`}>
        <p>&copy; 2024 CourtConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;



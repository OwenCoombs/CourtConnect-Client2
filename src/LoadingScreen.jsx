import React, { useEffect, useState } from "react";
import logo from './assets/CourtConnect.svg';

const LoadingScreen = ({ onFinish }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setLoaded(true);
      onFinish(); // Callback to notify parent component that loading is finished
    }, 3000); // Adjust time as needed
  }, [onFinish]);

  return (
    <div className={`loading-screen ${loaded ? 'loaded' : ''}`}>
      <div className="logo">
        <img src={logo} alt="Loading" id="Logoscreen" />
      </div>
    </div>
  );
};

export default LoadingScreen;


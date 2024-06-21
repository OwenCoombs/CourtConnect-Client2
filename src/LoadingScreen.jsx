import React, { useEffect, useState, useContext } from "react";
import logo from './assets/CourtConnect.svg';
import { Context } from './context';
import { ToastContainer, toast } from 'react-toastify';


const LoadingScreen = ({ onFinish }) => {
  const { auth } = useContext(Context);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (auth.accessToken) {
      // If user is authenticated, notify parent component that loading is finished immediately
      onFinish();
    } else {
      // Simulate loading time if user is not authenticated
      setTimeout(() => {
        setLoaded(true);
        onFinish(); // Callback to notify parent component that loading is finished
      }, 3000); // Adjust time as needed
    }
  }, [auth.accessToken, onFinish]);

  // Render loading screen only if not authenticated or loading is not finished
  if (!auth.accessToken || !loaded) {
    return (
      <div className={`loading-screen ${loaded ? 'loaded' : ''}`}>
        <div className="logo">
          <img src={logo} alt="Loading" id="Logoscreen" />
        </div>
      </div>
    );
  }

  // If authenticated and loading is finished, return null
  return null;
};

export default LoadingScreen;




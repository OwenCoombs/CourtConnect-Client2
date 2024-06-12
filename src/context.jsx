// context.js
import { createContext, useEffect, useState } from 'react';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const currentToken = localStorage.getItem('accessToken');
  const currentProfile = JSON.parse(localStorage.getItem('profile'));
  const savePlayNow = JSON.parse(localStorage.getItem('playnow'));

  const [accessToken, setAccessToken] = useState(currentToken || '');
  const [profile, setProfile] = useState(currentProfile || {});
  const [playnow, setPlayNow] = useState(savePlayNow || {});

  useEffect(() => {
    if (currentToken) {
      localStorage.setItem('accessToken', accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [profile]);


  useEffect(() => {
    localStorage.setItem('playnow', JSON.stringify(playnow));
  }, [playnow]);

  const auth = { accessToken, setAccessToken };
  const liveProfile = { profile, setProfile };
  const livePlayNow = {playnow, setPlayNow};

  return (
    <Context.Provider value={{ auth, liveProfile, livePlayNow }}>
      {children}
    </Context.Provider>
  );
};



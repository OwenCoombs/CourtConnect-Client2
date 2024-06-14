import { createContext, useEffect, useState } from 'react';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const getLocalStorageItem = (key, defaultValue) => {
    const storedItem = localStorage.getItem(key);
    try {
      return storedItem ? JSON.parse(storedItem) : defaultValue;
    } catch (error) {
      console.error(`Error parsing JSON for ${key}:`, error);
      return defaultValue;
    }
  };

  const currentToken = getLocalStorageItem('accessToken', '');
  const currentProfile = getLocalStorageItem('profile', {});
  const savePlayNow = getLocalStorageItem('playnow', {});

  const [accessToken, setAccessToken] = useState(currentToken);
  const [profile, setProfile] = useState(currentProfile);
  const [playnow, setPlayNow] = useState(savePlayNow);

  useEffect(() => {
    localStorage.setItem('accessToken', JSON.stringify(accessToken));
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('playnow', JSON.stringify(playnow));
  }, [playnow]);

  const auth = { accessToken, setAccessToken };
  const liveProfile = { profile, setProfile };
  const livePlayNow = { playnow, setPlayNow };

  return (
    <Context.Provider value={{ auth, liveProfile, livePlayNow }}>
      {children}
    </Context.Provider>
  );
};




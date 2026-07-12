import React, { createContext, useState, useMemo, useEffect } from 'react';

export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {}
});

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme_mode') || 'light';
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  };

  useEffect(() => {
    // Standardize background styling at body level for smooth color switches
    document.body.style.backgroundColor = mode === 'light' ? '#f8fafc' : '#090d16';
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

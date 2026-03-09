// src/ThemeContext.js
import React, { createContext, useContext } from 'react';

// 1. Define the palette
const theme = {
  colors: {
    primary: "#00A9B5",     
    background: "#F7F4EB",  
    accent: "#2B52A1",      
    text: "#1A1A1A",        
    white: "#FFFFFF",
    gray: "#8E8E8E"
  },
  borderRadius: "20px",
  transition: "0.3s ease"
};

const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to make it easy to use in components
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
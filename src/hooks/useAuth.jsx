/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('fitmind_token')
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem('fitmind_username') || 'User'
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem('fitmind_useremail') || ''
  );
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);

  const login = (name, email, token) => {
    setIsAuthenticated(true);
    setUserName(name);
    setUserEmail(email);
    localStorage.setItem('fitmind_authenticated', '1');
    localStorage.setItem('fitmind_username', name);
    localStorage.setItem('fitmind_useremail', email);
    if (token) localStorage.setItem('fitmind_token', token);
    setShowAuthModal(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName('User');
    setUserEmail('');
    localStorage.removeItem('fitmind_authenticated');
    localStorage.removeItem('fitmind_username');
    localStorage.removeItem('fitmind_useremail');
    localStorage.removeItem('fitmind_token');
    setShowAuthModal(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, userEmail, showAuthModal, setShowAuthModal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

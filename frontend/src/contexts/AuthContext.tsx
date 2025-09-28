import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (token: string, user: User, isAdmin?: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';

      if (storedToken && storedUser) {
        setToken(storedToken);

        // Safely parse user JSON
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (err) {
          console.warn("Invalid user data in localStorage, clearing it.");
          localStorage.removeItem('user');
          setUser(null);
        }

        setIsAdmin(storedIsAdmin);
      }
    } catch (err) {
      console.error("Error reading auth data from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User, adminStatus = false) => {
    setToken(newToken);
    setUser(newUser);
    setIsAdmin(adminStatus);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('isAdmin', adminStatus.toString());
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

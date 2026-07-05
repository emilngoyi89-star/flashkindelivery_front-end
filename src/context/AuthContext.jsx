import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (updates) => {
    setUser((prev) => {
      const nextUser = prev ? { ...prev, ...updates } : updates;

      if (updates.firstName !== undefined) {
        if (updates.firstName) {
          localStorage.setItem('firstName', updates.firstName);
        } else {
          localStorage.removeItem('firstName');
        }
      }
      if (updates.lastName !== undefined) {
        if (updates.lastName) {
          localStorage.setItem('lastName', updates.lastName);
        } else {
          localStorage.removeItem('lastName');
        }
      }
      if (updates.phone !== undefined) {
        if (updates.phone) {
          localStorage.setItem('phone', updates.phone);
        } else {
          localStorage.removeItem('phone');
        }
      }
      if (updates.avatarUrl !== undefined) {
        if (updates.avatarUrl) {
          localStorage.setItem('avatarUrl', updates.avatarUrl);
        } else {
          localStorage.removeItem('avatarUrl');
        }
      }

      return nextUser;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedFirstName = localStorage.getItem('firstName');
    const savedLastName = localStorage.getItem('lastName');
    const savedPhone = localStorage.getItem('phone');
    const savedAvatarUrl = localStorage.getItem('avatarUrl');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          role: decoded.role,
          firstName: decoded.firstName || savedFirstName || null,
          lastName: decoded.lastName || savedLastName || null,
          phone: decoded.phone || savedPhone || '',
          avatarUrl: decoded.avatarUrl || savedAvatarUrl || null
        });
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    const avatarUrl = decoded.avatarUrl || localStorage.getItem('avatarUrl');

    setUser({
      id: decoded.id,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      avatarUrl: avatarUrl || null
    });

    if (avatarUrl) {
      localStorage.setItem('avatarUrl', avatarUrl);
    } else {
      localStorage.removeItem('avatarUrl');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
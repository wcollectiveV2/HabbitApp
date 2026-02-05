import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService, userService, UserProfile, AuthUser } from '../services';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, invitationToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshProfile = useCallback(async () => {
    try {
      const userProfile = await userService.getProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, []);

  useEffect(() => {
    // Check storage on load
    const storedToken = authService.getStoredToken();
    const storedUser = authService.getStoredUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      refreshProfile();
    }
    setIsLoading(false);
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      authService.storeAuth(response);
      setToken(response.accessToken);
      setUser(response.user);

      // Sync profile in habit-service
      try {
        const userProfile = await userService.syncUser({
          externalId: response.user.id,
          name: response.user.name,
          email: response.user.email,
          avatarUrl: response.user.image
        });
        setProfile(userProfile);
      } catch (err) {
        console.error('Failed to sync profile:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, invitationToken?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register({ email, password, name, invitationToken });
      authService.storeAuth(response);
      setToken(response.accessToken);
      setUser(response.user);

      // Create profile in habit-service
      try {
        const userProfile = await userService.syncUser({
          externalId: response.user.id,
          name: response.user.name,
          email: response.user.email,
          avatarUrl: response.user.image
        });
        setProfile(userProfile);
      } catch (err) {
        console.error('Failed to sync profile:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

const API_URL = 'http://localhost:5500/api'; // Replace with your actual API URL

interface User {
  id: string;
  email: string;
  name: string;
  // Add any other user properties
}

interface AuthContextType {
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  validateToken: (token: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to handle protected routes
export function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome screen if not authenticated
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, segments, isLoading]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check for stored authentication token on mount and validate it
  useEffect(() => {
    async function loadAuthState() {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const isValid = await validateToken(token);
          if (isValid) {
            const userDataStr = await AsyncStorage.getItem('userData');
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              setUser(userData);
              setIsAuthenticated(true);
            }
          } else {
            // Token is invalid, clear storage
            await AsyncStorage.multiRemove(['userToken', 'userData']);
          }
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthState();
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/users/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Token validation failed', error);
      return false;
    }
  };

  const authContext: AuthContextType = {
    signIn: async (token: string, userData: User) => {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    },
    signOut: async () => {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
      setIsAuthenticated(false);
    },
    validateToken,
    isAuthenticated,
    isLoading,
    user
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Simple auth context to manage authentication state
import { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
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

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome screen if not authenticated
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);
}

function RootLayoutNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored authentication token on mount
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      setIsAuthenticated(!!token);
    });
  }, []);

  const authContext: AuthContextType = {
    signIn: async (token: string) => {
      await AsyncStorage.setItem('userToken', token);
      setIsAuthenticated(true);
    },
    signOut: async () => {
      await AsyncStorage.removeItem('userToken');
      setIsAuthenticated(false);
    },
    isAuthenticated,
  };

  useProtectedRoute(isAuthenticated);

  return (
    <AuthContext.Provider value={authContext}>
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}>
        {/* Auth Group */}
        <Stack.Screen 
          name="(auth)/welcome"
          options={{ 
            animation: 'fade',
          }}
        />
        <Stack.Screen 
          name="(auth)/login"
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="(auth)/signup"
          options={{
            presentation: 'card',
          }}
        />

        {/* App Group */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
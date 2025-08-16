import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    console.log('[DEBUG] App.tsx: App component mounted');
    console.log('[DEBUG] App.tsx: Environment:', {
      platform: typeof window !== 'undefined' ? 'web' : 'native',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    });
  }, []);

  console.log('[DEBUG] App.tsx: Rendering App component with Navigation...');
  
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

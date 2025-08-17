import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { WaitTimesScreen } from './src/screens/WaitTimesScreen';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('[DEBUG] App.tsx: App component mounted');
    console.log('[DEBUG] App.tsx: Environment:', {
      platform: typeof window !== 'undefined' ? 'web' : 'native',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    });
  }, []);

  console.log('[DEBUG] App.tsx: Rendering App component...');
  
  return (
    <>
      <WaitTimesScreen />
      <StatusBar style="auto" />
    </>
  );
}

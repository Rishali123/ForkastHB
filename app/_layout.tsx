import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from './utils/database';

export default function Layout() {
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

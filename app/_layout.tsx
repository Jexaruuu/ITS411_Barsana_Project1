// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* (auth) group has its own layout */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* index.tsx (Menu) will show its own header */}
    </Stack>
  );
}

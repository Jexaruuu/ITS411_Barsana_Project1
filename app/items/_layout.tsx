import { Stack } from 'expo-router';

export default function ItemsLayout() {
  return (
    <Stack>
      <Stack.Screen name="new" options={{ title: 'New Item' }} />
    </Stack>
  );
}

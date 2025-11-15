import { AuthProvider } from "@/providers/AuthProvider";
import { UserProvider } from "@/providers/UserProvider";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </UserProvider>
    </AuthProvider>
  );
}

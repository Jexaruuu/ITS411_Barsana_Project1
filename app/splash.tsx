import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>RnadomItems!</Text>
      <Text style={styles.tagline}>Blue & White, fast and simple</Text>
      <ActivityIndicator size="large" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0ea5e9", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  brand: { fontSize: 40, fontWeight: "900", color: "white", letterSpacing: 1 },
  tagline: { marginTop: 6, fontSize: 14, color: "white", opacity: 0.9 },
});

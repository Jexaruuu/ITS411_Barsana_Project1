import { auth } from "@/constants/firebase";
import { Link, router } from "expo-router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return unsub;
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      setError(e?.message ?? "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ImageBackground
        source={require("../../assets/images/murmurbg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={[styles.overlay, started && styles.overlayWhite]}>
          {!started ? (
            <>
              <View style={styles.hero}>
                <Animated.Image
                  source={require("../../assets/images/murmuricon.png")}
                  style={[styles.logo, { transform: [{ rotate: spin }] }]}
                />
                <Text style={styles.appName}>Murmurmind</Text>
              </View>
              <View style={styles.bottomCard}>
                <Text style={styles.getStarted}>Get Started</Text>
                <Pressable
                  style={styles.loginButton}
                  onPress={() => setStarted(true)}
                >
                  <Text style={styles.loginText}>LOGIN</Text>
                </Pressable>
                <Pressable
                  style={styles.signupButton}
                  onPress={() => setStarted(true)}
                >
                  <Text style={styles.signupText}>SIGNUP</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.loginScreen}>
              <View style={styles.loginHeaderRow}>
                <Pressable onPress={() => setStarted(false)} style={styles.backButton}>
                  <Text style={styles.backIcon}>‹</Text>
                </Pressable>
                <View style={{ flex: 1 }} />
                <Link href="/(auth)/register" asChild>
                  <Pressable style={styles.headerSignupButton}>
                    <Text style={styles.headerSignupText}>SIGN UP</Text>
                  </Pressable>
                </Link>
              </View>

              <View style={styles.heroLogin}>
                <Image
                  source={require("../../assets/images/murmuriconblack.png")}
                  style={styles.logoLogin}
                />
                <Text style={styles.appNameLogin}>Murmurmind</Text>
              </View>

              <ImageBackground
                source={require("../../assets/images/murmurwelcomebg.png")}
                style={styles.welcomeCard}
                imageStyle={{ borderRadius: 32 }}
                resizeMode="cover"
              >
                <View style={styles.welcomeInner}>
                  <Text style={styles.welcomeTitle}>WELCOME BACK</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Enter your details below
                  </Text>

                  <View style={styles.form}>
                    <TextInput
                      style={styles.welcomeInput}
                      placeholder="Email Address"
                      placeholderTextColor="#D1D5DB"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                    <TextInput
                      style={styles.welcomeInput}
                      placeholder="Password"
                      placeholderTextColor="#D1D5DB"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                  </View>

                  <Pressable
                    style={styles.welcomeLoginButton}
                    onPress={handleLogin}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.welcomeLoginText}>LOGIN</Text>
                    )}
                  </Pressable>
                </View>
              </ImageBackground>
            </View>
          )}
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const PRIMARY_DARK = "#0284c7";
const BORDER = "#93C5FD";
const PILL_RADIUS = 12;

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, justifyContent: "space-between" },
  overlayWhite: { backgroundColor: "#FFFFFF" },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogin: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 40,
  },
  brand: { fontSize: 32, fontWeight: "900", color: PRIMARY_DARK, letterSpacing: 1 },
  subtitle: { marginTop: 4, color: "#0f172a" },
  logo: { width: 250, height: 250, marginBottom: -60 },
  logoLogin: { width: 80, height: 80, marginBottom: 12 },
  appName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#F9FAFB",
    fontFamily: "Poppins",
    marginBottom: 170,
  },
  appNameLogin: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "Poppins",
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  getStarted: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  form: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: PILL_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  loginButton: {
    backgroundColor: "#F4F4F5",
    borderRadius: PILL_RADIUS,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  loginText: {
    color: "#111827",
    fontWeight: "600",
    letterSpacing: 1,
  },
  signupButton: {
    backgroundColor: "#4B5563",
    borderRadius: PILL_RADIUS,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  signupText: {
    color: "#F9FAFB",
    fontWeight: "600",
    letterSpacing: 1,
  },
  error: { color: "#b91c1c", marginBottom: 6, textAlign: "center", fontSize: 12 },
  link: { textAlign: "center", color: PRIMARY_DARK, fontWeight: "700" },

  loginScreen: {
    flex: 1,
    paddingBottom: 32,
  },
  loginHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 22,
    color: "#111827",
  },
  headerSignupButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: PILL_RADIUS,
    backgroundColor: "#111827",
  },
  headerSignupText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  welcomeCard: {
    flex: 1,
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: 8,
  },
  welcomeInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    justifyContent: "flex-start",
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
    textAlign: "center",
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#E5E7EB",
    marginTop: 4,
    marginBottom: 24,
    textAlign: "center",
  },
  welcomeInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: PILL_RADIUS,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#020617",
    color: "#F9FAFB",
  },
  welcomeLoginButton: {
    marginTop: 12,
    borderRadius: PILL_RADIUS,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  welcomeLoginText: {
    color: "#F9FAFB",
    fontWeight: "600",
    letterSpacing: 1,
  },
});

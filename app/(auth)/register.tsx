import { auth, db } from "@/constants/firebase";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return unsub;
  }, []);

  const handleRegister = async () => {
    setError(null);
    if (!email || !password || !firstName || !lastName) {
      setError("Please fill all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      setDoc(doc(db, "profiles", cred.user.uid), {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      router.replace("/");
    } catch (e: any) {
      setError(e?.message ?? "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#E0F2FE" }} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.brand}>RnadomItems!</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>
        <View style={styles.card}>
          <TextInput style={styles.input} placeholder="First name" placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last name" placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9CA3AF" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9CA3AF" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
          </Pressable>
          <Link href="/(auth)/login" asChild>
            <Pressable style={{ marginTop: 12 }}>
              <Text style={styles.link}>Back to login</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = "#0ea5e9";
const PRIMARY_DARK = "#0284c7";
const BORDER = "#93C5FD";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 16 },
  brand: { fontSize: 32, fontWeight: "900", color: PRIMARY_DARK, letterSpacing: 1 },
  subtitle: { marginTop: 4, color: "#0f172a" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  input: { borderWidth: 1, borderColor: BORDER, borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  button: { backgroundColor: PRIMARY, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#b91c1c", marginBottom: 10, textAlign: "center" },
  link: { textAlign: "center", color: PRIMARY_DARK, fontWeight: "700" },
});

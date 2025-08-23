// app/(auth)/login.tsx
import { auth } from '@/constants/firebase';
import { Link, router } from 'expo-router';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, go to Menu
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/');
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message ?? 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator /> : <Text style={styles.buttonText}>Log in</Text>}
      </Pressable>

      <View style={{ height: 12 }} />
      <Link href="/(auth)/register" asChild>
        <Pressable>
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#111827', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  error: { color: '#b91c1c', marginBottom: 8 },
  link: { textAlign: 'center', color: '#2563eb', fontWeight: '600' },
});

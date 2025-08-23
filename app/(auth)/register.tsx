// app/(auth)/register.tsx
import { auth } from '@/constants/firebase';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, go to Menu
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/');
    });
    return unsub;
  }, []);

  const handleRegister = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message ?? 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
        {submitting ? <ActivityIndicator /> : <Text style={styles.buttonText}>Create account</Text>}
      </Pressable>

      <View style={{ height: 12 }} />
      <Link href="/(auth)/login" asChild>
        <Pressable>
          <Text style={styles.link}>Back to login</Text>
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

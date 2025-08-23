// app/index.tsx
import { auth, db } from '@/constants/firebase';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Item = {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  createdAt?: any;
};

export default function Menu() {
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useMemo(() => collection(db, 'items'), []);

  // Auth gate: if not logged in, go to (auth)/login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUid(null);
        router.replace('/(auth)/login');
      } else {
        setUid(user.uid);
      }
      setReady(true);
    });
    return unsub;
  }, []);

  // Listen to user’s items
  useEffect(() => {
    if (!uid) return;
    const q = query(itemsRef, where('uid', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Item[] = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name ?? '',
          description: data.description ?? '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt,
        };
      });
      // Optional: sort by createdAt desc (may require composite index if added to query)
      rows.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });
      setItems(rows);
    });
    return unsub;
  }, [uid, itemsRef]);

  const handleAdd = async () => {
    setError(null);
    if (!uid) {
      setError('You must be logged in.');
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Item name is required.');
      return;
    }
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setAdding(true);
    try {
      await addDoc(itemsRef, {
        uid,
        name: trimmedName,
        description: desc.trim(),
        tags,
        createdAt: serverTimestamp(),
      });
      setName('');
      setDesc('');
      setTagsText('');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add item.');
    } finally {
      setAdding(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/(auth)/login');
  };

  if (!ready) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Menu',
          headerRight: () => (
            <Pressable onPress={handleLogout} style={{ padding: 8 }}>
              <Text style={{ color: '#ef4444', fontWeight: '700' }}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 88, android: 0 })}
      >
        <FlatList
          ListHeaderComponent={
            <View style={styles.form}>
              <Text style={styles.title}>Add an Item</Text>

              <TextInput
                style={styles.input}
                placeholder="Item Name"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Item Description"
                value={desc}
                onChangeText={setDesc}
                multiline
              />

              <TextInput
                style={styles.input}
                placeholder="Item Tags (comma separated, e.g. school, urgent)"
                value={tagsText}
                onChangeText={setTagsText}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable style={styles.button} onPress={handleAdd} disabled={adding}>
                {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Item</Text>}
              </Pressable>

              <Text style={[styles.title, { marginTop: 24 }]}>Your Items</Text>
            </View>
          }
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {!!item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
              {item.tags?.length ? (
                <View style={styles.tagsRow}>
                  {item.tags.map((t, i) => (
                    <View key={`${item.id}-tag-${i}`} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  form: { paddingHorizontal: 4, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#b91c1c', marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: '#374151', marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 12, color: '#111827' },
});

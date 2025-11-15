import { useUser } from "@/providers/UserProvider";
import { Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Item = {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  createdAt?: any;
  __optimistic?: boolean;
};

export default function Menu() {
  const { loading, user, items, addItem, logout } = useUser();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Item>>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/(auth)/login");
  }, [loading, user]);

  const handleAdd = async () => {
    setError(null);
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Item name is required.");
      return;
    }
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    setAdding(true);
    try {
      await addItem({ name: trimmedName, description: desc, tags });
      setName("");
      setDesc("");
      setTagsText("");
      Keyboard.dismiss();
      requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
    } catch (e: any) {
      setError(e?.message ?? "Failed to add item.");
    } finally {
      setAdding(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  const headerName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Welcome";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "RnadomItems!",
          headerRight: () => null,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#E0F2FE" }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 88, android: 0 })}
      >
        <FlatList
          ref={listRef}
          ListHeaderComponent={
            <View style={{ gap: 16, paddingTop: 16 }}>
              <View style={styles.userCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{headerName}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
                <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                  <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
              </View>

              <View style={styles.form}>
                <Text style={styles.title}>Add an Item</Text>
                <TextInput style={styles.input} placeholder="Item Name" value={name} onChangeText={setName} returnKeyType="done" />
                <TextInput style={[styles.input, { height: 100, textAlignVertical: "top" }]} placeholder="Item Description" value={desc} onChangeText={setDesc} multiline />
                <TextInput style={styles.input} placeholder="Item Tags (comma separated, e.g. school, urgent)" value={tagsText} onChangeText={setTagsText} returnKeyType="done" />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable style={styles.button} onPress={handleAdd} disabled={adding}>
                  {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Item</Text>}
                </Pressable>
                <Text style={[styles.title, { marginTop: 24 }]}>Your Items</Text>
              </View>
            </View>
          }
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, item.__optimistic ? styles.cardOptimistic : null]}>
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
  userCard: { backgroundColor: "white", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center", gap: 12 },
  userName: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  userEmail: { color: "#475569", marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: "#ef4444", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  logoutText: { color: "#ef4444", fontWeight: "700" },
  form: { paddingHorizontal: 4, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#0f172a" },
  input: { borderWidth: 1, borderColor: "#93C5FD", borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  button: { backgroundColor: "#111827", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#b91c1c", marginBottom: 10 },
  card: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  cardOptimistic: { opacity: 0.7 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cardDesc: { color: "#374151", marginBottom: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { borderWidth: 1, borderColor: "#9CA3AF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  tagText: { fontSize: 12, color: "#111827" },
});

import { auth, db } from "@/constants/firebase";
import { signOut } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

type Item = {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  createdAt?: any;
  __optimistic?: boolean;
};

type AuthUser = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

type Ctx = {
  loading: boolean;
  user: AuthUser | null;
  items: Item[];
  addItem: (args: { name: string; description?: string; tags?: string[] }) => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<Ctx | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useMemo(() => collection(db, "items"), []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const q = query(itemsRef, where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Item[] = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name ?? "",
          description: data.description ?? "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt,
        };
      });
      rows.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });
      setItems(rows);
    });
    return unsub;
  }, [user, itemsRef]);

  const addItem = async ({ name, description, tags }: { name: string; description?: string; tags?: string[] }) => {
    if (!user) return;
    const optimistic: Item = {
      id: `opt-${Date.now()}`,
      name: name.trim(),
      description: (description || "").trim(),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      __optimistic: true,
    };
    setItems((cur) => [optimistic, ...cur]);
    await addDoc(itemsRef, {
      uid: user.uid,
      name: optimistic.name,
      description: optimistic.description,
      tags: optimistic.tags,
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({ loading, user, items, addItem, logout }), [loading, user, items]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

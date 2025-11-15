import { auth, db } from "@/constants/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

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
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }
      const baseFirst = (u.displayName || "").split(" ")[0] || "";
      const baseLast = (u.displayName || "").split(" ").slice(1).join(" ") || "";
      const base: AuthUser = {
        uid: u.uid,
        email: u.email || "",
        firstName: baseFirst,
        lastName: baseLast,
        fullName: [baseFirst, baseLast].filter(Boolean).join(" "),
      };
      setUser(base);
      setLoading(false);
      const ref = doc(db, "profiles", u.uid);
      const unsubDoc = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const p = snap.data() as any;
        const first = (p.firstName || "").trim();
        const last = (p.lastName || "").trim();
        setUser({
          uid: u.uid,
          email: u.email || "",
          firstName: first,
          lastName: last,
          fullName: [first, last].filter(Boolean).join(" "),
        });
      });
      return () => unsubDoc();
    });
    return () => unsubAuth();
  }, []);

  const value = useMemo(() => ({ loading, user }), [loading, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

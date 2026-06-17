import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { setCurrentUser, setOnUnauthorized } from '../services/authState';

const SESSION_KEY = 'checar_user';

const AuthContext = createContext(null);

function parseStored() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persist(data) {
  if (data) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
  setCurrentUser(data);
}

export function AuthProvider({ children }) {
  // Não hidrata do sessionStorage — evita token expirado antes do Firebase confirmar
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();

        const prev = parseStored();
        const role = prev?.uid === firebaseUser.uid ? (prev?.role ?? null) : null;

        const userData = {
          uid:             firebaseUser.uid,
          email:           firebaseUser.email,
          displayName:     firebaseUser.displayName ?? null,
          token,
          role,
          isAuthenticated: true,
        };

        setUser(userData);
        persist(userData);
      } else {
        setUser(null);
        persist(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  const setRole = useCallback((role) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, role };
      persist(updated);
      return updated;
    });
  }, []);

  const value = {
    user,
    uid:             user?.uid          ?? null,
    email:           user?.email        ?? null,
    displayName:     user?.displayName  ?? null,
    token:           user?.token        ?? null,
    role:            user?.role         ?? null,
    isAuthenticated: Boolean(user),
    loading,
    logout,
    setRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be called inside <AuthProvider>');
  return ctx;
}

/** Aguarda Firebase confirmar sessão (usado após login). */
export function waitForFirebaseUser(timeoutMs = 10000) {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout aguardando Firebase Auth')), timeoutMs);
    const unsub = onIdTokenChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        clearTimeout(timer);
        unsub();
        resolve(firebaseUser);
      }
    });
  });
}

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { setCurrentUser, setOnUnauthorized } from '../services/authState';

// sessionStorage is used ONLY inside this file — never in components
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
  // Keep the api.js singleton in sync
  setCurrentUser(data);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Hydrate immediately from session so the UI is not blank on refresh
    // and the api.js singleton has a user before the first render
    const stored = parseStored();
    if (stored) setCurrentUser(stored);
    return stored;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onIdTokenChanged fires on:
    //   - sign-in / sign-out
    //   - Firebase background token refresh (~every hour)
    // This guarantees the token in context is always fresh
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();

        // Preserve the role that was set during registration or profile update
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
    // onIdTokenChanged fires with null → clears user + singleton automatically
  }, []);

  // Wire up the api.js 401 handler. Uses a stable logout ref so the effect
  // runs only once and the cleanup removes the callback on unmount.
  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  // Called after registration or role change to persist tipoUsuario in context
  const setRole = useCallback((role) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, role };
      persist(updated);
      return updated;
    });
  }, []);

  const value = {
    // Full user object — components should prefer the flat fields below
    user,

    // Flat convenience fields (null-safe, never undefined)
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

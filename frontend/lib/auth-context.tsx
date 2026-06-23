'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL!;
const LAST_USER_KEY = 'blog_last_user';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'VISITOR' | 'CREATOR';
  avatar: string | null;
  bio?: string;
  googleId: string | null;
  githubId: string | null;
  bookmarks?: string[];
  createdAt: string;
}

/** Slim snapshot stored in localStorage — only for displaying the popup */
export interface LastUserSnapshot {
  name: string;
  email: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  lastUser: LastUserSnapshot | null;   // ← for the "Continue as" popup
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokenFromOAuth: (token: string) => Promise<void>;
  clearLastUser: () => void;           // ← dismiss the popup permanently
  toggleBookmark: (postId: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const saveLastUser = (user: User) => {
  try {
    const snapshot: LastUserSnapshot = {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
    localStorage.setItem(LAST_USER_KEY, JSON.stringify(snapshot));
  } catch { /* localStorage not available (SSR / private mode) */ }
};

const loadLastUser = (): LastUserSnapshot | null => {
  try {
    const raw = localStorage.getItem(LAST_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const removeLastUser = () => {
  try { localStorage.removeItem(LAST_USER_KEY); } catch { /* noop */ }
};

let refreshPromise: Promise<string | null> | null = null;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [lastUser, setLastUser]       = useState<LastUserSnapshot | null>(null);

  // ── Commit a user into state + persist their snapshot ────────────────────

  const commitUser = useCallback((u: User, token: string) => {
    setAccessToken(token);
    setUser(u);
    setLastUser(null);   // hide the popup once they're logged in
    saveLastUser(u);     // update the snapshot for next visit
    localStorage.setItem('accessToken', token); // persist locally as fallback
  }, []);

  // ── Fetch user profile with a given token ────────────────────────────────

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  }, []);

  // ── Session Refresh ───────────────────────────────────────────────────────

  const refreshSession = useCallback(async () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        
        const data = await res.json();
        
        if (res.ok && data.success && data.accessToken && data.user) {
          // Session restored — log in immediately
          commitUser(data.user, data.accessToken);
          return data.accessToken;
        }
      } catch { /* network error */ }
      return null;
    })();

    const result = await refreshPromise;
    refreshPromise = null;
    return result;
  }, [commitUser]);

  // ── On mount: silently try to restore session, then load last-user ───────

  useEffect(() => {
    const initSession = async () => {
      let token = await refreshSession();
      
      // If refresh fails (e.g. cross-origin cookie blocked), fallback to local access token
      if (!token) {
        const localToken = localStorage.getItem('accessToken');
        if (localToken) {
          const u = await fetchUser(localToken);
          if (u) {
            commitUser(u, localToken);
            return;
          } else {
            localStorage.removeItem('accessToken');
          }
        }
      }

      if (!token) {
        // No active session — read the last-user snapshot to show the popup
        const snapshot = loadLastUser();
        setLastUser(snapshot);
        setLoading(false);
      }
    };
    initSession();
  }, [refreshSession, fetchUser, commitUser]);

  // When commitUser runs (session restored), we can stop loading
  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    commitUser(data.user, data.accessToken);
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore network error on logout */ }
    
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    // Keep lastUser so the popup re-appears next time they visit
  };

  // ── Refresh user profile from DB ─────────────────────────────────────────

  const refreshUser = async () => {
    if (!accessToken) return;
    const updated = await fetchUser(accessToken);
    if (updated) {
      setUser(updated);
      saveLastUser(updated);
    }
  };

  // ── Called from OAuth callback page ──────────────────────────────────────

  const setTokenFromOAuth = async (token: string) => {
    const u = await fetchUser(token);
    if (u) commitUser(u, token);
  };

  // ── Dismiss the popup and forget the last user ───────────────────────────

  const clearLastUser = () => {
    removeLastUser();
    setLastUser(null);
  };

  // ── Toggle Bookmark ───────────────────────────────────────────────────────
  
  const toggleBookmark = async (postId: string) => {
    if (!accessToken || !user) return;
    
    // Optimistic update
    const isBookmarked = user.bookmarks?.includes(postId);
    let newBookmarks = [...(user.bookmarks || [])];
    
    if (isBookmarked) {
      newBookmarks = newBookmarks.filter(id => id !== postId);
    } else {
      newBookmarks.unshift(postId);
    }
    
    setUser({ ...user, bookmarks: newBookmarks });

    try {
      let currentToken = accessToken;
      let res = await fetch(`${API}/users/bookmarks/${postId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        credentials: 'include'
      });
      
      // If token expired, try to refresh and retry the request
      if (res.status === 401) {
        const newToken = await refreshSession();
        if (newToken) {
          currentToken = newToken;
          res = await fetch(`${API}/users/bookmarks/${postId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${currentToken}` },
            credentials: 'include'
          });
        }
      }
      
      const data = await res.json();
      if (res.ok && data.success) {
        // Sync with actual server state
        setUser(prev => prev ? { ...prev, bookmarks: data.bookmarks } : null);
      } else {
        // Revert on failure
        setUser({ ...user, bookmarks: user.bookmarks });
      }
    } catch (err) {
      // Revert on failure
      setUser({ ...user, bookmarks: user.bookmarks });
      console.error('Failed to toggle bookmark:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        lastUser,
        login,
        logout,
        refreshUser,
        setTokenFromOAuth,
        clearLastUser,
        toggleBookmark,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

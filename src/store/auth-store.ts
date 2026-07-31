import { create } from "zustand";

import { login as loginRequest } from "@/api/auth";
import { ApiError } from "@/api/client";
import { getStorageItemAsync, setStorageItemAsync } from "@/utils/secure-store";
import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

type AuthStatus = "loading" | "signedIn" | "signedOut";

type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  isSigningIn: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  token: null,
  user: null,
  isSigningIn: false,
  error: null,

  hydrate: async () => {
    const [token, storedUser] = await Promise.all([
      getStorageItemAsync(TOKEN_KEY),
      getStorageItemAsync(USER_KEY),
    ]);

    if (!token) {
      set({ token: null, user: null, status: "signedOut" });
      return;
    }

    try {
      const user = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
      set({ token, user, status: "signedIn" });
    } catch {
      // Stored user profile is corrupt/stale; drop the session and require a fresh sign-in.
      await Promise.all([
        setStorageItemAsync(TOKEN_KEY, null),
        setStorageItemAsync(USER_KEY, null),
      ]);
      set({ token: null, user: null, status: "signedOut" });
    }
  },

  login: async (email, password) => {
    if (get().isSigningIn) return;

    set({ isSigningIn: true, error: null });
    try {
      const { token, user } = await loginRequest({ email, password });
      await Promise.all([
        setStorageItemAsync(TOKEN_KEY, token),
        setStorageItemAsync(USER_KEY, JSON.stringify(user)),
      ]);
      set({ token, user, status: "signedIn", isSigningIn: false });
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : "Unable to sign in. Please try again.";
      set({ isSigningIn: false, error: message });
      throw e;
    }
  },

  logout: async () => {
    await Promise.all([
      setStorageItemAsync(TOKEN_KEY, null),
      setStorageItemAsync(USER_KEY, null),
    ]);
    set({ token: null, user: null, status: "signedOut", error: null });
  },
}));

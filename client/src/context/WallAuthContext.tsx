import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CreatePostPayload } from "../services/wallApi";
import {
  clearWallSession,
  fetchWallMe,
  getWallUser,
  wallLogin,
  wallLogout,
  type WallUser,
} from "../services/wallAuth";

type PendingAction = () => void | Promise<void>;

interface WallAuthContextValue {
  user: WallUser | null;
  loading: boolean;
  loginOpen: boolean;
  openLogin: (afterLogin?: PendingAction) => void;
  closeLogin: () => void;
  login: (
    email: string,
    password: string,
    confirmPassword?: string
  ) => Promise<WallUser>;
  logout: () => void;
  requireAuth: (action: PendingAction) => boolean;
}

const WallAuthContext = createContext<WallAuthContextValue | null>(null);

export function WallAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WallUser | null>(() => getWallUser());
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    fetchWallMe()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const openLogin = useCallback((afterLogin?: PendingAction) => {
    if (afterLogin) setPendingAction(() => afterLogin);
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setPendingAction(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string, confirmPassword?: string) => {
      const loggedIn = await wallLogin(email, password, confirmPassword);
      setUser(loggedIn);
      setLoginOpen(false);
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        await action();
      }
      return loggedIn;
    },
    [pendingAction]
  );

  const logout = useCallback(() => {
    wallLogout();
    setUser(null);
    setPendingAction(null);
    setLoginOpen(false);
  }, []);

  const requireAuth = useCallback(
    (action: PendingAction) => {
      if (user) {
        void action();
        return true;
      }
      openLogin(action);
      return false;
    },
    [user, openLogin]
  );

  return (
    <WallAuthContext.Provider
      value={{
        user,
        loading,
        loginOpen,
        openLogin,
        closeLogin,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </WallAuthContext.Provider>
  );
}

export function useWallAuth() {
  const ctx = useContext(WallAuthContext);
  if (!ctx) {
    throw new Error("useWallAuth must be used within WallAuthProvider");
  }
  return ctx;
}

export type { CreatePostPayload };

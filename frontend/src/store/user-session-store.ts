import { create } from "zustand";

interface UserSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

interface UserSessionStore {
  session: UserSession | null;
  setSession: (session: UserSession) => void;
  clearSession: () => void;
}
const useUserSessionStore = create<UserSessionStore>((set) => ({
    session: JSON.parse(localStorage.getItem("user-session") || "null"),
    setSession: (session) => {
        localStorage.setItem("user-session", JSON.stringify(session));
        set({ session });
    },
    clearSession: () => {
        localStorage.removeItem("user-session");
        set({ session: null });
    },
}));

export default useUserSessionStore;

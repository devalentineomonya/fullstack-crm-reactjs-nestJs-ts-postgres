import { create } from "zustand";

interface SingUpUser {
  user: CreateUserDto ;
  setUser: (partialUser: Partial<CreateUserDto>) => void;
}

export const useSignUpStore = create<SingUpUser>((set) => ({
  user: {
    email: "",
    provider: "email",
  },
  setUser: (partialUser) =>
    set((state) => ({
      user: {
        ...state.user,
        ...partialUser,
      },
    })),
}));

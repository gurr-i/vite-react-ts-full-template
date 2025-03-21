import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

export type User = z.infer<typeof insertUserSchema>;

export type AuthState = {
  user: User | null;
  isLoading: boolean;
};

export type AuthContextType = AuthState & {
  loginMutation: {
    mutate: (credentials: User) => void;
    isPending: boolean;
  };
  registerMutation: {
    mutate: (credentials: User) => void;
    isPending: boolean;
  };
};
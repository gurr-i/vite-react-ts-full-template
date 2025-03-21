import { User } from "../types";

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  async login(credentials: User): Promise<User> {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    // console.log("response :",response)
    if (!response.ok) {
      throw new Error("Login failed");
    }
    return response.json();
  },

  async register(credentials: User): Promise<User> {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error("Registration failed");
    }
    return response.json();
  },
};
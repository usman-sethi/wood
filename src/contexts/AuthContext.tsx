import React, { createContext, useContext, useState, useEffect } from "react";
import { googleSheetsMock, SiteUser } from "../services/googleSheets";

interface User {
  email: string;
  role: "Admin" | "Client";
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const ADMIN_EMAIL = "us9443783@gmail.com";

  const login = async (email: string, name?: string) => {
    const role = email === ADMIN_EMAIL ? "Admin" : "Client";
    const newUser: User = { email, role, name: name || email.split('@')[0] };
    
    // Check if user already exists in DB
    try {
      const users = await googleSheetsMock.getUsers();
      const existingUser = (users && Array.isArray(users)) ? users.find(u => u.email.toLowerCase() === email.toLowerCase()) : null;

      if (!existingUser) {
        console.log("New user detected, saving to database...");
        const siteUser: SiteUser = {
          id: `u${Date.now()}`,
          name: newUser.name || 'Anonymous',
          email: newUser.email,
          role: role === 'Admin' ? 'Admin' : 'Customer',
          joined: new Date().toISOString()
        };
        await googleSheetsMock.saveUser(siteUser);
      } else {
        console.log("Returning user logged in:", existingUser.name);
      }
    } catch (e) {
      console.warn("Database check failed, logging in locally anyway:", e);
    }

    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const isAdmin = user?.role === "Admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

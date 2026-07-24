"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface DemoUser {
  id: string;
  name: string;
  username: string;
  email: string;
  nim?: string;
  role?: string;
}

interface UserContextType {
  currentUser: DemoUser | null;
  users: DemoUser[];
  setCurrentUser: (user: DemoUser) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  setCurrentUser: () => {},
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setUsers(data.data);
          // Default to student1 or first user
          const savedId = localStorage.getItem("edupulse_current_user_id");
          const found = data.data.find((u: DemoUser) => u.id === savedId);
          setCurrentUser(found || data.data[1] || data.data[0]);
        }
      })
      .catch((err) => console.error("Failed to load demo users", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSetUser = (user: DemoUser) => {
    setCurrentUser(user);
    localStorage.setItem("edupulse_current_user_id", user.id);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser: handleSetUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

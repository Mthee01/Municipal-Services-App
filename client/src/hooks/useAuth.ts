import { useState, useEffect } from "react";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  municipalityAccountNo?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check localStorage first (remember me)
        let savedAuth = localStorage.getItem("municipalAuth");
        if (!savedAuth) {
          // Check sessionStorage (session-only)
          savedAuth = sessionStorage.getItem("municipalAuth");
        }

        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          const loginTime = new Date(authData.loginTime).getTime();
          const now = new Date().getTime();
          const hoursPassed = (now - loginTime) / (1000 * 60 * 60);

          // For "remember me", allow longer sessions (30 days)
          // For regular sessions, expire after 24 hours
          const maxHours = authData.rememberMe ? 24 * 30 : 24;

          if (hoursPassed < maxHours && authData.user) {
            setUser(authData.user);
          } else {
            // Session expired
            localStorage.removeItem("municipalAuth");
            sessionStorage.removeItem("municipalAuth");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
        localStorage.removeItem("municipalAuth");
        sessionStorage.removeItem("municipalAuth");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., login in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
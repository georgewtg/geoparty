import { useEffect, useState } from "react";
import { fetchAuth } from "../api/account.api";
import type { AccountData } from "../types/account";
import { AuthContext } from "./AuthContext";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AccountData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const data = await fetchAuth();

        if (isMounted) {
          if (data.success && data.payload.isAuthenticated) {
            setIsAuthenticated(true);
            setUser(data.payload.user);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, setIsAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
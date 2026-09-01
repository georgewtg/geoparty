import { createContext, useContext } from "react";
import type { AccountData } from "../types/account";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountData | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<AccountData | null>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);
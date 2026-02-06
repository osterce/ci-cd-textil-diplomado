import { useContext } from "react";
import { AuthContext } from "@/context/auth.context";

/**
 * Wrapper hook for the AuthContext provider.
 * Kept as a small ergonomic helper so components can just call `useAuthContext()`.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default useAuthContext;

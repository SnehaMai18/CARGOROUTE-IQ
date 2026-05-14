import { createContext, useState } from "react";
import { getUserFromToken, logout } from "../utils/jwtUtils";

// ✅ NAMED export
export const AuthContext = createContext();

// ✅ DEFAULT export
export default function AuthProvider({ children }) {

  const [user, setUser] = useState(getUserFromToken());

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser(getUserFromToken());
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
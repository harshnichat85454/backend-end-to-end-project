import { createContext, useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth.api";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data.data);
    } catch (error) {
      setUser(null);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export { AuthContext };

import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/api/user/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Auth check failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
        pendingApproval: err.response?.data?.pendingApproval || false,
      };
    }
  };

  const register = async (name, email, password, phone, role) => {
    try {
      await api.post("/api/auth/register", { name, email, password, phone, role });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put("/api/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

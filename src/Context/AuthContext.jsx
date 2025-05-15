import axios from "axios";
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    return token && userId ? { token, userId } : null;
  });

  const fetchUserProfile = async () => {
    if (!user?.token) throw new Error("No token found");
    const response = await axios.get("https://graduation.amiralsayed.me/api/users/me", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    return response.data;
  };

  const fetchUsers = async () => {
    if (!user?.token) throw new Error("No token found");
    const response = await axios.get("https://graduation.amiralsayed.me/api/users", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    return response.data;
  };

  // جلب بيانات المستخدم الحالي
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["userProfile", user?.token],
    queryFn: fetchUserProfile,
    enabled: !!user?.token, // تشغيل الجلب فقط إذا كان هناك مستخدم مسجل
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    onSuccess: (data) => {
      setUser((prev) => ({
        ...prev,
        ...data, // نضيف كل بيانات المستخدم
      }));
    },
    onError: () => logout(), // تسجيل الخروج إذا فشل الجلب
  });

  // جلب جميع المستخدمين
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users", user?.token],
    queryFn: fetchUsers,
    enabled: !!user?.token, // تشغيل الجلب فقط إذا كان هناك مستخدم مسجل
    onError: () => logout(), // تسجيل الخروج إذا فشل الجلب
  });

  const login = async (token, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("loginTime", Date.now());
  
    try {
      const { data } = await axios.get(
        "https://graduation.amiralsayed.me/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setUser({ token, userId, ...data }); // حفظ كل البيانات داخل user
      queryClient.invalidateQueries(["userProfile"]);
      queryClient.invalidateQueries(["users"]);
    } catch (error) {
      logout(); // لو حصل مشكلة أثناء جلب البيانات
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("loginTime");
    setUser(null);

    // مسح البيانات عند تسجيل الخروج
    queryClient.removeQueries(["userProfile"]);
    queryClient.removeQueries(["users"]); 

    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, userData, usersData, isUserLoading, isUsersLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
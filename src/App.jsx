import "./App.css";
import React from "react";
import Home from "./Pages/Home/Home";
import City from "./Pages/City/City";
import Auth from "./Pages/Auth/Auth";
import Profile from "./Pages/Profile/Profile";
import Role from "./Pages/Role/Role";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isTokenExpired } from "./checkTokenExpiration";
import toast from "react-hot-toast";
import { useAuth } from "./Context/AuthContext";

function App() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        localStorage.removeItem("token");
        localStorage.removeItem("loginTime");
        toast.info("Session expired. Please log in again.");
        navigate("/auth");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [navigate]);

  const token = localStorage.getItem("token");
  const isAuthenticated = token && !isTokenExpired();

  return (
    <div className="App">
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/auth" />}
          />
          <Route
            path="/city"
            element={isAuthenticated ? <City /> : <Navigate to="/auth" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />}
          />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/role"
            element={isAuthenticated && userData?.role !== "user"? <Role /> : <Navigate to="/auth" />}
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

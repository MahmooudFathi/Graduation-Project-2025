import "./App.css";
import React from "react";
import Home from "./Pages/Home/Home";
import City from "./Pages/City/City";
import Auth from "./Pages/Auth/Auth";
import Profile from "./Pages/Profile/Profile";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isTokenExpired } from "./checkTokenExpiration";
import toast from "react-hot-toast";

function App() {
  const navigate = useNavigate();

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
        <div className="blur" style={{ top: "-18%", right: "0" }}></div>
        <div className="blur" style={{ top: "36%", left: "-8rem" }}></div>
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
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

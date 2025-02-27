import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./Auth.css";
import Logo from "../../img/logo.png";

const loginUser = async (inputs) => {
  const response = await axios.post(
    "http://graduation.amiralsayed.me/api/auth/login",
    inputs
  );
  return response.data;
};

const Auth = () => {
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (!data.token) throw new Error("No token received");
      localStorage.setItem("token", data.token);
      localStorage.setItem("loginTime", Date.now());
      navigate("/");
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(inputs);
  };

  return (
    <div className="Auth">
      <div className="a-left">
        <img src={Logo} alt="Logo" />
        <div className="Webname">
          <h1>City Media</h1>
          <h6>Explore the ideas throughout the world</h6>
        </div>
      </div>

      <div className="a-right">
        <form className="infoForm authForm" onSubmit={handleSubmit}>
          <h3>Log In</h3>

          <input
            type="email"
            placeholder="Email"
            className="infoInput"
            name="email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="infoInput"
            name="password"
            onChange={handleChange}
            required
          />

          <button
            className="button infoButton"
            type="submit"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Logging in..." : "Login"}
          </button>

          {mutation.isError && (
            <p style={{ color: "red" }}>
              ❌ {mutation.error?.message || "Login failed. Please try again."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;

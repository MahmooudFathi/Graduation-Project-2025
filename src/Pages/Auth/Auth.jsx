import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import "./Auth.css";
import Logo from "../../img/logo.png";

const loginUser = async ({ email, password }) => {
  const response = await axios.post(
    "https://graduation.amiralsayed.me/api/auth/login",
    { email, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

const registerUser = async ({ fullName, phoneNumber, email, password }) => {
  const response = await axios.post(
    "https://cms-central-ffb6acaub5afeecj.uaenorth-01.azurewebsites.net/api/Auth/register",
    { fullName, phoneNumber, email, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPass, setConfirmPass] = useState(true);
  const [inputs, setInputs] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmpass: "",
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: isSignUp ? registerUser : loginUser,
    retry: false,
    onSuccess: (data) => {
      if (isSignUp) {
        // After successful signup, switch to login form
        setIsSignUp(false);
        resetForm();
      } else {
        // For login, proceed as before
        const token = data.token || data.registrationToken;
        const userId = data.user?.id || data.newUser?.id;
        if (!token || !userId) throw new Error("Invalid response");
        login(token, userId);
        navigate("/");
      }
    },
    onError: (error) => {
      console.error(`${isSignUp ? "Sign Up" : "Login"} failed:`, error);
    },
  });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (inputs.password !== inputs.confirmpass) {
        setConfirmPass(false);
        return;
      }
      mutation.mutate(inputs);
    } else {
      const { email, password } = inputs;
      mutation.mutate({ email, password });
    }
    setConfirmPass(true);
  };

  const resetForm = () => {
    setInputs({
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmpass: "",
    });
    setConfirmPass(true);
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
          <h3>{isSignUp ? "Sign Up" : "Log In"}</h3>

          {isSignUp && (
            <div>
              <input
                required
                type="text"
                placeholder="Full Name"
                className="infoInput"
                name="fullName"
                value={inputs.fullName}
                onChange={handleChange}
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                className="infoInput"
                name="phoneNumber"
                value={inputs.phoneNumber}
                onChange={handleChange}
              />
            </div>
          )}

          <input
            required
            type="email"
            placeholder="Email"
            className="infoInput"
            name="email"
            value={inputs.email}
            onChange={handleChange}
          />

          <div>
            <input
              required
              type="password"
              className="infoInput"
              placeholder="Password"
              name="password"
              value={inputs.password}
              onChange={handleChange}
            />
            {isSignUp && (
              <input
                required
                type="password"
                className="infoInput"
                name="confirmpass"
                placeholder="Confirm Password"
                value={inputs.confirmpass}
                onChange={handleChange}
              />
            )}
          </div>

          <span
            style={{
              color: "red",
              fontSize: "12px",
              alignSelf: "flex-end",
              marginRight: "5px",
              display: confirmPass ? "none" : "block",
            }}
          >
            *Confirm password does not match
          </span>

          <div>
            <span
              style={{
                fontSize: "12px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => {
                resetForm();
                setIsSignUp((prev) => !prev);
              }}
            >
              {isSignUp
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </span>

            <button
              className="button infoButton"
              type="Submit"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading
                ? "Loading..."
                : isSignUp
                ? "Sign Up"
                : "Login"}
            </button>
            {mutation.isError && (
              <p style={{ color: "red" }}>
                ❌{" "}
                {mutation.error?.response?.data?.message ||
                  mutation.error?.message ||
                  `${isSignUp ? "Sign Up" : "Login"} failed. Please try again.`}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;

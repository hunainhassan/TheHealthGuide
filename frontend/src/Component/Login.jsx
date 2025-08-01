import React, { useState, useEffect } from 'react';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from 'react-router-dom';
import styles from '../style/Login.module.css';

export default function Login() {
  const [email, setEmail] = useState(""); 
  const [pswd, setPswd] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    window.google.accounts.id.initialize({
      client_id: "461821241114-7dg2udvpgqq3qjogop859g9v6ge4s82a.apps.googleusercontent.com", // 🔁 Replace this with your actual Client ID
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      { theme: "outline", size: "large", width: "100%" }
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await axios.post("http://localhost:3001/gym/google-login", {
        token: response.credential,
      });

      const data = res.data;
      localStorage.setItem("user_information", JSON.stringify(data.user));
      toast.success("Login successful with Google!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  async function login_func() {
    try {
      let response = await axios.post("http://localhost:3001/gym/log", {
        email: email,
        password: pswd
      });

      let data = response.data;
      localStorage.setItem("user_information", JSON.stringify(data.user));

      toast.success(data.msg);

      setEmail("");
      setPswd("");

      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data.msg);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <ToastContainer />
      <div className={styles.loginBox}>
        <h2 className={styles.heading}>Welcome Back! </h2>

        <label htmlFor="email" className={styles.label}>
          <i className="fa fa-user" style={{ fontSize: '1.5rem', marginRight: '10px' }}></i>
          Email Address
        </label>
        <input 
          type="email" 
          id="email" 
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />

        <label htmlFor="password" className={styles.label}>Password</label>
        <input 
          type="password" 
          id="password" 
          className={styles.input}
          value={pswd}
          onChange={(e) => setPswd(e.target.value)} 
        />

        <button className={styles.loginButton} onClick={login_func}>Login</button>

        {/* Google Sign-In */}
        <div id="googleSignInDiv" style={{ marginTop: "20px", textAlign: "center" }}></div>

        <p style={{ marginTop: "1rem", color: "#004d4d", fontSize: "1.1rem", textAlign: "center", fontWeight: "500" }}>
          Don't have an account?{" "}
          <Link to="/reg" style={{ color: "#004d4d", textDecoration: "underline", fontSize: "1.1rem", fontWeight: "600" }}>
            Register Now
          </Link>
        </p>

        <p style={{ marginTop: "1rem", color: "#004d4d", fontSize: "1.1rem", textAlign: "center", fontWeight: "500" }}>
          Forgot your password?{" "}
          <Link to="/fp" style={{ color: "red", textDecoration: "underline", fontSize: "1.1rem", fontWeight: "700" }}>
            Reset it here
          </Link>
        </p>

        <div style={{ textAlign: "center" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "5px 10px",
              backgroundColor: "#004d4d",
              color: "white",
              fontSize: "1rem",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}>
              Go to Main Page
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      const role = response.data.user.role;

      if (role === "student") {
        navigate("/student");
      } else {
        navigate("/staff");
      }

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>EduSupport</h1>

        <p>Student Support & Ticket Management</p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button type="submit">
            Login
          </button>

        </form>

        <p>
          Don't have an account?
          <a href="/register"> Register</a>
        </p>

      </div>

    </div>
  );
}

export default Login;
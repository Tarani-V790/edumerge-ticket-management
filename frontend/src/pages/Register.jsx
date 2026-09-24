import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await api.post(
        "/auth/register",
        form
      );

      alert("Registration successful");

      navigate("/");

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Registration failed"
      );

    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>Create Account</h1>

        <form onSubmit={handleSubmit}>

          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">
              Student
            </option>

            <option value="staff">
              Staff
            </option>

            <option value="manager">
              Manager
            </option>

          </select>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button type="submit">
            Register
          </button>

        </form>

      </div>

    </div>
  );
}

export default Register;
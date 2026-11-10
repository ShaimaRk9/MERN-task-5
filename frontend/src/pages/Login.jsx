
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const response = await API.post(endpoint, formData);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const loggedInUser = response.data.user;

if (loggedInUser.role === "admin") {
  navigate("/admin-dashboard");
} else {
  navigate("/user-dashboard");
}
    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsRegister(!isRegister);
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isRegister ? "Create Account" : "Welcome Back!"}</h1>

        <p>
          {isRegister
            ? "Register to manage your notes"
            : "Login to your Notes Management System"}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="login-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                minLength="2"
                required
              />
            </div>
          )}

          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p className="login-register">
          {isRegister
            ? "Already have an account? "
            : "Don't have an account? "}

          <span onClick={toggleForm}>
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;

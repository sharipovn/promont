import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthProvider';
import "./LoginScreen.css"; 
import Alert from "../components/Alert";
import { useI18n } from '../context/I18nProvider';




export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { reloadTranslations } = useI18n();


  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    await login(username, password); // 🔥 bu yetarli
    reloadTranslations(); // 🔥 fetch latest translations after login
    navigate("/dashboard");
  } catch (err) {
    setError("Invalid username or password");
  }
};


  return (
    <div className="col-xl-2 col-md-2 col-lg-2 col-sm-4 col-xxl-3">
      <div className="blob top-left"></div>
      <div className="blob bottom-right"></div>

      <div className="form-container">
        <h3 className="title">My Account</h3>
        <Alert message={error} type="info" />

        <form className="form-horizontal" onSubmit={handleSubmit}>
          <div className="form-icon">
            <i className="fa fa-user-circle"></i>
          </div>

          <div className="form-group">
            <span className="input-icon"><i className="fa fa-user"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <span className="input-icon"><i className="fa fa-lock"></i></span>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="forgot"><a href="/">Forgot Password?</a></span>
          </div>

          <button type="submit" className="btn signin">Login</button>
        </form>
      </div>
      </div>
  );
}

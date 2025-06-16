import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthProvider';
import "./LoginScreen.css";
import Alert from "../components/Alert";
import { useI18n } from '../context/I18nProvider';

// 🔤 Static translations for login screen
const translations = {
  en: {
    title: "My Account",
    username: "Username",
    password: "Password",
    forgot: "Forgot Password?",
    login: "Login",
    lang: "Eng",
  },
  uz: {
    title: "Shaxsiy kabinet",
    username: "Foydalanuvchi nomi",
    password: "Parol",
    forgot: "Parolni unutdingizmi?",
    login: "Kirish",
    lang: "O'zb",
  },
  ru: {
    title: "Мой аккаунт",
    username: "Имя пользователя",
    password: "Пароль",
    forgot: "Забыли пароль?",
    login: "Войти",
    lang: "Рус",
  },
};

// Button labels in all 3 languages
const langLabels = {
  en: "Eng",
  uz: "O'zb",
  ru: "Рус",
};

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { reloadTranslations, changeLanguage } = useI18n();

  const getLang = () => localStorage.getItem("promont_lang_code") || "ru";
  const [lang, setLang] = useState(getLang());
  const t = translations[lang];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      reloadTranslations();
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const handleLanguageChange = (code) => {
    localStorage.setItem("promont_lang_code", code);
    setLang(code);
    changeLanguage(code);
  };

  return (
    <div className="col-xl-3 col-md-3 col-lg-3 col-sm-4 col-xxl-3">
      <div className="blob top-left"></div>
      <div className="blob bottom-right"></div>

      <div className="form-container">
        {/* 🌐 Language Switcher */}
        <div className="d-flex justify-content-center gap-2 mb-4 mt-4">
          {["en", "uz", "ru"].map((code) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`btn ${lang === code ? "btn-primary" : "btn-outline-light"}`}
            >
              {langLabels[code]}
            </button>
          ))}
        </div>

        <h3 className="title">{t.title}</h3>
        <Alert message={error} type="info" />

        <form className="form-horizontal" onSubmit={handleSubmit}>
          <div className="form-icon">
            <i className="fa fa-user-circle"></i>
          </div>

          <div className="form-group mt-4">
            <span className="input-icon"><i className="fa fa-user"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder={t.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group mt-4">
            <span className="input-icon"><i className="fa fa-lock"></i></span>
            <input
              type="password"
              className="form-control"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="forgot"><a href="/">{t.forgot}</a></span>
          </div>

          <button type="submit" className="btn signin mt-4">{t.login}</button>
        </form>
      </div>
    </div>
  );
}

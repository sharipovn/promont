import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/fonts.css';
// import './bootstrap.min.css'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthProvider';
import { I18nProvider } from './context/I18nProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <AuthProvider>
         <I18nProvider>
        <App />
        </I18nProvider>
      </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();

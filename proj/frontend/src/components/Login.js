import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.message === 'Вход выполнен успешно') {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Вход</h2>
        {error && <p className="login-error">{error}</p>}
        <div className="login-input-group">
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="login-input-group">
          <input
            type="password"
            className="login-input"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-button" onClick={handleLogin}>
          Войти
        </button>
        <p className="login-register-link">
          Нет аккаунта?{' '}
          <span onClick={() => navigate('/register')}>Зарегистрироваться</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

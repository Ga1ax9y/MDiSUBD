import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        name,
        email,
        password,
      });
      setSuccess(response.data.message);
      setError('');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
      setSuccess('');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Регистрация</h2>
        {error && <p className="register-error">{error}</p>}
        {success && <p className="register-success">{success}</p>}
        <input
          type="text"
          placeholder="Имя"
          className="register-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="register-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          className="register-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="register-button" onClick={handleRegister}>
          Зарегистрироваться
        </button>
        <p className="register-login-link">
          Уже есть аккаунт? <span onClick={() => navigate('/')}>Войти</span>
        </p>
      </div>
    </div>
  );
};

export default Register;

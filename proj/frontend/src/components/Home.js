import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/current', {
          withCredentials: true,
        });
        setUser(response.data.currentUser);
      } catch (err) {
        navigate('/');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    }
  };

  if (!user) {
    return <p className="loading">Загрузка...</p>;
  }

  return (
    <div className="home-container">
      <div className="welcome-card">
        <h2>Добро пожаловать, <span className="user-name">{user.name}</span>!</h2>
        <p className="user-email">Email: {user.email}</p>
        <button className="logout-button" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Home;

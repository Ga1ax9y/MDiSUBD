import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/home">Главная</Link></li>
        <li><Link to="/tests">Тесты</Link></li>
        <li><Link to="/profile">Профиль</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;

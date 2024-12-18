import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import TestsPage from './components/TestsPage';
import TestQuestionsPage from './components/TestQuestionsPage';
import UserProfile from './components/UserProfile';
import ManagementPage from './components/ManagementPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/management" element={<ManagementPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/test/:test_id/questions" element={<TestQuestionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

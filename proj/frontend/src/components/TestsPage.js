import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TestsPage.css';

const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [error, setError] = useState('');
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null); 
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    category_id: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/api/auth/current', { withCredentials: true })
      .then(response => {
        setRole(response.data.currentUser.role_id);
        setUserId(response.data.currentUser.id);
      })
      .catch(err => {
        setError('Ошибка при получении информации о пользователе');
        navigate('/login');
      });

    axios.get('http://localhost:3000/api/tests')
      .then(response => {
        setTests(response.data);
        setFilteredTests(response.data);

        const allCategories = ['Все', ...new Set(response.data.map(test => test.category_name))];
        setCategories(allCategories);
      })
      .catch(err => {
        setError('Ошибка при получении тестов');
      });
  }, [navigate]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'Все') {
      setFilteredTests(tests);
    } else {
      const filtered = tests.filter(test => test.category_name === category);
      setFilteredTests(filtered);
    }
  };

  const handleRegisterTest = async (test_id) => {
    if (!userId) {
      setError('Ошибка: не удалось получить информацию о пользователе');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/tests/register', {
        test_id,
        user_id: userId,
      }, { withCredentials: true });

      navigate(`/test/${test_id}/questions`);
    } catch (err) {
      setError('Ошибка при регистрации на тест');
    }
  };

  const handleDeleteTest = async (test_id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тест?')) {
      try {
        await axios.delete(`http://localhost:3000/api/tests/${test_id}`, { withCredentials: true });
        setTests(tests.filter(test => test.id !== test_id));
        setFilteredTests(filteredTests.filter(test => test.id !== test_id));
      } catch (err) {
        setError('Ошибка при удалении теста');
      }
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!newTest.title || !newTest.description || !newTest.category_id) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    try {

      await axios.post('http://localhost:3000/api/tests/create', {
        title: newTest.title,
        description: newTest.description,
        category_id: newTest.category_id,
        organizer_id: userId,
      }, { withCredentials: true });

      setNewTest({ title: '', description: '', category_id: '' });
      alert('Тест успешно создан');
    } catch (err) {
      setError('Ошибка при создании теста');
    }
  };

  return (
    <div className="tests-container">
      <h2>Все тесты</h2>
      {error && <p className="error-message">{error}</p>}

      {}
      <div className="category-filter">
        <label htmlFor="category">Фильтр по категории:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {}
      <div className="tests-list">
        {filteredTests.length > 0 ? (
          filteredTests.map((test) => (
            <div key={test.id} className="test-item">
              <h3>{test.title}</h3>
              <p>{test.description}</p>
              <p>Категория: {test.category_name}</p>
              <button className="test-button" onClick={() => handleRegisterTest(test.id)}>Начать тест</button>
              {role === 1 && (
                <>
                  <button className="delete-button" onClick={() => handleDeleteTest(test.id)}>Удалить тест</button>
                </>
              )}
            </div>
          ))
        ) : (
          <p>Нет тестов в выбранной категории.</p>
        )}
      </div>

      {}
      {role === 1 && (
        <div>
          <h3>Добавить новый тест</h3>
          <form onSubmit={handleCreateTest}>
            <input
              type="text"
              placeholder="Название теста"
              value={newTest.title}
              onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
            />
            <textarea
              placeholder="Описание теста"
              value={newTest.description}
              onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
            />
            <select
              value={newTest.category_id}
              onChange={(e) => setNewTest({ ...newTest, category_id: e.target.value })}
            >
              <option value="">Выберите категорию</option>
              {categories.map((category, index) => (
                category !== 'Все' && (
                  <option key={index} value={category}>{category}</option>
                )
              ))}
            </select>
            <button type="submit">Создать тест</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TestsPage;

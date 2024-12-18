import React, { useState } from 'react';
import axios from 'axios';
import './ManagementPage.css';

const ManagementPage = () => {
  const [queryType, setQueryType] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleExecuteQuery = async () => {
    if (!queryType) {
      setError('Выберите запрос для выполнения');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/auth/admin/queries`, {
        params: { queryType },
        withCredentials: true,
      });
      setResults(response.data);
      setError('');
    } catch (err) {
      setError('Ошибка при выполнении запроса');
      console.error(err);
    }
  };

  return (
    <div className="management-container">
      <h2>Страница менеджмента</h2>
      <div className="query-controls">
        <label>Выберите запрос:</label>
        <select value={queryType} onChange={(e) => setQueryType(e.target.value)} className="query-select">
          <option value="">-- Выберите запрос --</option>
          <option value="simpleUsers">Пользователи с ролью 2 (после 3 ноября)</option>
          <option value="highScores">Пользователи с баллом больше 80</option>
          <option value="testRegistrations">Тесты и количество регистраций</option>
          <option value="organizerTests">Организаторы и их тесты</option>
          <option value="testResults">Тесты, пользователи и результаты</option>
          <option value="registrationStatus">Статус регистрации пользователей</option>
          <option value="testReviews">Отзывы по тестам</option>
          <option value="userCategories">Комбинации пользователей и категорий тестов</option>
          <option value="usersWithSameRole">Пары пользователей с одинаковыми ролями</option>
          <option value="testsByCategory">Количество тестов по категориям</option>
          <option value="maxScoreByTest">Максимальный балл по каждому тесту</option>
          <option value="averageScoreAbove85">Тесты со средним баллом выше 85</option>
          <option value="usersAndTestsUnion">Объединение пользователей и тестов</option>
          <option value="userRanks">Ранги пользователей по баллам</option>
          <option value="userRoleCounts">Количество пользователей по ролям</option>
          <option value="completedTests">Пользователи с завершёнными тестами</option>
          <option value="userGrades">Оценки пользователей на основе баллов</option>
          <option value="explainQuery">План выполнения запроса</option>
        </select>
        <button onClick={handleExecuteQuery} className="execute-button">Выполнить запрос</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="results-container">
        <h3>Результаты:</h3>
        {results.length > 0 ? (
          <table className="results-table">
            <thead>
              <tr>
                {Object.keys(results[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Нет данных для отображения</p>
        )}
      </div>
    </div>
  );
};

export default ManagementPage;

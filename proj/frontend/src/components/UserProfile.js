import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    address: '',
    phone_number: '',
    birth_date: '',
  });
  const [testResults, setTestResults] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    phone_number: '',
    birth_date: '',
  });
  const [reviewData, setReviewData] = useState({ rating: '', comment: '' });
  const [currentTestId, setCurrentTestId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/userprofile', { withCredentials: true })
      .then(response => {
        setUserProfile(response.data);
        setFormData({
          address: response.data.address,
          phone_number: response.data.phone_number,
          birth_date: response.data.birth_date,
        });
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Ошибка при получении профиля');
      });

    axios.get('http://localhost:3000/api/testresults', { withCredentials: true })
      .then(response => {
        setTestResults(response.data);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Ошибка при получении результатов тестов');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData({
      ...reviewData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    axios.put('http://localhost:3000/api/userprofile', formData, { withCredentials: true })
      .then(response => {
        setUserProfile(formData);
        setIsEditing(false);
        alert('Профиль успешно обновлен');
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Ошибка при обновлении профиля');
      });
  };

  const handleReviewSubmit = (testId) => {
    if (!reviewData.rating || !reviewData.comment) {
      setError('Пожалуйста, заполните все поля отзыва');
      return;
    }

    axios.post('http://localhost:3000/api/review', {
      test_id: testId,
      rating: reviewData.rating,
      comment: reviewData.comment
    }, { withCredentials: true })
      .then(response => {
        alert('Отзыв успешно оставлен!');
        setReviewData({ rating: '', comment: '' });
        setCurrentTestId(null);
      })
      .catch(err => {
        setError('Ошибка при отправке отзыва');
      });
  };

  if (error) {
    return <div className="userProfile-error">{error}</div>;
  }

  return (
    <div className="userProfile-container">
      <h2 className="userProfile-heading">Ваш профиль</h2>
      {isEditing ? (
        <div className="userProfile-editForm">
          <div className="userProfile-formGroup">
            <label className="userProfile-label">Адрес:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="userProfile-input"
            />
          </div>
          <div className="userProfile-formGroup">
            <label className="userProfile-label">Телефон:</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="userProfile-input"
            />
          </div>
          <div className="userProfile-formGroup">
            <label className="userProfile-label">Дата рождения:</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="userProfile-input"
            />
          </div>
          <button onClick={handleSubmit} className="userProfile-button">Сохранить изменения</button>
        </div>
      ) : (
        <div className="userProfile-info">
          <p><strong>Адрес:</strong> {userProfile.address}</p>
          <p><strong>Телефон:</strong> {userProfile.phone_number}</p>
          <p><strong>Дата рождения:</strong> {userProfile.birth_date}</p>
          <button onClick={() => setIsEditing(true)} className="userProfile-button">Редактировать</button>
        </div>
      )}

      <h3 className="userProfile-heading">Пройденные тесты</h3>
      {testResults.length > 0 ? (
        <ul className="userProfile-testResults">
          {testResults.map((result) => (
            <li key={result.id} className="userProfile-testResultItem">
              <p><strong>Тест:</strong> {result.test_title}</p>
              <p><strong>Баллы:</strong> {result.score}</p>
              <p><strong>Дата завершения:</strong> {new Date(result.completion_time).toLocaleString()}</p>

              {}
              <button
                onClick={() => setCurrentTestId(result.test_id)}
                className="userProfile-reviewButton"
              >
                Оставить отзыв
              </button>

              {}
              {currentTestId === result.test_id && (
                <div className="userProfile-reviewForm">
                  <div className="userProfile-formGroup">
                    <label className="userProfile-label">Оценка (1-5):</label>
                    <input
                      type="number"
                      name="rating"
                      value={reviewData.rating}
                      onChange={handleReviewChange}
                      min="1"
                      max="5"
                      className="userProfile-input"
                    />
                  </div>
                  <div className="userProfile-formGroup">
                    <label className="userProfile-label">Комментарий:</label>
                    <textarea
                      name="comment"
                      value={reviewData.comment}
                      onChange={handleReviewChange}
                      className="userProfile-textarea"
                    />
                  </div>
                  <button onClick={() => handleReviewSubmit(result.test_id)} className="userProfile-button">Отправить отзыв</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="userProfile-noResults">Вы не прошли ни одного теста.</p>
      )}
    </div>
  );
};

export default UserProfile;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './TestQuestionsPage.css';

const TestQuestionsPage = () => {
  const { test_id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [user_id, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/api/tests/${test_id}/questions`)
      .then(response => {
        setQuestions(response.data);
      })
      .catch(err => {
        setError('Ошибка при получении вопросов');
      });

    axios.get('http://localhost:3000/api/auth/current', { withCredentials: true })
      .then(response => {
        setUserId(response.data.currentUser.id);
      })
      .catch(err => {
        setError('Ошибка при получении информации о пользователе');
      });
  }, [test_id]);

  const handleAnswerChange = (question_id, answer_id) => {
    setAnswers({
      ...answers,
      [question_id]: answer_id,
    });
  };

  const handleSubmit = () => {
    if (!user_id) {
      setError('Вы не авторизованы');
      return;
    }

    axios.post(`http://localhost:3000/api/tests/${test_id}/submit`, {
      user_id,
      answers,
    })
    .then(response => {
      alert('Результаты успешно сохранены');
      navigate('/home');
    })
    .catch(error => {
      console.error('Ошибка при отправке результатов', error);
      alert('Ошибка при отправке результатов');
    });
  };

  return (
    <div className="test-questions-container">
      <h2 className="test-questions-heading">Вопросы теста</h2>
      {error && <p className="error-message">{error}</p>}

      {questions.map((question) => (
        <div key={question.id} className="test-question">
          <h3>{question.text}</h3>
          <div className="test-answer-options">
            {question.answers.map((answer) => (
              <div key={answer.id}>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={answer.id}
                  onChange={() => handleAnswerChange(question.id, answer.id)}
                />
                <label>{answer.text}</label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSubmit} className="submit-button">Отправить ответы</button>
    </div>
  );
};

export default TestQuestionsPage;

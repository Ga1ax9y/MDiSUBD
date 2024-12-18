const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT t.id, t.title, t.description, c.name AS category_name, t.created_at, t.organizer_id
      FROM test t
      JOIN TestCategory c ON t.category_id = c.id
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении тестов' });
  }
});


router.post('/create', async (req, res) => {
    const { title, description, organizer_id, category_id } = req.body;

    if (!title || !description || !organizer_id || !category_id) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    try {
      let categoryId;
      if (category_id !== '') {
        const categoryResult = await db.query('SELECT id FROM TestCategory WHERE name = $1', [category_id]);
        if (categoryResult.rows.length > 0) {
          categoryId = categoryResult.rows[0].id;
        } else {
          return res.status(400).json({ error: 'Категория не найдена' });
        }
      }

      const query = `
        INSERT INTO Test (title, description, organizer_id, category_id, created_at)
        VALUES ($1, $2, $3, $4, NOW()) RETURNING id
      `;
      const result = await db.query(query, [title, description, organizer_id, categoryId]);

      res.status(201).json({ message: 'Тест успешно создан', id: result.rows[0].id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при создании теста' });
    }
  });


router.post('/register', async (req, res) => {
    const { test_id, user_id } = req.body;

    const checkQuery = `
      SELECT * FROM TestRegistration
      WHERE user_id = $1 AND test_id = $2
    `;
    try {
      const checkResult = await db.query(checkQuery, [user_id, test_id]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'Вы уже зарегистрированы на этот тест' });
      }

      const status = 'registered';
      const insertQuery = `
        INSERT INTO TestRegistration (user_id, test_id, status)
        VALUES ($1, $2, $3)
      `;
      await db.query(insertQuery, [user_id, test_id, status]);

      res.status(201).json({ message: 'Вы успешно зарегистрированы на тест' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT t.id, t.title, t.description, c.name AS category_name, t.created_at, t.organizer_id
        FROM Test t
        JOIN TestCategory c ON t.category_id = c.id
        WHERE t.id = $1
      `;
      const result = await db.query(query, [id]);
      console.log('Результат запроса:', result.rows);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Тест не найден' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при получении теста' });
    }
  });

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, category_id } = req.body;

  if (!title || !description || !category_id) {
    return res.status(400).json({ error: 'Все поля обязательны для обновления' });
  }

  try {
    const query = `
      UPDATE Test
      SET title = $1, description = $2, category_id = $3, updated_at = NOW()
      WHERE id = $4 RETURNING id
    `;
    const result = await db.query(query, [title, description, category_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест не найден' });
    }

    res.json({ message: 'Тест успешно обновлен' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обновлении теста' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      DELETE FROM Test
      WHERE id = $1 RETURNING id
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест не найден' });
    }

    res.json({ message: 'Тест успешно удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении теста' });
  }
});

router.get('/:test_id/questions', async (req, res) => {
    const test_id = req.params.test_id;

    try {
      const query = `
        SELECT q.id AS question_id, q.text AS question_text, a.id AS answer_id, a.text AS answer_text, a.is_correct
        FROM Question q
        JOIN Answer a ON q.id = a.question_id
        WHERE q.test_id = $1
        ORDER BY q.id
      `;
      const result = await db.query(query, [test_id]);
      const questions = result.rows.reduce((acc, row) => {
        const { question_id, question_text, answer_id, answer_text, is_correct } = row;
        let question = acc.find(q => q.id === question_id);

        if (!question) {
          question = { id: question_id, text: question_text, answers: [] };
          acc.push(question);
        }

        question.answers.push({
          id: answer_id,
          text: answer_text,
          is_correct: is_correct,
        });

        return acc;
      }, []);

      res.json(questions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при получении вопросов' });
    }
  });

  router.post('/:test_id/submit', async (req, res) => {
    const { test_id } = req.params;
    const { user_id, answers } = req.body;

    console.log('Полученные данные:', { user_id, answers });

    let score = 0;

    try {
      for (const question_id in answers) {
        const answer_id = answers[question_id];

        console.log(`Проверка ответа для вопроса ${question_id}: выбранный ответ ${answer_id}`);

        const query = `
          SELECT is_correct
          FROM Answer
          WHERE id = $1 AND question_id = $2
        `;
        const result = await db.query(query, [answer_id, question_id]);

        if (result.rows.length > 0 && result.rows[0].is_correct) {
          score += 1;
        } else {
          console.log(`Ответ неверный для вопроса ${question_id}`);
        }
      }

      const completion_time = new Date();
      const insertResultQuery = `
        INSERT INTO TestResult (user_id, test_id, score, completion_time)
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(insertResultQuery, [user_id, test_id, score, completion_time]);

      res.status(200).json({ message: 'Результаты успешно сохранены', score });
    } catch (error) {
      console.error('Ошибка при обработке результатов:', error);
      res.status(500).json({ error: 'Ошибка при отправке результатов' });
    }
  });


module.exports = router;

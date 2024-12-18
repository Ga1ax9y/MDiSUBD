const express = require('express');
const router = express.Router();
const db = require('../db');



router.post('/', async (req, res) => {
    const { test_id, rating, comment } = req.body;
    const user_id = req.session.user.id;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Пожалуйста, заполните все поля отзыва' });
    }

    try {
      const query = `
        INSERT INTO Review (user_id, test_id, rating, comment)
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(query, [user_id, test_id, rating, comment]);
      res.status(201).json({ message: 'Отзыв успешно добавлен' });
    } catch (error) {
      console.error('Ошибка при добавлении отзыва:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

router.get('/reviews', async (req, res) => {
    try {
      const query = `
        SELECT r.id, r.test_id, r.rating, r.comment, r.created_at, u.name AS user_name
        FROM Review r
        JOIN "User" u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `;
      const result = await db.query(query);

      res.json(result.rows);
    } catch (error) {
      console.error('Ошибка при получении отзывов:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/register', async (req, res) => {
  const { name, email, password, role_id } = req.body;
  try {
    const query = `
      INSERT INTO "User" (name, email, password, role_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    await db.query(query, [name, email, password, role_id || 2]);
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "User"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

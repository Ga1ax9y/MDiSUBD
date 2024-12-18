const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const user_id = req.session.user.id;
    try {
      const query = `
        SELECT * FROM UserProfile WHERE user_id = $1
      `;
      const result = await db.query(query, [user_id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Профиль не найден' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


router.put('/', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const user_id = req.session.user.id;
    const { address, phone_number, birth_date } = req.body;
    try {
      const query = `
        UPDATE UserProfile
        SET address = $1, phone_number = $2, birth_date = $3
        WHERE user_id = $4
      `;
      await db.query(query, [address, phone_number, birth_date, user_id]);
      res.json({ message: 'Профиль успешно обновлен' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;

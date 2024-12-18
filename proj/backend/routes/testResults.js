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
        SELECT tr.*, t.title AS test_title
        FROM TestResult tr
        JOIN Test t ON tr.test_id = t.id
        WHERE tr.user_id = $1
      `;
      const result = await db.query(query, [user_id]);

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



module.exports = router;

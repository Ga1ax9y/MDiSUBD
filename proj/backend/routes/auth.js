const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/register', async (req, res) => {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Заполните все поля: имя, email и пароль' });
    }

    try {
      const checkQuery = `SELECT * FROM "User" WHERE email = $1`;
      const existingUser = await db.query(checkQuery, [email]);

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
      }

      const insertQuery = `
        INSERT INTO "User" (name, email, password, role_id, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `;
      await db.query(insertQuery, [name, email, password, role_id || 2]);
      res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
      console.error('Ошибка при регистрации:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' });
  }

  try {
    const query = `SELECT * FROM "User" WHERE email = $1`;
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id
    };

    res.json({ message: 'Вход выполнен успешно', user: req.session.user });
  } catch (error) {
    console.error('Ошибка при входе:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/current', (req, res) => {
  if (req.session.user) {
    res.json({ currentUser: req.session.user });
  } else {
    res.status(401).json({ error: 'Пользователь не авторизован' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при выходе' });
    }
    res.json({ message: 'Вы успешно вышли из аккаунта' });
  });
});

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role_id === 1) {
      next();
    } else {
      return res.status(403).json({ error: 'Доступ запрещён. Требуется роль администратора.' });
    }
  };

router.get('/admin/queries', isAdmin, async (req, res) => {
    const { queryType } = req.query;

    try {
      let result;

      switch (queryType) {
        case 'simpleUsers':
          result = await db.query(`
            SELECT * FROM "User"
            WHERE role_id = 2 AND created_at >= '2024-11-03'
          `);
          break;

        case 'highScores':
          result = await db.query(`
            SELECT name FROM "User"
            WHERE id IN (SELECT user_id FROM TestResult WHERE score >= 80)
          `);
          break;

        case 'testRegistrations':
          result = await db.query(`
            SELECT title,
                   (SELECT COUNT(*)
                    FROM TestRegistration
                    WHERE test_id = Test.id) AS registration_count
            FROM Test
            WHERE created_at BETWEEN '2024-11-01' AND '2024-11-30'
          `);
          break;

        case 'organizerTests':
          result = await db.query(`
            SELECT "User".name, Test.title
            FROM "User"
            INNER JOIN Test ON "User".id = Test.organizer_id
          `);
          break;

        case 'testResults':
          result = await db.query(`
            SELECT Test.title, "User".name, TestResult.score
            FROM Test
            RIGHT JOIN TestResult ON Test.id = TestResult.test_id
            RIGHT JOIN "User" ON TestResult.user_id = "User".id
          `);
          break;

        case 'registrationStatus':
          result = await db.query(`
            SELECT "User".name, Test.title, TestRegistration.status
            FROM "User"
            LEFT JOIN TestRegistration ON "User".id = TestRegistration.user_id
            LEFT JOIN Test ON TestRegistration.test_id = Test.id
          `);
          break;

        case 'testReviews':
          result = await db.query(`
            SELECT Test.title, Review.comment, Review.rating
            FROM Test
            FULL OUTER JOIN Review ON Test.id = Review.test_id
          `);
          break;

        case 'userCategories':
          result = await db.query(`
            SELECT "User".name, TestCategory.name AS category_name
            FROM "User"
            CROSS JOIN TestCategory
          `);
          break;

        case 'usersWithSameRole':
          result = await db.query(`
            SELECT a.name AS User1, b.name AS User2, a.role_id
            FROM "User" a
            JOIN "User" b ON a.role_id = b.role_id AND a.id <> b.id
          `);
          break;

        case 'testsByCategory':
          result = await db.query(`
            SELECT TestCategory.name AS CategoryName, COUNT(Test.id) AS TestCount
            FROM Test
            JOIN TestCategory ON Test.category_id = TestCategory.id
            GROUP BY TestCategory.name
          `);
          break;

        case 'maxScoreByTest':
          result = await db.query(`
            SELECT test_id, score,
                   MAX(score) OVER (PARTITION BY test_id) AS MaxScore
            FROM TestResult
          `);
          break;

        case 'averageScoreAbove85':
          result = await db.query(`
            SELECT Test.title AS test_title, AVG(TestResult.score) AS average_score
            FROM TestResult
            JOIN Test ON TestResult.test_id = Test.id
            GROUP BY Test.id, Test.title
            HAVING AVG(TestResult.score) > 85;
          `);
          break;

        case 'usersAndTestsUnion':
          result = await db.query(`
            SELECT name AS ParticipantName FROM "User"
            UNION
            SELECT title AS ParticipantName FROM Test
          `);
          break;

        case 'userRanks':
          result = await db.query(`
            SELECT u.name, tr.user_id, tr.score,
                RANK() OVER (ORDER BY tr.score DESC) AS Rank
            FROM TestResult tr
            JOIN "User" u ON tr.user_id = u.id
            ORDER BY Rank;
          `);
          break;

        case 'userRoleCounts':
          result = await db.query(`
            SELECT role_id, COUNT(*) AS UserCount
            FROM "User"
            GROUP BY role_id
          `);
          break;

        case 'completedTests':
          result = await db.query(`
            SELECT name
            FROM "User"
            WHERE EXISTS (
              SELECT 1
              FROM TestRegistration
              WHERE "User".id = TestRegistration.user_id
              AND TestRegistration.status = 'completed'
            )
          `);
          break;


        case 'userGrades':
          result = await db.query(`
            SELECT user_id, score,
                   CASE
                       WHEN score >= 90 THEN 'A'
                       WHEN score >= 80 THEN 'B'
                       WHEN score >= 70 THEN 'C'
                       ELSE 'D'
                   END AS Grade
            FROM TestResult
          `);
          break;

        case 'explainQuery':
          await db.query(`CALL get_test_details(1);`);
          result = await db.query(`
            EXPLAIN SELECT name FROM "User" WHERE role_id = 1
          `);
          break;

        default:
          return res.status(400).json({ error: 'Неверный тип запроса' });
      }

      res.json(result.rows);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }

  });



module.exports = router;

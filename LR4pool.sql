select * from "User" where role_id = 2 and created_at >= '2024-11-03';

select name from "User" where id in (select user_id from TestResult where score >= 80);

select title, (select count(*) from testregistration where test_id = Test.id) 
	as registration_count from test where created_at between '2024-11-01' AND '2024-11-30';

--Этот запрос получает имена организаторов и названия тестов, которые они создали.
select "User".name, test.title
from "User" inner join test on "User".id = Test.organizer_id;

/*Этот запрос возвращает названия тестов и пользователей, 
которые их проходили, вместе с их результатами.*/
SELECT Test.title, "User".name, TestResult.score FROM Test
RIGHT JOIN TestResult ON Test.id = TestResult.test_id
RIGHT JOIN "User" ON TestResult.user_id = "User".id;

/*Этот запрос возвращает всех пользователей вместе с названиями тестов, 
на которые они зарегистрировались, и статусом регистрации. 
*/
SELECT "User".name, Test.title, TestRegistration.status FROM "User"
LEFT JOIN TestRegistration ON "User".id = TestRegistration.user_id
LEFT JOIN Test ON TestRegistration.test_id = Test.id;

/*Этот запрос возвращает все тесты и соответствующие отзывы*/
SELECT Test.title, Review.comment, Review.rating FROM Test
FULL OUTER JOIN Review ON Test.id = Review.test_id;

/*Этот запрос возвращает все возможные комбинации пользователей и категорий тестов.*/
SELECT "User".name, TestCategory.name AS category_name FROM "User"
CROSS JOIN TestCategory;

/*Этот запрос возвращает пары пользователей с одинаковыми ролями.*/
SELECT a.name AS User1, b.name AS User2, a.role_id FROM "User" a
JOIN "User" b ON a.role_id = b.role_id AND a.id <> b.id;

/*Этот запрос возвращает количество тестов в каждой категории, 
группируя результаты по названию категории.*/
SELECT TestCategory.name AS CategoryName, COUNT(Test.id) AS TestCount FROM Test
JOIN TestCategory ON Test.category_id = TestCategory.id
GROUP BY TestCategory.name;

/*Этот запрос показывает баллы пользователей и максимальный балл для каждого теста, 
не группируя результаты.*/
SELECT test_id, score,
MAX(score) OVER (PARTITION BY test_id) AS MaxScore FROM TestResult;

/*Этот запрос возвращает тесты, где средний балл выше 85.*/
SELECT test_id, AVG(score) AS AverageScore FROM TestResult
GROUP BY test_id
HAVING AVG(score) > 85;

/*Этот запрос объединяет имена пользователей и названия тестов в один список, 
исключая дубликаты.*/
SELECT name AS ParticipantName FROM "User"
UNION
SELECT title AS ParticipantName FROM Test;

/*Этот запрос возвращает пользователям их ранг по баллам, 
учитывая возможные дубликаты.*/
SELECT user_id, score,
       RANK() OVER (ORDER BY score DESC) AS Rank
FROM TestResult;

/*Этот запрос возвращает количество пользователей в каждой роли.*/
SELECT role_id, COUNT(*) AS UserCount FROM "User"
GROUP BY role_id;

/*Этот запрос возвращает имена пользователей, 
у которых есть хотя бы один завершенный тест.*/
SELECT name
FROM "User"
WHERE EXISTS (SELECT 1 FROM TestRegistration 
	WHERE "User".id = TestRegistration.user_id 
	AND TestRegistration.status = 'completed');

/*Этот запрос копирует пользователей, 
зарегистрированных до 1 января 2024 года, в таблицу UserArchive.*/
INSERT INTO UserArchive (user_id, name, created_at)
SELECT id, name, created_at
FROM "User"
WHERE created_at < '2024-01-01';

/*Этот запрос возвращает оценки пользователей на основе их баллов в тестах.*/
SELECT user_id, score,
       CASE 
           WHEN score >= 90 THEN 'A'
           WHEN score >= 80 THEN 'B'
           WHEN score >= 70 THEN 'C'
           ELSE 'D' 
       END AS Grade
FROM TestResult;

/*Этот запрос покажет, как база данных будет выполнять запрос на выборку 
имен пользователей с ролью 1, включая информацию о том, какие индексы 
используются и как будут выполняться операции.*/
EXPLAIN SELECT name FROM "User" WHERE role_id = 1;

/**/
select Test.title,"User".id, TestResult.score 
from Test
join TestResult
on Test.id = TestResult.test_id
join "User"
on TestResult.user_id = "User".id;


select "User".name, Test.title
from "User"
join testregistration
on "User".id = testregistration.user_id
join Test
on testregistration.test_id = Test.id

SELECT 
    "User".name, "User".email, Review.comment,
    Test.title, Question.text
FROM "User" 
JOIN Review ON "User".id = Review.user_id
JOIN Test ON Review.test_id = Test.id
LEFT JOIN Question ON Question.test_id = Test.id;

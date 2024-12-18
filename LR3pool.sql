select * from testcategory;
select * from "User";
select * from question;
select * from answer;
select * from test;
delete from review;
select * from review;
ALTER SEQUENCE Review_id_seq RESTART WITH 1;
INSERT INTO TestResult (user_id, test_id, score, completion_time) VALUES 
(2, 1, 80, NOW()),
(8, 2, 85, NOW()),
(9, 3, 90, NOW()),
(10, 4, 70, NOW()),
(2, 5, 95, NOW()+interval '1 minute'),
(8, 6, 88, NOW()+interval '1 minute'),
(9, 7, 76, NOW()+interval '1 minute'),
(10, 8, 82, NOW()+interval '1 hour'),
(2, 9, 94, NOW()+interval '1 hour'),
(8, 10, 89, NOW()+interval '1 hour');
INSERT INTO Review (user_id, test_id, rating, comment) VALUES 
(2, 1, 5, 'Great test!'),
(8, 2, 4, 'Challenging and interesting.'),
(9, 3, 5, 'Good questions.'),
(10, 4, 3, 'Could be better.'),
(2, 5, 5, 'Loved it!'),
(8, 6, 4, 'Nice experience.'),
(9, 7, 3, 'Some questions were hard to understand.'),
(10, 8, 5, 'Very well structured.'),
(2, 9, 4, 'Interesting content.'),
(8, 10, 5, 'Perfect!');
UPDATE Question SET correct_answer_id = (SELECT id FROM Answer WHERE question_id = Question.id AND is_correct = TRUE);
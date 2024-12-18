CREATE OR REPLACE PROCEDURE delete_user_reviews_from_test(
    input_user_id INT,
    input_test_id INT
)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM Review
    WHERE user_id = input_user_id AND test_id = input_test_id;
END;
$$;

call delete_user_reviews_from_test(8,10);
select * from review;


-- Корректный ответ для вопроса
CREATE OR REPLACE FUNCTION set_correct_answer()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_correct THEN
        UPDATE Question
        SET correct_answer_id = NEW.id
        WHERE id = NEW.question_id;
    END IF;

    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_set_correct_answer
AFTER INSERT OR UPDATE ON Answer
FOR EACH ROW
EXECUTE FUNCTION set_correct_answer();

select * from answer;
select * from question;

INSERT INTO Question (test_id, text, correct_answer_id)
VALUES (1, 'What is 3 + 3?', NULL);

INSERT INTO Answer (question_id, text, is_correct)
VALUES (11, '6', TRUE);

/*Добавление роли студент для добавленных пользователей*/
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role_id IS NULL THEN
        NEW.role_id := 2;
		RAISE NOTICE 'Role ID was NULL and has been set to default value 2';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_default_role
BEFORE INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION assign_default_role();

select * from "User";
INSERT INTO "User" (name, email, password, created_at)
VALUES ('John Doe', 'john.doeTrigger@example.com', 'password123', CURRENT_TIMESTAMP);

-- Триггер для отслеживания удаления пользователя
CREATE OR REPLACE FUNCTION log_delete_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO UserLog (user_id, action, target_id, target_type, created_at)
    VALUES (
        NULL,  
        'DELETE',
        OLD.id,
        TG_TABLE_NAME,
        CURRENT_TIMESTAMP
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_delete_action
AFTER DELETE ON "User"
FOR EACH ROW
EXECUTE FUNCTION log_delete_action();

select * from "User";
DELETE FROM "User" WHERE email = 'john.doeTrigger@example.com';
select * from userlog;

--Триггер для автоматического создания профиля пользователя при регистрации
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO UserProfile (user_id, address, phone_number, birth_date)
    VALUES (NEW.id, NULL, NULL, NULL); 
    RETURN NULL;  
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_user_profile
AFTER INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();

-- Логирование регистрации пользователя
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO UserLog (user_id, action, target_id, target_type, created_at)
    VALUES (
        NEW.id,  
        'register',  
        NULL,    
        'User', 
        CURRENT_TIMESTAMP  
    );
    RETURN NULL; 
END;
$$ LANGUAGE plpgsql;

-- Триггер для логирования регистрации нового пользователя
CREATE TRIGGER trg_log_user_login
AFTER INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION log_user_login();

select * from "User";
select * from UserProfile;
select * from userlog;
INSERT INTO "User" (name, email, password, created_at)
VALUES ('John Doe', 'john.doeTrigger2@example.com', 'password123', CURRENT_TIMESTAMP);


CREATE OR REPLACE PROCEDURE update_user_profile(
    p_user_id INT,
    p_address VARCHAR,
    p_phone_number VARCHAR,
    p_birth_date DATE
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE UserProfile
    SET address = p_address,
        phone_number = p_phone_number,
        birth_date = p_birth_date
    WHERE user_id = p_user_id;
END;
$$;

select * from userprofile;
CALL update_user_profile(20, '123 Pipidonovo', '123-456-7890', '1990-01-01');

CREATE OR REPLACE PROCEDURE create_test(
    p_title VARCHAR,
    p_description TEXT,
    p_organizer_id INT,
    p_category_id INT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO Test (title, description, organizer_id, category_id, created_at)
    VALUES (p_title, p_description, p_organizer_id, p_category_id, CURRENT_TIMESTAMP);
END;
$$;
CALL create_test('Hockey Test', 'A challenging hockey test.', 1, 2);
select * from test;

CREATE OR REPLACE PROCEDURE register_user_for_test(
    p_user_id INT,
    p_test_id INT,
    p_status VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO TestRegistration (user_id, test_id, status)
    VALUES (p_user_id, p_test_id, p_status);
END;
$$;
select * from testregistration;
CALL register_user_for_test(1, 10, 'registered');

CREATE OR REPLACE PROCEDURE add_review(
    p_user_id INT,
    p_test_id INT,
    p_rating INT,
    p_comment TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO Review (user_id, test_id, rating, comment)
    VALUES (p_user_id, p_test_id, p_rating, p_comment);
END;
$$;
select * from review;
CALL add_review(1, 9, 5, 'Excellent test!');

select * from question;


CREATE OR REPLACE PROCEDURE get_test_details(p_test_id INT)
LANGUAGE plpgsql AS $$
DECLARE
    question_row RECORD;
    answer_row RECORD;
BEGIN
    RAISE NOTICE 'Test Title: %', (SELECT title FROM Test WHERE id = p_test_id);
    FOR question_row IN 
        SELECT id, text FROM Question WHERE test_id = p_test_id 
    LOOP
        RAISE NOTICE 'Question: %', question_row.text;
        FOR answer_row IN 
            SELECT text, is_correct FROM Answer WHERE question_id = question_row.id 
        LOOP
            IF answer_row.is_correct THEN
                RAISE NOTICE 'Answer: % (Correct)', answer_row.text;
            ELSE
                RAISE NOTICE 'Answer: %', answer_row.text;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

CALL get_test_details(1);


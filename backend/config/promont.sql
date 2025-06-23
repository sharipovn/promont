----------------------------------------------user creation in db---------------------
CREATE USER promont_user WITH PASSWORD 'promont_user';
CREATE SCHEMA promont AUTHORIZATION promont_user;
ALTER ROLE promont_user SET search_path TO promont;
GRANT ALL ON SCHEMA promont TO promont_user;
---------------------------------------------------------------------------

--DROP TABLE IF EXISTS staff_users CASCADE;
--DROP TABLE IF EXISTS staff_users_groups CASCADE;
--DROP TABLE IF EXISTS staff_users_user_permissions CASCADE;
--DELETE FROM django_migrations WHERE app = 'api';


--DROP TABLE IF EXISTS staff_users CASCADE;
--DROP TABLE IF EXISTS department CASCADE;
--DROP TABLE IF EXISTS capability CASCADE;
--DROP TABLE IF EXISTS staff_users_groups CASCADE;
--DROP TABLE IF EXISTS staff_users_user_permissions CASCADE;
--DELETE FROM django_migrations WHERE app = 'api';
--python manage.py makemigrations api


SELECT * FROM pro_fin_part;
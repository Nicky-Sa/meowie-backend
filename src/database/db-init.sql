-- Assuming user (meowie_app and meowie_migrator) have already been created using:
-- CREATE USER meowie_app WITH PASSWORD 'your_app_password';
-- CREATE USER meowie_migrator WITH PASSWORD 'your_migrator_password';

-- Create the schema with the admin user (not the app or migrator roles, usually the postgres user)
CREATE SCHEMA meowie;
-- Grant all permissions to the migrator user
GRANT
ALL
ON SCHEMA meowie TO meowie_migrator;
-- Grant only the necessary permissions to the app user
GRANT USAGE ON SCHEMA
meowie TO meowie_app;
GRANT
SELECT,
INSERT
,
UPDATE,
DELETE
ON ALL TABLES IN SCHEMA meowie TO meowie_app;
GRANT
USAGE,
SELECT
ON ALL SEQUENCES IN SCHEMA meowie TO meowie_app;


-- Tell the DB: "Whenever 'meowie_migrator' creates a table in 'meowie', give 'meowie_app' access to it."
-- To alter default privileges for another role, you must be a member of that role.
GRANT meowie_migrator TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE meowie_migrator IN SCHEMA meowie
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO meowie_app;

ALTER DEFAULT PRIVILEGES FOR ROLE meowie_migrator IN SCHEMA meowie
GRANT USAGE, SELECT ON SEQUENCES TO meowie_app;

-- Alter the role to set the search path (default schema)
-- Replace "postgres" with your custom database name if you created one
ALTER ROLE meowie_migrator IN DATABASE postgres SET search_path TO meowie;

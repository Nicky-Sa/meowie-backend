-- Assuming user (meowie_migrator and meowie_app) have already been created

-- Create the schema with the admin yser (not the app or migrator roles)
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


-- Run this as 'meowie_migrator' (terminal psql <URL>)
-- This tells the DB: "Whenever I create a table in 'meowie', give 'meowie_app' access to it."

ALTER
DEFAULT PRIVILEGES IN SCHEMA meowie
GRANT
SELECT,
INSERT
,
UPDATE,
DELETE
ON TABLES TO meowie_app;

ALTER
DEFAULT PRIVILEGES IN SCHEMA meowie
GRANT USAGE,
SELECT
ON SEQUENCES TO meowie_app;


-- Run this as 'meowie_migrator' (terminal psql <NON-POOLING-URL>)
-- Alter the role to set the search path (default schema)
ALTER
ROLE meowie_migrator IN DATABASE meowie_database SET search_path TO meowie;

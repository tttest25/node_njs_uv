# SQL documents

Concepts and sql code

## Fundamentals

### Sessions

SELECT * FROM webapi.webapi_session; -- application sessions
SELECT * FROM webapi.web_sessions; -- system express sessions

#IDEA - Save session in session variable
1. session variables
SET SESSION "videodb.table_name" = 'new_hire';
SELECT current_setting('videodb.table_name') AS "The Value";
example
-- SELECT column_name
-- FROM   table_name
-- WHERE  column_name = current_setting('videodb.table_name');
#IDEASTOP

### Logging
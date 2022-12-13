\echo 'Delete and recreate sejour db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE sejour;
CREATE DATABASE sejour;
\connect sejour

\i sejour-schema.sql
\i sejour-seed.sql

\echo 'Delete and recreate sejour_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE sejour_test;
CREATE DATABASE sejour_test;
\connect sejour_test

\i sejour-schema.sql

<?php
// api/config.php
// Update credentials if needed

// existing user DB (your main_sop)
define('USER_DB_HOST', 'localhost');
define('USER_DB_USER', 'admin');
define('USER_DB_PASS', 'admin123');
define('USER_DB_NAME', 'main-sop');
define('USER_DB_CHAR', 'utf8mb4');

// new raci DB
define('RACI_DB_HOST', 'localhost');
define('RACI_DB_USER', 'admin');   // same user as above if OK
define('RACI_DB_PASS', 'admin123');
define('RACI_DB_NAME', 'raci_db');
define('RACI_DB_CHAR', 'utf8mb4');

// common settings
error_reporting(E_ALL);
ini_set('display_errors', 1);

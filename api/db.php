<?php
// api/db.php
require_once __DIR__ . '/config.php';

// send JSON + CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function connectUserDb() {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = "mysql:host=" . USER_DB_HOST . ";dbname=" . USER_DB_NAME . ";charset=" . USER_DB_CHAR;
    $pdo = new PDO($dsn, USER_DB_USER, USER_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    return $pdo;
}

function connectRaciDb() {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = "mysql:host=" . RACI_DB_HOST . ";dbname=" . RACI_DB_NAME . ";charset=" . RACI_DB_CHAR;
    $pdo = new PDO($dsn, RACI_DB_USER, RACI_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    return $pdo;
}

// helper to send JSON
function jsonOK($data = []) {
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($msg = 'error', $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

<?php
// api/users.php
require_once __DIR__ . '/db.php';

$pdo = connectUserDb();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    if ($q !== '') {
        $sql = "SELECT user_id AS id, name, email, employee_id AS emp, phone, designation, profile_img, role FROM users
                WHERE name LIKE :q OR employee_id LIKE :q OR email LIKE :q ORDER BY name";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':q' => "%$q%"]);
    } else {
        $sql = "SELECT user_id AS id, name, email, employee_id AS emp, phone, designation, profile_img, role FROM users ORDER BY name";
        $stmt = $pdo->query($sql);
    }
    $users = $stmt->fetchAll();
    jsonOK($users);
}

jsonError('Unsupported method', 405);

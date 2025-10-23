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

// if ($method === 'POST') {
//     $body = json_decode(file_get_contents('php://input'), true);
//     if (!$body) jsonError('Invalid JSON', 400);

//     // expected fields: id (optional), name, emp (employee_id), email, phone, designation
//     $id = $body['id'] ?? null;
//     $name = trim($body['name'] ?? '');
//     $emp = trim($body['emp'] ?? '');
//     $email = trim($body['email'] ?? '');
//     $phone = trim($body['phone'] ?? '');
//     $designation = trim($body['designation'] ?? '');

//     if (!$name || !$emp) jsonError('name and emp required', 400);

//     if ($id) {
//         $sql = "UPDATE users SET name = :name, employee_id = :emp, email = :email, phone = :phone, designation = :designation WHERE user_id = :id";
//         $stmt = $pdo->prepare($sql);
//         $stmt->execute([
//             ':name' => $name, ':emp' => $emp, ':email' => $email, ':phone' => $phone, ':designation' => $designation, ':id' => $id
//         ]);
//         jsonOK(['id' => $id]);
//     } else {
//         // Insert - adapt to your DB schema (user_id could be auto-increment; here I assume it's auto-generated)
//         $sql = "INSERT INTO users (name, email, employee_id, phone, designation, log) VALUES (:name, :email, :emp, :phone, :designation, NOW())";
//         $stmt = $pdo->prepare($sql);
//         $stmt->execute([':name' => $name, ':email' => $email, ':emp' => $emp, ':phone' => $phone, ':designation' => $designation]);
//         $newId = $pdo->lastInsertId();
//         jsonOK(['id' => $newId]);
//     }
// }

// if ($method === 'DELETE') {
//     $id = $_GET['id'] ?? null;
//     if (!$id) jsonError('id required', 400);
//     $sql = "DELETE FROM users WHERE user_id = :id";
//     $stmt = $pdo->prepare($sql);
//     $stmt->execute([':id' => $id]);
//     jsonOK(['id' => $id]);
// }

jsonError('Unsupported method', 405);

<?php
// api/wings.php
require_once __DIR__ . '/db.php';

$pdo = connectUserDb();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// returns format: [{ id, name, subwings: [{ id, name }] }]
$sql = "SELECT dept_id, dept_name FROM departments ORDER BY dept_name";
$stmt = $pdo->query($sql);
$wings = $stmt->fetchAll();

$result = [];
foreach ($wings as $w) {
    $sidStmt = $pdo->prepare("SELECT subwing_id, subwing_name FROM sub_wing WHERE dept_id = :did ORDER BY subwing_name");
    $sidStmt->execute([':did' => $w['dept_id']]);
    $subs = $sidStmt->fetchAll();
    $result[] = [
        'id' => $w['dept_id'],
        'name' => $w['dept_name'],
        'subwings' => array_map(function($s){ return ['id' => $s['subwing_id'], 'name' => $s['subwing_name']]; }, $subs)
    ];
}
echo json_encode(['ok' => true, 'data' => $result], JSON_UNESCAPED_UNICODE);

<?php
// api/raci.php
require_once __DIR__ . '/db.php';

$raci = connectRaciDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $month = $_GET['month'] ?? null;
    if (!$month) jsonError('month param required', 400);

    // fetch tasks
    $stmt = $raci->prepare("SELECT * FROM raci_tasks WHERE month = :month ORDER BY deadline, created_at");
    $stmt->execute([':month' => $month]);
    $tasks = $stmt->fetchAll();

    // fetch roles for all tasks
    $taskIds = array_map(function($t){ return $t['id']; }, $tasks);
    $rolesMap = [];
    if (count($taskIds) > 0) {
        $in = implode(',', array_fill(0, count($taskIds), '?'));
        $stmt2 = $raci->prepare("SELECT task_id, role, user_id FROM raci_task_roles WHERE task_id IN ($in)");
        $stmt2->execute($taskIds);
        $rows = $stmt2->fetchAll();
        foreach ($rows as $r) {
            $rolesMap[$r['task_id']][$r['role']][] = $r['user_id'];
        }
    }

    $out = [];
    foreach ($tasks as $t) {
        $out[] = [
            'id' => $t['id'],
            'month' => $t['month'],
            'wing' => $t['wing'],
            'subwing' => $t['subwing'],
            'title' => $t['title'],
            'deadline' => $t['deadline'],
            'status' => $t['status'],
            'createdAt' => $t['created_at'],
            'responsible' => $rolesMap[$t['id']]['responsible'] ?? [],
            'accountable' => $rolesMap[$t['id']]['accountable'] ?? [],
            'consulted' => $rolesMap[$t['id']]['consulted'] ?? [],
            'informed' => $rolesMap[$t['id']]['informed'] ?? [],
        ];
    }

    jsonOK(['tasks' => $out]);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError('Invalid JSON', 400);
    // required: month, wing, subwing, title
    $id = $body['id'] ?? null;
    $month = $body['month'] ?? null;
    $wing = $body['wing'] ?? null;
    $subwing = $body['subwing'] ?? null;
    $title = $body['title'] ?? null;
    $deadline = $body['deadline'] ?? null;
    $status = $body['status'] ?? 'In Progress';
    $responsible = $body['responsible'] ?? [];
    $accountable = $body['accountable'] ?? [];
    $consulted = $body['consulted'] ?? [];
    $informed = $body['informed'] ?? [];

    if (!$month || !$wing || !$subwing || !$title) jsonError('month, wing, subwing, title required', 400);

    // create id if missing
    if (!$id) {
        // create reasonably unique id
        $id = bin2hex(random_bytes(6));
        $stmt = $raci->prepare("INSERT INTO raci_tasks (id, month, wing, subwing, title, deadline, status, created_at) VALUES (:id, :month, :wing, :subwing, :title, :deadline, :status, NOW())");
        $stmt->execute([
            ':id'=>$id, ':month'=>$month, ':wing'=>$wing, ':subwing'=>$subwing, ':title'=>$title, ':deadline'=>$deadline, ':status'=>$status
        ]);
    } else {
        // update meta
        $stmt = $raci->prepare("UPDATE raci_tasks SET month=:month, wing=:wing, subwing=:subwing, title=:title, deadline=:deadline, status=:status, updated_at=NOW() WHERE id=:id");
        $stmt->execute([
            ':month'=>$month, ':wing'=>$wing, ':subwing'=>$subwing, ':title'=>$title, ':deadline'=>$deadline, ':status'=>$status, ':id'=>$id
        ]);
        // remove previous role rows for this task; we'll insert fresh
        $stmtDel = $raci->prepare("DELETE FROM raci_task_roles WHERE task_id = :task_id");
        $stmtDel->execute([':task_id' => $id]);
    }

    // insert role rows
    $insertRole = $raci->prepare("INSERT INTO raci_task_roles (task_id, role, user_id) VALUES (:task_id, :role, :user_id)");
    $all = [
        'responsible' => $responsible,
        'accountable' => $accountable,
        'consulted' => $consulted,
        'informed' => $informed
    ];
    foreach ($all as $role => $users) {
        foreach ($users as $uid) {
            $insertRole->execute([':task_id'=>$id, ':role'=>$role, ':user_id'=>$uid]);
        }
    }

    jsonOK(['id' => $id]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) jsonError('id required', 400);
    $stmt = $raci->prepare("DELETE FROM raci_tasks WHERE id = :id");
    $stmt->execute([':id' => $id]);
    jsonOK(['id' => $id]);
}

jsonError('Unsupported method', 405);

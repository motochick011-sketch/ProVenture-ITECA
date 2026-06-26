<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? null;
$isDisabled = $input['isDisabled'] ?? null;

if ($userId === null || $isDisabled === null) {
    echo json_encode(['success' => false, 'message' => 'userId and isDisabled are required']);
    exit;
}

try {
    $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/users/disableUser.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$isDisabled, $userId]);

    echo json_encode(['success' => true, 'message' => $isDisabled ? 'User disabled' : 'User enabled']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

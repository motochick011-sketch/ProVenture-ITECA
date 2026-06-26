<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$orderId = $input['orderId'] ?? null;
$action = $input['action'] ?? null;

if (!$orderId || !$action) {
    echo json_encode(['success' => false, 'message' => 'orderId and action are required']);
    exit;
}

$validActions = ['pending', 'completed'];
if (!in_array($action, $validActions)) {
    echo json_encode(['success' => false, 'message' => 'Invalid action. Must be pending or completed']);
    exit;
}

try {
    $sql = "UPDATE almsafpa_eduvosprojd.orders SET status = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$action, $orderId]);

    echo json_encode(['success' => true, 'message' => 'Order status updated to ' . $action]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

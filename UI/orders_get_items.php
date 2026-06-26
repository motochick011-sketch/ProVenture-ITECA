<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$orderId = $_GET['orderId'] ?? null;

if (!$orderId) {
    echo json_encode(['success' => false, 'message' => 'orderId is required']);
    exit;
}

try {
    $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/orders/getOrderItems.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$orderId]);
    $items = $stmt->fetchAll();

    echo json_encode(['success' => true, 'items' => $items]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

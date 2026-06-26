<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$userId = $_GET['userId'] ?? null;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'userId is required']);
    exit;
}

try {
    // Get active order for this user
    $getActiveSql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/orders/getActiveOrder.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($getActiveSql);
    $stmt->execute([$userId]);
    $order = $stmt->fetch();

    if (!$order) {
        echo json_encode(['success' => true, 'items' => [], 'orderId' => null]);
        exit;
    }

    // Get items in this order
    $getItemsSql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/orders/getOrderItems.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($getItemsSql);
    $stmt->execute([$order['id']]);
    $items = $stmt->fetchAll();

    echo json_encode(['success' => true, 'items' => $items, 'orderId' => $order['id']]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

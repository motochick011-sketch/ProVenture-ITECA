<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? null;
$productId = $input['productId'] ?? null;

if (!$userId || !$productId) {
    echo json_encode(['success' => false, 'message' => 'userId and productId are required']);
    exit;
}

try {
    // Get or create active order for this user
    $getActiveSql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/orders/getActiveOrder.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($getActiveSql);
    $stmt->execute([$userId]);
    $order = $stmt->fetch();

    if (!$order) {
        // Create a new active order
        $createSql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/orders/createOrder.sql'), "\xEF\xBB\xBF");
        $stmt = $pdo->prepare($createSql);
        $stmt->execute([$userId]);
        $orderId = $pdo->lastInsertId();
    } else {
        $orderId = $order['id'];
    }

    // Add product to cart
    $addItemSql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/cart/addCartItem.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($addItemSql);
    $stmt->execute([$orderId, $productId]);

    echo json_encode(['success' => true, 'message' => 'Item added to cart', 'orderId' => $orderId]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

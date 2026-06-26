<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$cartItemId = $input['cartItemId'] ?? null;

if (!$cartItemId) {
    echo json_encode(['success' => false, 'message' => 'cartItemId is required']);
    exit;
}

try {
    $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/cart/removeCartItem.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$cartItemId]);

    echo json_encode(['success' => true, 'message' => 'Item removed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

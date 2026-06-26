<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$sellerId = $_GET['sellerId'] ?? null;

if (!$sellerId) {
    echo json_encode(['success' => false, 'message' => 'sellerId is required']);
    exit;
}

try {
    $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/product/getProductsBySeller.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$sellerId]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

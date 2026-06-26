<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$sellerId = $input['sellerId'] ?? null;
$categoryId = $input['categoryId'] ?? null;
$name = $input['name'] ?? '';
$description = $input['description'] ?? '';
$price = $input['price'] ?? 0;
$status = $input['status'] ?? 'available';
$image = $input['image'] ?? '';

if (!$id || !$sellerId || !$categoryId || empty($name)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/product/updateProduct.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$sellerId, $categoryId, $name, $description, $price, $status, $image, $id]);

    echo json_encode(['success' => true, 'message' => 'Product updated']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

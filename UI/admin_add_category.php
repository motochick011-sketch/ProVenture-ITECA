<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$name = $input['categoryName'] ?? '';
$description = $input['description'] ?? '';
$icon = $input['icon'] ?? '';

if (empty($name) || empty($description)) {
    echo json_encode(['success' => false, 'message' => 'Name and description are required']);
    exit;
}

try {
    $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/categories/addCategory.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $description, $icon]);

    echo json_encode(['success' => true, 'message' => 'Category added', 'categoryId' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

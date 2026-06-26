<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$includeDeleted = $_GET['includeDeleted'] ?? '0';

try {
    if ($includeDeleted === '1') {
        $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/categories/getCategories.sql'), "\xEF\xBB\xBF");
    } else {
        $sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/categories/getActiveCategories.sql'), "\xEF\xBB\xBF");
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $categories = $stmt->fetchAll();

    echo json_encode(['success' => true, 'categories' => $categories]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

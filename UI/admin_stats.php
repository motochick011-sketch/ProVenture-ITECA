<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

try {
    $userCount = $pdo->query("SELECT COUNT(*) as cnt FROM almsafpa_eduvosprojd.user")->fetch()['cnt'];
    $orderCount = $pdo->query("SELECT COUNT(*) as cnt FROM almsafpa_eduvosprojd.orders")->fetch()['cnt'];
    $productCount = $pdo->query("SELECT COUNT(*) as cnt FROM almsafpa_eduvosprojd.products WHERE isDeleted = 0")->fetch()['cnt'];
    $categoryCount = $pdo->query("SELECT COUNT(*) as cnt FROM almsafpa_eduvosprojd.category WHERE isDeleted = 0")->fetch()['cnt'];

    // Revenue: sum of all product prices in completed orders
    $revenueResult = $pdo->query("
        SELECT COALESCE(SUM(p.price), 0) as revenue
        FROM almsafpa_eduvosprojd.cart c
        JOIN almsafpa_eduvosprojd.orders o ON c.orderId = o.id
        JOIN almsafpa_eduvosprojd.products p ON c.productId = p.id
        WHERE o.status = 'completed'
    ")->fetch();
    $revenue = $revenueResult['revenue'];

    echo json_encode([
        'success' => true,
        'users' => $userCount,
        'orders' => $orderCount,
        'products' => $productCount,
        'categories' => $categoryCount,
        'revenue' => $revenue
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

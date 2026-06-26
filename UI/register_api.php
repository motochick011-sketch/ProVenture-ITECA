<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$name = $input['name'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    // Check if email already exists
    $check_sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/users/checkEmailExists.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($check_sql);
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }

    // Register user
    $register_sql = ltrim(file_get_contents(__DIR__ . '/../SQL/queries/users/addUser.sql'), "\xEF\xBB\xBF");
    $stmt = $pdo->prepare($register_sql);
    $stmt->execute([$name, $email, $password, 1]);

    $userId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'user' => [
            'userId' => $userId,
            'name' => $name,
            'email' => $email,
            'roleId' => 1
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

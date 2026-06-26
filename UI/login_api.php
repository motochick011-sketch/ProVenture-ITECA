<?php
ob_start();
header('Content-Type: application/json');

$pdo = require_once __DIR__ . '/../SQL/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    $sql_file = __DIR__ . '/../SQL/queries/users/loginUser.sql';
    $query = ltrim(file_get_contents($sql_file), "\xEF\xBB\xBF");

    $stmt = $pdo->prepare($query);
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch();

    if ($user) {
        if ($user['isDisabled'] == 1) {
            echo json_encode(['success' => false, 'message' => 'Account is disabled. Please contact an administrator.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'user' => [
                'userId' => $user['userId'],
                'name' => $user['name'],
                'email' => $user['email'],
                'roleId' => $user['roleId']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

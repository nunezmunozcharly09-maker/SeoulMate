<?php
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Método no permitido"]);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true) ?: [];
$usuario  = trim($input['usuario'] ?? 'admin');
$password = (string)($input['password'] ?? '');

// Bloqueo simple: 5 intentos fallidos => 60 s de espera
$ahora = time();
if (($_SESSION['bloqueado_hasta'] ?? 0) > $ahora) {
    http_response_code(429);
    echo json_encode(["success" => false, "error" => "Demasiados intentos. Espera un minuto."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, password_hash FROM admins WHERE usuario = ? LIMIT 1");
    $stmt->execute([$usuario]);
    $admin = $stmt->fetch();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Falta la tabla 'admins'. Importa schema.sql en phpMyAdmin."]);
    exit;
}

if ($admin && password_verify($password, $admin['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int)$admin['id'];
    $_SESSION['intentos'] = 0;
    echo json_encode(["success" => true]);
    exit;
}

usleep(500000);
$_SESSION['intentos'] = ($_SESSION['intentos'] ?? 0) + 1;
if ($_SESSION['intentos'] >= 5) {
    $_SESSION['bloqueado_hasta'] = $ahora + 60;
    $_SESSION['intentos'] = 0;
}
http_response_code(401);
echo json_encode(["success" => false, "error" => "Contraseña incorrecta"]);

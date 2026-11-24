<?php
// ===== AL SUBIR A INTERNET: cambia estos 4 datos por los que te da tu hosting (panel > Bases de datos MySQL) =====
// Conexión PDO a MySQL (XAMPP). Se incluye con require desde api.php, login.php y logica_admin.php
$host     = 'localhost';
$dbname   = 'seoulmate_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $msg = "No se pudo conectar a la base de datos 'seoulmate_db'. Enciende MySQL en XAMPP e importa schema.sql en phpMyAdmin.";
    http_response_code(500);
    $script = basename($_SERVER['SCRIPT_NAME'] ?? '');
    if (in_array($script, ['api.php', 'login.php'], true)) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["success" => false, "error" => $msg], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=UTF-8');
        echo "<h3 style='font-family:sans-serif;color:#c2185b;padding:20px'>$msg</h3>";
    }
    exit;
}

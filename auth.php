<?php
// Sesión segura del administrador. Se incluye desde login.php, logout.php, logica_admin.php y api.php
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Strict',
        'secure'   => !empty($_SERVER['HTTPS']),
    ]);
    session_name('SEOULMATE_ADMIN');
    session_start();
}

function es_admin(): bool {
    return !empty($_SESSION['admin_id']);
}

/** Para páginas: redirige al inicio si no hay sesión. */
function requerir_admin_pagina(): void {
    if (!es_admin()) {
        header('Location: index.html?login=1');
        exit;
    }
}

/** Para la API: responde 401 JSON si no hay sesión. */
function requerir_admin_api(): void {
    if (!es_admin()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["success" => false, "error" => "Sesión de administrador requerida"]);
        exit;
    }
}

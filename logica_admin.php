<?php
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/bandeja.php';
require_once __DIR__ . '/inventario.php';
requerir_admin_pagina();

// 1. Estadísticas del turno actual (pedidos no archivados)
$statsHoy   = $pdo->query("SELECT COUNT(*) AS total_pedidos, COALESCE(SUM(total), 0) AS total_ventas FROM pedidos WHERE archivado = 0")->fetch();
$pedidosHoy = (int)$statsHoy['total_pedidos'];
$ventasHoy  = (float)$statsHoy['total_ventas'];

// 2. Mensajes (últimos 100) y conteo de no leídos
$listaMensajes = cargar_bandeja($pdo, 100);
$totalMensajes = contar_no_leidos($pdo);

// 3. Pedidos del turno con sus platillos y notas
$listaPedidos = $pdo->query("
    SELECT p.id, p.mesa, p.total, p.estado, p.fecha,
           GROUP_CONCAT(CONCAT(dp.cantidad, 'x ', pr.nombre,
                               IF(dp.notas <> '', CONCAT(' (', dp.notas, ')'), '')) SEPARATOR ' · ') AS platillos
    FROM pedidos p
    LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
    LEFT JOIN productos pr ON dp.producto_id = pr.id
    WHERE p.archivado = 0
    GROUP BY p.id, p.mesa, p.total, p.estado, p.fecha
    ORDER BY p.id DESC
")->fetchAll();

// 4. Productos / inventario
$listaProductos = $pdo->query("SELECT * FROM productos ORDER BY id ASC")->fetchAll();

// 4b. Inventario por ingredientes: existencias, recetas y cuántas unidades se pueden preparar de cada producto
function fmt_cant($n): string {            // 40.000 -> "40", 0.5 -> "0.5"
    $s = rtrim(rtrim(number_format((float)$n, 3, '.', ''), '0'), '.');
    return $s === '' ? '0' : $s;
}
$ctxInv     = inv_cargar($pdo);
$invListo   = $ctxInv['ok'];                           // false = falta importar schema.sql
$listaIngredientes = array_values($ctxInv['ing']);
$ingAgotados = []; $ingBajos = [];
foreach ($listaIngredientes as &$ing) {
    $ing['estado'] = $ing['stock'] <= 0 ? 'agotado' : ($ing['stock'] <= $ing['minimo'] ? 'bajo' : 'ok');
    if ($ing['estado'] === 'agotado') $ingAgotados[] = $ing['nombre'];
    elseif ($ing['estado'] === 'bajo') $ingBajos[] = $ing['nombre'];
}
unset($ing);

$prodAgotados = []; $stockBajo = 0;
foreach ($listaProductos as &$prod) {
    $pid = (int)$prod['id'];
    $d = inv_disponibilidad_producto($ctxInv, $pid);
    $prod['gestion_ing'] = $d !== null;                                    // true = se controla por ingredientes
    $prod['disponible']  = $d !== null ? $d['disponible'] : (int)$prod['stock'];   // null = sin límite
    $prod['limitante']   = $d['limitante'] ?? null;
    $prod['receta']      = [];
    foreach ($ctxInv['rec'][$pid] ?? [] as $iid => $q) $prod['receta'][] = ['ingrediente_id' => $iid, 'cantidad' => $q];
    if ($prod['activo'] && $prod['disponible'] !== null) {
        if ($prod['disponible'] <= 0) $prodAgotados[] = $prod['nombre'];
        if ($prod['disponible'] <= 5) $stockBajo++;
    }
}
unset($prod);

// 5. Opciones de personalización (rellenos, ingredientes a eliminar, extras...)
$listaOpciones = $pdo->query("SELECT o.*, p.nombre AS producto FROM opciones_producto o
    JOIN productos p ON p.id = o.producto_id
    ORDER BY o.producto_id, FIELD(o.tipo,'relleno','proteina','sabor','quitar','extra'), o.orden, o.id")->fetchAll();

$ingOpc = [];
foreach ($ctxInv['opc'] as $lista) foreach ($lista as $o) $ingOpc[$o['id']] = $o['ings'];
foreach ($listaOpciones as &$op) {
    $op['ingredientes'] = [];
    foreach ($ingOpc[(int)$op['id']] ?? [] as $iid => $q) $op['ingredientes'][] = ['ingrediente_id' => $iid, 'cantidad' => $q];
}
unset($op);

// 6. Calificaciones de clientes
$statsCal = $pdo->query("SELECT COUNT(*) AS n, COALESCE(AVG(estrellas), 0) AS prom FROM calificaciones")->fetch();
$totalCalificaciones = (int)$statsCal['n'];
$promedioCalificacion = (float)$statsCal['prom'];
$listaCalificaciones = $pdo->query("SELECT c.*, p.mesa FROM calificaciones c LEFT JOIN pedidos p ON p.id = c.pedido_id ORDER BY c.id DESC LIMIT 30")->fetchAll();

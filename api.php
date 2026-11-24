<?php
// API única: cliente (Menu.html) y administrador (Administrador.php)
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/inventario.php';

set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error del servidor: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
});

$input  = json_decode(file_get_contents('php://input'), true) ?: [];
$accion = $_GET['accion'] ?? ($input['accion'] ?? '');

function responder(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$ACCIONES_PUBLICAS = ['guardar_pedido', 'guardar_mensaje', 'listar_productos', 'listar_opciones', 'guardar_calificacion'];
if (!in_array($accion, $ACCIONES_PUBLICAS, true)) {
    requerir_admin_api();               // todo lo demás exige sesión de administrador
}

if ($accion === 'listar_productos') {   // única acción que admite GET
    $rows = $pdo->query("SELECT id, nombre, precio, stock, categoria, descripcion, activo FROM productos")->fetchAll();
    $ctx  = inv_cargar($pdo);
    foreach ($rows as &$r) {
        // "disponible" = cuántas unidades se pueden preparar con los ingredientes que quedan (null = sin límite)
        $d = inv_disponibilidad_producto($ctx, (int)$r['id']);
        $r['gestion_ing'] = $d !== null;
        $r['disponible']  = $d !== null ? $d['disponible'] : (int)$r['stock'];
    }
    unset($r);
    responder(["success" => true, "productos" => $rows]);
}
if ($accion === 'listar_opciones') {    // opciones activas para la ventana "Personalizar"
    $rows = $pdo->query("SELECT id, producto_id, tipo, nombre, precio FROM opciones_producto WHERE activo = 1
                         ORDER BY producto_id, FIELD(tipo,'relleno','proteina','sabor','quitar','extra'), orden, id")->fetchAll();
    $ctx = inv_cargar($pdo); $agot = [];
    foreach ($ctx['opc'] as $lista) foreach ($lista as $o) $agot[$o['id']] = inv_opcion_agotada($ctx, $o);
    foreach ($rows as &$r) $r['agotada'] = !empty($agot[(int)$r['id']]);   // le falta algún ingrediente
    unset($r);
    responder(["success" => true, "opciones" => $rows]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(["success" => false, "error" => "Método no permitido"], 405);
}

switch ($accion) {

    // ---------- CLIENTE ----------
    case 'guardar_pedido':
        $mesa      = mb_substr(trim($input['mesa'] ?? 'Mesa 01'), 0, 30);
        $productos = $input['productos'] ?? [];
        if (!is_array($productos) || empty($productos) || count($productos) > 60) {
            responder(["success" => false, "error" => "El carrito está vacío o es inválido"], 400);
        }
        try {
            $pdo->beginTransaction();
            $pdo->prepare("INSERT INTO pedidos (mesa, total, estado) VALUES (?, 0, 'Pendiente')")->execute([$mesa]);
            $pedido_id = (int)$pdo->lastInsertId();

            $selProd  = $pdo->prepare("SELECT nombre, precio, activo FROM productos WHERE id = ?");
            $updStock = $pdo->prepare("UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ? AND activo = 1");
            $selExtras = $pdo->prepare("SELECT nombre, precio FROM opciones_producto WHERE producto_id = ? AND tipo = 'extra' AND activo = 1");
            $insDet   = $pdo->prepare("INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, notas, precio_unitario) VALUES (?, ?, ?, ?, ?)");
            $updIng   = $pdo->prepare("UPDATE ingredientes SET stock = stock - ? WHERE id = ? AND stock >= ?");
            $ctx      = inv_cargar($pdo);
            $total = 0;

            foreach ($productos as $item) {
                $prod_id  = (int)($item['id'] ?? 0);
                $cantidad = (int)($item['cantidad'] ?? 0);
                if ($prod_id <= 0 || $cantidad <= 0 || $cantidad > 50) {
                    throw new Exception("Producto o cantidad inválidos");
                }
                $selProd->execute([$prod_id]);
                $prod = $selProd->fetch();
                if (!$prod || !$prod['activo']) {
                    throw new Exception("El producto #$prod_id no está disponible");
                }
                // Producto con ingredientes: se descuentan abajo, ingrediente por ingrediente. Sin ingredientes: stock manual del producto.
                $usaIng = inv_producto_usa_ingredientes($ctx, $prod_id);
                if (!$usaIng) {
                    $updStock->execute([$cantidad, $prod_id, $cantidad]);
                    if ($updStock->rowCount() === 0) {
                        throw new Exception("Stock insuficiente de " . $prod['nombre']);
                    }
                }
                // Precio = base (BD) + extras elegidos (BD). Nada de lo que mande el navegador cambia el precio.
                $precio = (float)$prod['precio'];
                $notas  = '';
                if (!empty($item['detalles']) && is_array($item['detalles'])) {
                    $detalles = array_map('strval', $item['detalles']);
                    $selExtras->execute([$prod_id]);
                    $extrasBD = $selExtras->fetchAll(PDO::FETCH_KEY_PAIR);   // nombre => precio
                    foreach (array_unique($detalles) as $d) {
                        if (strpos($d, '+ ') === 0) {
                            $nombreExtra = substr($d, 2);
                            if (!isset($extrasBD[$nombreExtra])) {
                                throw new Exception("El extra \"$nombreExtra\" ya no está disponible");
                            }
                            $precio += (float)$extrasBD[$nombreExtra];
                        }
                    }
                    $notas = mb_substr(implode(', ', $detalles), 0, 255);
                }
                if ($usaIng) {
                    $detStr = (!empty($item['detalles']) && is_array($item['detalles'])) ? array_map('strval', $item['detalles']) : [];
                    foreach (inv_consumo_item($ctx, $prod_id, $detStr) as $iid => $q) {
                        $gasto = number_format(round($q * $cantidad, 3), 3, '.', '');
                        if ((float)$gasto <= 0) continue;
                        $updIng->execute([$gasto, $iid, $gasto]);      // atómico: solo descuenta si alcanza
                        if ($updIng->rowCount() === 0) {
                            throw new Exception("Stock insuficiente de " . $prod['nombre']);
                        }
                    }
                }
                $total += $precio * $cantidad;
                $insDet->execute([$pedido_id, $prod_id, $cantidad, $notas, $precio]);
            }
            $pdo->prepare("UPDATE pedidos SET total = ? WHERE id = ?")->execute([$total, $pedido_id]);
            $pdo->commit();
            responder(["success" => true, "message" => "Pedido guardado", "pedido_id" => $pedido_id]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            responder(["success" => false, "error" => $e->getMessage()], 400);
        }
        break;

    case 'guardar_mensaje':
        $nombre  = trim($input['nombre'] ?? '') ?: 'Anónimo';
        $mensaje = trim($input['mensaje'] ?? '');
        if ($mensaje === '') responder(["success" => false, "error" => "El mensaje está vacío"], 400);
        $pdo->prepare("INSERT INTO mensajes (nombre, mensaje, fecha, leido) VALUES (?, ?, NOW(), 0)")
            ->execute([mb_substr($nombre, 0, 100), mb_substr($mensaje, 0, 1000)]);
        responder(["success" => true, "message" => "Mensaje guardado"]);
        break;

    case 'guardar_calificacion':
        $estrellas  = (int)($input['estrellas'] ?? 0);
        $pedido_id  = (int)($input['pedido_id'] ?? 0);
        $comentario = mb_substr(trim($input['comentario'] ?? ''), 0, 255);
        if ($estrellas < 1 || $estrellas > 5) {
            responder(["success" => false, "error" => "Elige de 1 a 5 estrellas"], 400);
        }
        if ($pedido_id > 0) {
            $chk = $pdo->prepare("SELECT COUNT(*) FROM pedidos WHERE id = ?");
            $chk->execute([$pedido_id]);
            if (!$chk->fetchColumn()) $pedido_id = 0;
        }
        try {
            $pdo->prepare("INSERT INTO calificaciones (pedido_id, estrellas, comentario, fecha) VALUES (?, ?, ?, NOW())")
                ->execute([$pedido_id > 0 ? $pedido_id : null, $estrellas, $comentario]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') responder(["success" => false, "error" => "Este pedido ya fue calificado"], 400);
            throw $e;
        }
        responder(["success" => true]);
        break;

    // ---------- ADMINISTRADOR ----------
    case 'actualizar_estado':
        $id     = (int)($input['id'] ?? 0);
        $estado = $input['estado'] ?? '';
        if ($id <= 0 || !in_array($estado, ['Pendiente', 'Preparando', 'Completado'], true)) {
            responder(["success" => false, "error" => "Datos inválidos"], 400);
        }
        $pdo->prepare("UPDATE pedidos SET estado = ? WHERE id = ?")->execute([$estado, $id]);
        responder(["success" => true]);
        break;

    case 'guardar_producto':
    case 'editar_producto':
        $id          = (int)($input['id'] ?? 0);
        $nombre      = trim($input['nombre'] ?? '');
        $precio      = (float)($input['precio'] ?? 0);
        $stock       = (int)($input['stock'] ?? 0);
        $categoria   = mb_substr(trim($input['categoria'] ?? 'General'), 0, 60);
        $descripcion = mb_substr(trim($input['descripcion'] ?? ''), 0, 255);
        if ($nombre === '' || $precio <= 0 || $stock < 0) {
            responder(["success" => false, "error" => "Nombre, precio (> 0) y stock (≥ 0) son obligatorios"], 400);
        }
        if ($accion === 'editar_producto') {
            if ($id <= 0) responder(["success" => false, "error" => "ID inválido"], 400);
            $pdo->prepare("UPDATE productos SET nombre=?, precio=?, stock=?, categoria=?, descripcion=? WHERE id=?")
                ->execute([$nombre, $precio, $stock, $categoria, $descripcion, $id]);
        } else {
            $pdo->prepare("INSERT INTO productos (nombre, precio, stock, categoria, descripcion) VALUES (?, ?, ?, ?, ?)")
                ->execute([$nombre, $precio, $stock, $categoria, $descripcion]);
        }
        responder(["success" => true]);
        break;

    case 'cambiar_activo_producto':
        $id = (int)($input['id'] ?? 0);
        $activo = !empty($input['activo']) ? 1 : 0;
        if ($id <= 0) responder(["success" => false, "error" => "ID inválido"], 400);
        $pdo->prepare("UPDATE productos SET activo = ? WHERE id = ?")->execute([$activo, $id]);
        responder(["success" => true]);
        break;

    case 'guardar_opcion':
        $id     = (int)($input['id'] ?? 0);
        $pid    = (int)($input['producto_id'] ?? 0);
        $tipo   = $input['tipo'] ?? '';
        $nombre = mb_substr(trim($input['nombre'] ?? ''), 0, 120);
        $precio = $tipo === 'extra' ? (float)($input['precio'] ?? 0) : 0;
        if ($pid <= 0 || $nombre === '' || $precio < 0 || !in_array($tipo, ['relleno','proteina','sabor','quitar','extra'], true)) {
            responder(["success" => false, "error" => "Producto, tipo y nombre son obligatorios (precio ≥ 0)"], 400);
        }
        $opcId = $id;
        try {
            if ($id > 0) {
                $pdo->prepare("UPDATE opciones_producto SET producto_id=?, tipo=?, nombre=?, precio=? WHERE id=?")
                    ->execute([$pid, $tipo, $nombre, $precio, $id]);
            } else {
                $st = $pdo->prepare("SELECT COALESCE(MAX(orden), 0) + 1 FROM opciones_producto WHERE producto_id = ? AND tipo = ?");
                $st->execute([$pid, $tipo]);
                $orden = (int)$st->fetchColumn();
                $pdo->prepare("INSERT INTO opciones_producto (producto_id, tipo, nombre, precio, orden) VALUES (?, ?, ?, ?, ?)")
                    ->execute([$pid, $tipo, $nombre, $precio, $orden]);
                $opcId = (int)$pdo->lastInsertId();
            }
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') responder(["success" => false, "error" => "Esa opción ya existe para ese producto"], 400);
            throw $e;
        }
        if ($opcId > 0 && isset($input['ingredientes']) && is_array($input['ingredientes'])) {
            inv_guardar_items($pdo, 'opcion_ingredientes', 'opcion_id', $opcId, inv_normalizar_items($input['ingredientes']));
        }
        responder(["success" => true]);
        break;

    case 'cambiar_activo_opcion':
        $pdo->prepare("UPDATE opciones_producto SET activo = ? WHERE id = ?")
            ->execute([!empty($input['activo']) ? 1 : 0, (int)($input['id'] ?? 0)]);
        responder(["success" => true]);
        break;

    case 'eliminar_opcion':
        $opcId = (int)($input['id'] ?? 0);
        $pdo->prepare("DELETE FROM opciones_producto WHERE id = ?")->execute([$opcId]);
        $pdo->prepare("DELETE FROM opcion_ingredientes WHERE opcion_id = ?")->execute([$opcId]);
        responder(["success" => true]);
        break;

    // ---------- INVENTARIO (ingredientes y recetas) ----------
    case 'guardar_ingrediente':
        $id     = (int)($input['id'] ?? 0);
        $nombre = mb_substr(trim($input['nombre'] ?? ''), 0, 100);
        $unidad = mb_substr(trim($input['unidad'] ?? ''), 0, 20) ?: 'pza';
        $stock  = round((float)($input['stock'] ?? 0), 3);
        $minimo = round((float)($input['stock_minimo'] ?? 0), 3);
        if ($nombre === '' || $stock < 0 || $minimo < 0) {
            responder(["success" => false, "error" => "Nombre y cantidades (≥ 0) son obligatorios"], 400);
        }
        try {
            if ($id > 0) {
                $pdo->prepare("UPDATE ingredientes SET nombre=?, unidad=?, stock=?, stock_minimo=? WHERE id=?")
                    ->execute([$nombre, $unidad, $stock, $minimo, $id]);
            } else {
                $pdo->prepare("INSERT INTO ingredientes (nombre, unidad, stock, stock_minimo) VALUES (?, ?, ?, ?)")
                    ->execute([$nombre, $unidad, $stock, $minimo]);
            }
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') responder(["success" => false, "error" => "Ese ingrediente ya existe"], 400);
            throw $e;
        }
        responder(["success" => true]);
        break;

    case 'ajustar_stock_ingrediente':      // reabastecer (+) o corregir (−) sin tocar lo demás
        $id    = (int)($input['id'] ?? 0);
        $delta = round((float)($input['cantidad'] ?? 0), 3);
        if ($id <= 0 || $delta == 0) responder(["success" => false, "error" => "Datos inválidos"], 400);
        $pdo->prepare("UPDATE ingredientes SET stock = GREATEST(stock + ?, 0) WHERE id = ?")->execute([$delta, $id]);
        responder(["success" => true]);
        break;

    case 'eliminar_ingrediente':
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) responder(["success" => false, "error" => "ID inválido"], 400);
        $pdo->beginTransaction();
        $pdo->prepare("DELETE FROM recetas WHERE ingrediente_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM opcion_ingredientes WHERE ingrediente_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM ingredientes WHERE id = ?")->execute([$id]);
        $pdo->commit();
        responder(["success" => true]);
        break;

    case 'guardar_receta':                 // reemplaza TODOS los ingredientes del producto
        $pid = (int)($input['producto_id'] ?? 0);
        $chk = $pdo->prepare("SELECT COUNT(*) FROM productos WHERE id = ?");
        $chk->execute([$pid]);
        if ($pid <= 0 || !$chk->fetchColumn()) responder(["success" => false, "error" => "ID inválido"], 400);
        inv_guardar_items($pdo, 'recetas', 'producto_id', $pid, inv_normalizar_items($input['items'] ?? []));
        responder(["success" => true]);
        break;

    case 'marcar_mensaje_leido':
        $pdo->prepare("UPDATE mensajes SET leido = 1 WHERE id = ?")->execute([(int)($input['id'] ?? 0)]);
        responder(["success" => true]);
        break;

    case 'marcar_calificacion_leida':
        $pdo->prepare("UPDATE calificaciones SET leido = 1 WHERE id = ?")->execute([(int)($input['id'] ?? 0)]);
        responder(["success" => true]);
        break;

    case 'eliminar_mensaje':
        $pdo->prepare("DELETE FROM mensajes WHERE id = ?")->execute([(int)($input['id'] ?? 0)]);
        responder(["success" => true]);
        break;

    // Cierra el turno: los pedidos se ARCHIVAN (no se borran) y los mensajes se marcan leídos
    case 'reiniciar_turno':
        $pdo->beginTransaction();
        $pdo->exec("UPDATE pedidos SET archivado = 1 WHERE archivado = 0");
        $pdo->exec("UPDATE mensajes SET leido = 1");
        $pdo->exec("UPDATE calificaciones SET leido = 1");
        $pdo->commit();
        responder(["success" => true]);
        break;

    default:
        responder(["success" => false, "error" => "Acción no válida"], 400);
}

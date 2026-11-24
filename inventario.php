<?php
// Inventario por ingredientes: disponibilidad de cada producto y consumo por pedido.
// Se incluye desde api.php y logica_admin.php (necesita $pdo de conexion.php).

const INV_GRUPOS = ['relleno', 'proteina', 'sabor'];   // opciones de "elige una": si no se elige, se asume la primera

/** Carga ingredientes, recetas y opciones. Si las tablas aún no existen (falta importar schema.sql) devuelve todo vacío. */
function inv_cargar(PDO $pdo): array {
    $ctx = ['ing' => [], 'rec' => [], 'opc' => [], 'ok' => true];
    try {
        foreach ($pdo->query("SELECT id, nombre, unidad, stock, stock_minimo FROM ingredientes ORDER BY nombre")->fetchAll() as $r) {
            $ctx['ing'][(int)$r['id']] = ['id' => (int)$r['id'], 'nombre' => $r['nombre'], 'unidad' => $r['unidad'],
                                          'stock' => (float)$r['stock'], 'minimo' => (float)$r['stock_minimo']];
        }
        foreach ($pdo->query("SELECT producto_id, ingrediente_id, cantidad FROM recetas")->fetchAll() as $r) {
            $ctx['rec'][(int)$r['producto_id']][(int)$r['ingrediente_id']] = (float)$r['cantidad'];
        }
        $mapa = [];
        foreach ($pdo->query("SELECT opcion_id, ingrediente_id, cantidad FROM opcion_ingredientes")->fetchAll() as $r) {
            $mapa[(int)$r['opcion_id']][(int)$r['ingrediente_id']] = (float)$r['cantidad'];
        }
        foreach ($pdo->query("SELECT id, producto_id, tipo, nombre, activo FROM opciones_producto ORDER BY producto_id, orden, id")->fetchAll() as $r) {
            $ctx['opc'][(int)$r['producto_id']][] = ['id' => (int)$r['id'], 'tipo' => $r['tipo'], 'nombre' => $r['nombre'],
                                                     'activo' => (int)$r['activo'], 'ings' => $mapa[(int)$r['id']] ?? []];
        }
    } catch (PDOException $e) {
        return ['ing' => [], 'rec' => [], 'opc' => [], 'ok' => false];
    }
    return $ctx;
}

/** Cuántas unidades se pueden preparar con $need (ingrediente_id => cantidad) y qué ingrediente limita. */
function inv_capacidad(array $need, array $ing): array {
    $cap = null; $lim = null;
    foreach ($need as $iid => $q) {
        if ($q <= 0) continue;
        $stock = isset($ing[$iid]) ? $ing[$iid]['stock'] : 0.0;
        $c = (int)floor(($stock + 1e-9) / $q);
        if ($cap === null || $c < $cap) { $cap = $c; $lim = $iid; }
    }
    return [$cap, $lim];
}

/** ¿El producto se controla por ingredientes? (tiene receta, o rellenos/proteínas/sabores ligados a ingredientes) */
function inv_producto_usa_ingredientes(array $ctx, int $pid): bool {
    if (!empty($ctx['rec'][$pid])) return true;
    foreach ($ctx['opc'][$pid] ?? [] as $o) {
        if (in_array($o['tipo'], INV_GRUPOS, true) && $o['activo'] && $o['ings']) return true;
    }
    return false;
}

/** null si el producto no usa ingredientes; si no: ['disponible' => int|null (null = sin límite), 'limitante' => nombre|null] */
function inv_disponibilidad_producto(array $ctx, int $pid): ?array {
    if (!inv_producto_usa_ingredientes($ctx, $pid)) return null;
    $cap = null; $lim = null;
    [$c, $l] = inv_capacidad($ctx['rec'][$pid] ?? [], $ctx['ing']);
    if ($c !== null) { $cap = $c; $lim = $l; }
    foreach (INV_GRUPOS as $g) {
        $mejor = null; $mejorLim = null; $hayOpciones = false; $ilimitada = false;
        foreach ($ctx['opc'][$pid] ?? [] as $o) {
            if ($o['tipo'] !== $g || !$o['activo']) continue;
            $hayOpciones = true;
            [$oc, $ol] = inv_capacidad($o['ings'], $ctx['ing']);
            if ($oc === null) { $ilimitada = true; break; }          // una opción sin ingredientes ligados: sin límite
            if ($mejor === null || $oc > $mejor) { $mejor = $oc; $mejorLim = $ol; }
        }
        if (!$hayOpciones || $ilimitada || $mejor === null) continue;
        if ($cap === null || $mejor < $cap) { $cap = $mejor; $lim = $mejorLim; }
    }
    return ['disponible' => $cap, 'limitante' => $lim !== null && isset($ctx['ing'][$lim]) ? $ctx['ing'][$lim]['nombre'] : null];
}

/** Una opción (relleno, sabor, extra...) está agotada si le falta algún ingrediente para 1 unidad. "Sin ..." nunca se agota. */
function inv_opcion_agotada(array $ctx, array $o): bool {
    if ($o['tipo'] === 'quitar' || !$o['ings']) return false;
    [$c] = inv_capacidad($o['ings'], $ctx['ing']);
    return $c !== null && $c < 1;
}

/** Ingredientes que gasta UNA unidad del producto con las opciones elegidas: ingrediente_id => cantidad. */
function inv_consumo_item(array $ctx, int $pid, array $detalles): array {
    $need = $ctx['rec'][$pid] ?? [];
    $opts = $ctx['opc'][$pid] ?? [];
    $elegidas = [];
    foreach ($detalles as $d) {
        $esExtra = strpos($d, '+ ') === 0;
        $nombre  = $esExtra ? substr($d, 2) : $d;
        foreach ($opts as $o) {
            if ($o['nombre'] === $nombre && (($o['tipo'] === 'extra') === $esExtra)) { $elegidas[$o['id']] = $o; break; }
        }
    }
    // "Pedir" directo no elige relleno/proteína/sabor: se asume el primero de la lista (el mismo que sale marcado en "Personalizar")
    foreach (INV_GRUPOS as $g) {
        $hay = false; $primera = null;
        foreach ($opts as $o) {
            if ($o['tipo'] !== $g || !$o['activo']) continue;
            if ($primera === null) $primera = $o;
            if (isset($elegidas[$o['id']])) $hay = true;
        }
        if (!$hay && $primera !== null) $elegidas[$primera['id']] = $primera;
    }
    foreach ($elegidas as $o) {                      // "Sin ...": ese ingrediente ya no se descuenta
        if ($o['tipo'] === 'quitar') { foreach ($o['ings'] as $iid => $q) unset($need[$iid]); }
    }
    foreach ($elegidas as $o) {                      // rellenos, sabores y extras: suman su ingrediente
        if ($o['tipo'] === 'quitar') continue;
        foreach ($o['ings'] as $iid => $q) $need[$iid] = ($need[$iid] ?? 0) + $q;
    }
    return $need;
}

/** [{ingrediente_id, cantidad}, ...] del navegador -> [ingrediente_id => cantidad] (descarta cantidades <= 0). */
function inv_normalizar_items($items): array {
    $out = [];
    if (!is_array($items)) return $out;
    foreach ($items as $it) {
        $iid = (int)($it['ingrediente_id'] ?? 0);
        $q   = round((float)($it['cantidad'] ?? 0), 3);
        if ($iid > 0 && $q > 0) $out[$iid] = $q;
    }
    return $out;
}

/** Reemplaza las filas de recetas u opcion_ingredientes de un producto/opción. $tabla y $col vienen siempre del código. */
function inv_guardar_items(PDO $pdo, string $tabla, string $col, int $id, array $items): void {
    $validos = array_map('intval', $pdo->query("SELECT id FROM ingredientes")->fetchAll(PDO::FETCH_COLUMN));
    $propia = !$pdo->inTransaction();
    if ($propia) $pdo->beginTransaction();
    $pdo->prepare("DELETE FROM $tabla WHERE $col = ?")->execute([$id]);
    $ins = $pdo->prepare("INSERT INTO $tabla ($col, ingrediente_id, cantidad) VALUES (?, ?, ?)");
    foreach ($items as $iid => $q) {
        if (in_array((int)$iid, $validos, true)) $ins->execute([$id, (int)$iid, $q]);
    }
    if ($propia) $pdo->commit();
}

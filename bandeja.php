<?php
/**
 * Bandeja unificada de "Mensajes y Contacto":
 * mensajes de clientes + comentarios que dejaron al calificar (solo los que escribieron comentario).
 * Devuelve filas con: origen ('mensaje'|'calificacion'), id, nombre, fecha, mensaje, estrellas, leido.
 */
function cargar_bandeja(PDO $pdo, int $limite = 100): array {
    $filas = [];
    foreach ($pdo->query("SELECT id, nombre, mensaje, fecha, leido FROM mensajes ORDER BY id DESC LIMIT $limite")->fetchAll() as $m) {
        $filas[] = ['origen' => 'mensaje', 'id' => (int)$m['id'], 'nombre' => $m['nombre'], 'mensaje' => $m['mensaje'],
                    'fecha' => $m['fecha'], 'leido' => (int)$m['leido'], 'estrellas' => 0, 'mesa' => null];
    }
    $sql = "SELECT c.id, c.estrellas, c.comentario, c.fecha, c.leido, p.mesa
            FROM calificaciones c LEFT JOIN pedidos p ON p.id = c.pedido_id
            WHERE c.comentario <> '' ORDER BY c.id DESC LIMIT $limite";
    foreach ($pdo->query($sql)->fetchAll() as $c) {
        $filas[] = ['origen' => 'calificacion', 'id' => (int)$c['id'], 'nombre' => $c['mesa'] ? 'Cliente · ' . $c['mesa'] : 'Cliente',
                    'mensaje' => $c['comentario'], 'fecha' => $c['fecha'], 'leido' => (int)$c['leido'],
                    'estrellas' => (int)$c['estrellas'], 'mesa' => $c['mesa']];
    }
    usort($filas, fn($a, $b) => strcmp((string)$b['fecha'], (string)$a['fecha']) ?: ($b['id'] <=> $a['id']));
    return array_slice($filas, 0, $limite);
}

function contar_no_leidos(PDO $pdo): int {
    $m = (int)$pdo->query("SELECT COUNT(*) FROM mensajes WHERE leido = 0")->fetchColumn();
    $c = (int)$pdo->query("SELECT COUNT(*) FROM calificaciones WHERE leido = 0 AND comentario <> ''")->fetchColumn();
    return $m + $c;
}

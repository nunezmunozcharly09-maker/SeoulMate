<?php 
// Incluimos la lógica conectada directamente a tu MySQL en XAMPP
require_once __DIR__ . '/logica_admin.php'; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="aTitle">SeoulMate - Panel de Administración</title>
    <!-- Enlace a la hoja de estilos externa -->
    <link rel="stylesheet" href="CSS/Administrador.css">
    <!-- FontAwesome para iconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar de Navegación -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="fa-solid fa-utensils"></i>
                <h2>SeoulMate <span>Admin</span></h2>
            </div>
            <ul class="sidebar-menu">
                <li><a href="#dashboard" class="active" data-tab="dashboard"><i class="fa-solid fa-chart-pie"></i> <span data-i18n="aDashboard">Dashboard</span></a></li>
                <li><a href="#orders" data-tab="orders"><i class="fa-solid fa-receipt"></i> <span data-i18n="aOrders">Pedidos</span></a></li>
                <li><a href="#messages" data-tab="messages"><i class="fa-solid fa-envelope"></i> <span data-i18n="aMessages">Mensajes y Contacto</span></a></li>
                <li><a href="#menu" data-tab="menu"><i class="fa-solid fa-burger"></i> <span data-i18n="aMenu">Gestión de Menú</span></a></li>
                <li><a href="#inventory" data-tab="inventory"><i class="fa-solid fa-boxes-stacked"></i> <span data-i18n="aInventory">Inventario</span></a></li>
                <li><a href="#options" data-tab="options"><i class="fa-solid fa-sliders"></i> <span data-i18n="aOptions">Ingredientes y Extras</span></a></li>
                <li><a href="logout.php"><i class="fa-solid fa-right-from-bracket"></i> <span data-i18n="aLogout">Cerrar sesión</span></a></li>
            </ul>
        </aside>

        <!-- Contenido Principal -->
        <main class="main-content">
            <!-- Barra superior -->
            <header class="top-bar">
                <div class="user-greeting">
                    <h1 data-i18n="aPanel">Panel de Control</h1>
                    <p><span data-i18n="aDate">Fecha del día:</span> <strong id="admin-current-date"><?php echo date('d/m/Y'); ?></strong></p>
                </div>
                <div class="top-actions">
                    <!-- Selector de idioma (usa el mismo idioma elegido en la portada) -->
                    <div class="lang-selector-wrapper">
                        <span class="lang-icon">🌐</span>
                        <select id="lang-selector" class="sm-lang" onchange="SM.setLang(this.value)" aria-label="Idioma / Language / 언어">
                            <option value="es">ES - Español</option>
                            <option value="en">EN - English</option>
                            <option value="ko">KR - 한국어</option>
                        </select>
                    </div>
                    <button id="theme-toggle" class="btn-icon" title="Cambiar modo claro / oscuro" data-i18n-title="aThemeTitle"><i class="fa-solid fa-moon"></i></button>
                    <div class="admin-profile">
                        <i class="fa-solid fa-user-shield"></i>
                        <span>Admin SeoulMate</span>
                    </div>
                </div>
            </header>

            <!-- AVISOS DE STOCK (se ven en todas las pestañas) -->
            <?php if (!$invListo): ?>
                <div class="stock-alert warn"><i class="fa-solid fa-database"></i>
                    <div><p data-i18n="aNeedSchema">Falta importar schema.sql para activar el inventario por ingredientes (abre diagnostico.php y pulsa "Importar schema.sql ahora").</p></div>
                </div>
            <?php endif; ?>
            <?php if ($prodAgotados || $ingAgotados): ?>
                <div class="stock-alert danger" id="stock-alert-out">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <div>
                        <?php if ($prodAgotados): ?>
                            <p><strong data-i18n="aAlertOutProd">⚠️ Productos AGOTADOS (los clientes ven "AGOTADO" en el menú):</strong> <span data-dyn><?php echo htmlspecialchars(implode(', ', $prodAgotados)); ?></span></p>
                        <?php endif; ?>
                        <?php if ($ingAgotados): ?>
                            <p><strong data-i18n="aAlertOutIng">Ingredientes sin stock:</strong> <span data-dyn><?php echo htmlspecialchars(implode(', ', $ingAgotados)); ?></span></p>
                        <?php endif; ?>
                        <a href="#inventory" onclick="irAInventario(); return false;" data-i18n="aSeeInventory">Ver inventario y reabastecer →</a>
                    </div>
                </div>
            <?php endif; ?>
            <?php if ($ingBajos): ?>
                <div class="stock-alert warn" id="stock-alert-low">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div><p><strong data-i18n="aAlertLowIng">Ingredientes por agotarse:</strong> <span data-dyn><?php echo htmlspecialchars(implode(', ', $ingBajos)); ?></span></p></div>
                </div>
            <?php endif; ?>

            <!-- SECCIÓN 1: DASHBOARD -->
            <section id="dashboard" class="tab-section active">
                <div class="section-header" style="margin-bottom: 20px;">
                    <h2 data-i18n="aSummary">Resumen Diario</h2>
                    <button class="btn-primary" onclick="archivarPedidosCompletados()"><i class="fa-solid fa-rotate"></i> <span data-i18n="aCloseShift">Cerrar Turno / Día</span></button>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon pink"><i class="fa-solid fa-bag-shopping"></i></div>
                        <div class="stat-info">
                            <h3 data-i18n="aStatOrders">Pedidos del Turno</h3>
                            <p id="stat-pedidos-hoy"><?php echo $pedidosHoy; ?></p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple"><i class="fa-solid fa-dollar-sign"></i></div>
                        <div class="stat-info">
                            <h3 data-i18n="aStatSales">Ventas del Turno</h3>
                            <p id="stat-ventas-hoy">$<?php echo number_format($ventasHoy, 2); ?> MXN</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon blue"><i class="fa-solid fa-envelope-open-text"></i></div>
                        <div class="stat-info">
                            <h3 data-i18n="aStatMsgs">Mensajes Nuevos</h3>
                            <p id="stat-mensajes"><?php echo $totalMensajes; ?></p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange"><i class="fa-solid fa-star"></i></div>
                        <div class="stat-info">
                            <h3 data-i18n="aStatRating">Valoración Promedio</h3>
                            <p id="stat-rating"><?php if ($totalCalificaciones): ?><?php echo number_format($promedioCalificacion, 1); ?> / 5.0<?php else: ?><span data-i18n="aNoData">Sin datos</span><?php endif; ?></p>
                            <small><?php echo $totalCalificaciones; ?> <span data-i18n="aRatingsCount">calificaciones</span></small>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        <div class="stat-info">
                            <h3 data-i18n="aStatLowStock">Platos con Stock Bajo</h3>
                            <p id="stat-stock-bajo"><?php echo $stockBajo; ?></p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange"><i class="fa-solid fa-boxes-stacked"></i></div>
                        <div class="stat-info">
                            <h3 data-i18n="aStatLowIng">Ingredientes por Reabastecer</h3>
                            <p id="stat-ing-bajos"><?php echo count($ingAgotados) + count($ingBajos); ?></p>
                        </div>
                    </div>
                </div>
            
                <div class="section-header" style="margin: 30px 0 15px;"><h2 data-i18n="aRecentRatings">Calificaciones Recientes</h2></div>
                <div class="table-container">
                    <table class="admin-table">
                        <thead><tr><th data-i18n="aThDate">Fecha</th><th data-i18n="aThTable">Mesa</th><th data-i18n="aThStars">Estrellas</th><th data-i18n="aThComment">Comentario</th></tr></thead>
                        <tbody>
                        <?php if (empty($listaCalificaciones)): ?>
                            <tr><td colspan="4" style="text-align:center;" data-i18n="aNoRatings">Aún no hay calificaciones.</td></tr>
                        <?php else: foreach ($listaCalificaciones as $c): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($c['fecha']); ?></td>
                                <td data-dyn><?php echo htmlspecialchars($c['mesa'] ?? '—'); ?></td>
                                <td style="color:#f5a623;letter-spacing:2px;"><?php echo str_repeat('★', (int)$c['estrellas']) . str_repeat('☆', 5 - (int)$c['estrellas']); ?></td>
                                <td><?php echo htmlspecialchars($c['comentario'] ?: '—'); ?></td>
                            </tr>
                        <?php endforeach; endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- SECCIÓN 2: PEDIDOS -->
            <section id="orders" class="tab-section">
                <div class="section-header">
                    <h2 data-i18n="aOrdersTitle">Gestión de Pedidos del Turno</h2>
                    <div class="filters">
                        <button class="filter-btn active" data-filter="all" data-i18n="aAll">Todos</button>
                        <button class="filter-btn" data-filter="Pendiente" data-i18n="aPending">Pendientes</button>
                        <button class="filter-btn" data-filter="Preparando" data-i18n="aPreparingF">En Preparación</button>
                        <button class="filter-btn" data-filter="Completado" data-i18n="aCompletedF">Completados</button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th data-i18n="aThOrderId">ID Pedido</th>
                                <th data-i18n="aThClient">Cliente</th>
                                <th data-i18n="aThDishes">Platillos</th>
                                <th data-i18n="aThTotal">Total</th>
                                <th data-i18n="aThStatus">Estado</th>
                                <th data-i18n="aThActions">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body">
                            <?php if (empty($listaPedidos)): ?>
                                <tr><td colspan="6" style="text-align:center;" data-i18n="aNoOrders">No hay pedidos en este turno.</td></tr>
                            <?php else: ?>
                                <?php foreach ($listaPedidos as $pedido): ?>
                                    <tr data-status="<?php echo htmlspecialchars($pedido['estado']); ?>" data-id="<?php echo (int)$pedido['id']; ?>">
                                        <td>#<?php echo str_pad($pedido['id'], 3, '0', STR_PAD_LEFT); ?></td>
                                        <td data-dyn><?php echo htmlspecialchars($pedido['mesa']); ?></td>
                                        <td data-dyn><?php echo htmlspecialchars($pedido['platillos'] ?? 'Sin detalle'); ?></td>
                                        <td>$<?php echo number_format($pedido['total'], 2); ?> MXN</td>
                                        <td><span class="badge <?php echo strtolower($pedido['estado']); ?>" data-dyn><?php echo htmlspecialchars($pedido['estado']); ?></span></td>
                                        <td>
                                            <button class="btn-action" onclick="cambiarEstadoPedidoBD(<?php echo (int)$pedido['id']; ?>, 'Preparando')" title="Preparando" data-i18n-title="aTitlePreparing"><i class="fa-solid fa-fire-burner"></i></button>
                                            <button class="btn-action" onclick="cambiarEstadoPedidoBD(<?php echo (int)$pedido['id']; ?>, 'Completado')" title="Completar" data-i18n-title="aTitleComplete"><i class="fa-solid fa-check"></i></button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- SECCIÓN 3: MENSAJES Y CONTACTO -->
            <section id="messages" class="tab-section">
                <div class="section-header">
                    <h2 data-i18n="aMsgTitle">Bandeja de Mensajes y Consultas</h2>
                    <div class="filters">
                        <button class="filter-btn msg-filter active" data-msg-filter="all" data-i18n="aAll">Todos</button>
                        <button class="filter-btn msg-filter" data-msg-filter="mensaje" data-i18n="aMsgsBtn">Mensajes</button>
                        <button class="filter-btn msg-filter" data-msg-filter="calificacion" data-i18n="aRatingsBtn">⭐ Calificaciones</button>
                    </div>
                </div>
                <div class="messages-list" id="messages-container">
                    <?php if (empty($listaMensajes)): ?>
                        <p style="color: #666; padding: 15px;" data-i18n="aNoMsgs">No hay mensajes ni comentarios todavía.</p>
                    <?php else: ?>
                        <?php foreach ($listaMensajes as $msg): $esCal = $msg['origen'] === 'calificacion'; ?>
                            <div class="message-card <?php echo empty($msg['leido']) ? 'unread' : ''; ?>" data-origen="<?php echo $msg['origen']; ?>">
                                <div class="message-header">
                                    <strong>
                                        <span data-dyn><?php echo htmlspecialchars($msg['nombre'] ?? 'Cliente'); ?></span>
                                        <?php if ($esCal): ?>
                                            <span class="tag-cal" data-i18n="aRatingTag">⭐ Calificación</span>
                                            <span class="stars-cal"><?php echo str_repeat('★', $msg['estrellas']) . str_repeat('☆', 5 - $msg['estrellas']); ?></span>
                                        <?php endif; ?>
                                    </strong>
                                    <span><?php echo htmlspecialchars($msg['fecha'] ?? ''); ?></span>
                                </div>
                                <p><?php echo nl2br(htmlspecialchars($msg['mensaje'] ?? '')); ?></p>
                                <div class="card-buttons">
                                    <?php if (empty($msg['leido'])): ?>
                                        <button class="btn-action" onclick="<?php echo $esCal ? 'marcarCalificacionLeida' : 'marcarMensajeLeido'; ?>(<?php echo (int)$msg['id']; ?>)" title="Marcar como leído" data-i18n-title="aMarkReadTitle"><i class="fa-solid fa-check"></i> <span data-i18n="aReadBtn">Leído</span></button>
                                    <?php endif; ?>
                                    <?php if (!$esCal): ?>
                                        <button class="btn-action btn-danger" onclick="eliminarMensaje(<?php echo (int)$msg['id']; ?>)" title="Eliminar" data-i18n-title="aDeleteTitle"><i class="fa-solid fa-trash"></i></button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </section>

            <!-- SECCIÓN 4: GESTIÓN DE MENÚ E INVENTARIO -->
            <section id="menu" class="tab-section">
                <div class="section-header">
                    <h2 data-i18n="aMenuTitle">Artículos del Menú e Inventario (MySQL)</h2>
                    <button class="btn-primary" id="add-product-btn" onclick="abrirModalNuevoPlato()"><i class="fa-solid fa-plus"></i> <span data-i18n="aNewDish">Nuevo Plato</span></button>
                </div>
                <div class="menu-grid" id="menu-grid-container">
                    <?php foreach ($listaProductos as $prod): ?>
                        <div class="menu-item-card <?php echo $prod['activo'] ? '' : 'inactivo'; ?>"
                             data-prod="<?php echo htmlspecialchars(json_encode($prod, JSON_UNESCAPED_UNICODE), ENT_QUOTES); ?>">
                            <div class="menu-item-info">
                                <h3>#<?php echo (int)$prod['id']; ?> - <span data-dyn><?php echo htmlspecialchars($prod['nombre']); ?></span></h3>
                                <p class="cat"><span data-dyn><?php echo htmlspecialchars($prod['categoria']); ?></span><?php if (!$prod['activo']): ?><span data-i18n="aHiddenTag"> · OCULTO</span><?php endif; ?></p>
                                <p class="price">$<?php echo number_format($prod['precio'], 2); ?> MXN</p>
                                <?php $disp = $prod['disponible']; $agot = $disp !== null && $disp <= 0; ?>
                                <p class="stock <?php echo ($disp !== null && $disp <= 5) ? 'low' : ''; ?>">
                                    <?php if ($agot): ?>
                                        <span class="badge-agotado" data-i18n="aSoldOut">AGOTADO</span>
                                    <?php elseif ($prod['gestion_ing']): ?>
                                        <strong data-i18n="aServings">Se pueden preparar:</strong> <?php echo $disp === null ? '∞' : (int)$disp; ?> <span data-i18n="aUnits">unidades</span>
                                    <?php else: ?>
                                        <strong data-i18n="aStockAvail">Stock disponible:</strong> <?php echo (int)$disp; ?> <span data-i18n="aUnits">unidades</span>
                                    <?php endif; ?>
                                </p>
                                <?php if ($prod['gestion_ing'] && $prod['limitante'] && $disp !== null && $disp <= 5): ?>
                                    <p class="stock low"><strong data-i18n="aLimiting">Se acaba primero:</strong> <span data-dyn><?php echo htmlspecialchars($prod['limitante']); ?></span></p>
                                <?php endif; ?>
                                <div class="recipe-line">
                                    <?php if (empty($prod['receta'])): ?>
                                        <small data-i18n="aNoRecipe">Sin receta de base: usa el stock manual (o los sabores/rellenos ligados a ingredientes).</small>
                                    <?php else: foreach ($prod['receta'] as $ri): $ing = $ctxInv['ing'][$ri['ingrediente_id']] ?? null; if (!$ing) continue; ?>
                                        <span class="ing-chip"><span data-dyn><?php echo htmlspecialchars($ing['nombre']); ?></span> <?php echo fmt_cant($ri['cantidad']) . ' ' . htmlspecialchars($ing['unidad']); ?></span>
                                    <?php endforeach; endif; ?>
                                </div>
                            </div>
                            <div class="card-buttons">
                                <button class="btn-action" onclick="editarPlato(<?php echo (int)$prod['id']; ?>)" title="Editar" data-i18n-title="aEditTitle"><i class="fa-solid fa-pen"></i> <span data-i18n="aEditBtn">Editar</span></button>
                                <button class="btn-action" onclick="abrirReceta(<?php echo (int)$prod['id']; ?>)" title="Ingredientes que usa este plato" data-i18n-title="aRecipeBtnTitle"><i class="fa-solid fa-carrot"></i> <span data-i18n="aRecipeBtn">Receta</span></button>
                                <button class="btn-action" onclick="alternarPlato(<?php echo (int)$prod['id']; ?>, <?php echo $prod['activo'] ? 0 : 1; ?>)" title="<?php echo $prod['activo'] ? 'Ocultar del menú' : 'Mostrar en el menú'; ?>" data-i18n-title="<?php echo $prod['activo'] ? 'aHideFromMenu' : 'aShowInMenu'; ?>">
                                    <i class="fa-solid <?php echo $prod['activo'] ? 'fa-eye-slash' : 'fa-eye'; ?>"></i>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <!-- SECCIÓN INVENTARIO: existencias de cada ingrediente -->
            <section id="inventory" class="tab-section">
                <div class="section-header">
                    <h2 data-i18n="aInvTitle">Inventario de Ingredientes</h2>
                    <button class="btn-primary" onclick="abrirModalIngrediente()"><i class="fa-solid fa-plus"></i> <span data-i18n="aNewIng">Nuevo Ingrediente</span></button>
                </div>
                <p class="section-note" data-i18n="aInvNote">Cada pedido descuenta automáticamente los ingredientes de la receta del platillo (y los de los rellenos, sabores y extras que el cliente elija). Cuando un ingrediente llega a 0, los platillos que lo necesitan aparecen como AGOTADO.</p>
                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr><th data-i18n="aThIngredient">Ingrediente</th><th data-i18n="aThStockLeft">Existencia</th><th data-i18n="aThMin">Mínimo</th><th data-i18n="aThStatus">Estado</th><th data-i18n="aThActions">Acciones</th></tr>
                        </thead>
                        <tbody id="ingredients-table-body">
                            <?php if (empty($listaIngredientes)): ?>
                                <tr><td colspan="5" style="text-align:center;" data-i18n="aNoIngs">No hay ingredientes. Importa schema.sql o agrega uno con "Nuevo Ingrediente".</td></tr>
                            <?php else: foreach ($listaIngredientes as $ing): ?>
                                <tr data-ing="<?php echo htmlspecialchars(json_encode($ing, JSON_UNESCAPED_UNICODE), ENT_QUOTES); ?>" class="<?php echo $ing['estado'] === 'agotado' ? 'row-agotado' : ''; ?>">
                                    <td data-dyn><?php echo htmlspecialchars($ing['nombre']); ?></td>
                                    <td><strong><?php echo fmt_cant($ing['stock']); ?></strong> <?php echo htmlspecialchars($ing['unidad']); ?></td>
                                    <td><?php echo fmt_cant($ing['minimo']) . ' ' . htmlspecialchars($ing['unidad']); ?></td>
                                    <td>
                                        <?php if ($ing['estado'] === 'agotado'): ?><span class="badge agotado" data-i18n="aStOut">AGOTADO</span>
                                        <?php elseif ($ing['estado'] === 'bajo'): ?><span class="badge pendiente" data-i18n="aStLow">Stock bajo</span>
                                        <?php else: ?><span class="badge completado" data-i18n="aStOk">Suficiente</span><?php endif; ?>
                                    </td>
                                    <td>
                                        <button class="btn-action" onclick="reabastecerIngrediente(<?php echo (int)$ing['id']; ?>)" title="Agregar existencia" data-i18n-title="aAddStockTitle"><i class="fa-solid fa-plus"></i></button>
                                        <button class="btn-action" onclick="editarIngrediente(<?php echo (int)$ing['id']; ?>)" title="Editar" data-i18n-title="aEditTitle"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-action btn-danger" onclick="eliminarIngrediente(<?php echo (int)$ing['id']; ?>)" title="Eliminar" data-i18n-title="aDeleteTitle"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            <?php endforeach; endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- SECCIÓN 5: INGREDIENTES, RELLENOS Y EXTRAS (lo que ve el cliente en "Personalizar") -->
            <section id="options" class="tab-section">
                <div class="section-header">
                    <h2 data-i18n="aOptTitle">Ingredientes, Rellenos y Extras</h2>
                    <div class="filters">
                        <select id="filtro-producto-opc" class="filter-select" onchange="filtrarOpciones()">
                            <option value="all" data-i18n="aAllProducts">Todos los productos</option>
                            <?php foreach ($listaProductos as $prod): ?>
                                <option value="<?php echo (int)$prod['id']; ?>" data-dyn>#<?php echo (int)$prod['id']; ?> - <?php echo htmlspecialchars($prod['nombre']); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <button class="btn-primary" onclick="abrirModalOpcion()"><i class="fa-solid fa-plus"></i> <span data-i18n="aNewOpt">Nueva Opción</span></button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr><th data-i18n="aThProduct">Producto</th><th data-i18n="aThType">Tipo</th><th data-i18n="aThOption">Opción</th><th data-i18n="aThConsumes">Consume / Omite</th><th data-i18n="aThPrice">Precio</th><th data-i18n="aThStatus">Estado</th><th data-i18n="aThActions">Acciones</th></tr>
                        </thead>
                        <tbody id="options-table-body">
                            <?php
                            $tiposNombre = ['relleno' => 'Relleno base', 'proteina' => 'Proteína', 'sabor' => 'Sabor / Variedad',
                                            'quitar' => 'Ingrediente a eliminar', 'extra' => 'Extra (+ precio)'];
                            ?>
                            <?php if (empty($listaOpciones)): ?>
                                <tr><td colspan="7" style="text-align:center;" data-i18n="aNoOpts">No hay opciones. Importa schema.sql o agrega una con "Nueva Opción".</td></tr>
                            <?php else: foreach ($listaOpciones as $op): ?>
                                <tr data-producto="<?php echo (int)$op['producto_id']; ?>"
                                    data-opcion="<?php echo htmlspecialchars(json_encode($op, JSON_UNESCAPED_UNICODE), ENT_QUOTES); ?>"
                                    class="<?php echo $op['activo'] ? '' : 'inactivo-row'; ?>">
                                    <td data-dyn>#<?php echo (int)$op['producto_id']; ?> <?php echo htmlspecialchars($op['producto']); ?></td>
                                    <td data-dyn><?php echo $tiposNombre[$op['tipo']] ?? htmlspecialchars($op['tipo']); ?></td>
                                    <td data-dyn><?php echo htmlspecialchars($op['nombre']); ?></td>
                                    <td class="consume-cell">
                                        <?php if (empty($op['ingredientes'])): ?>—
                                        <?php else: foreach ($op['ingredientes'] as $oi): $ing = $ctxInv['ing'][$oi['ingrediente_id']] ?? null; if (!$ing) continue; ?>
                                            <span class="ing-chip <?php echo $op['tipo'] === 'quitar' ? 'skip' : ''; ?>"><?php echo $op['tipo'] === 'quitar' ? '✕ ' : ''; ?><span data-dyn><?php echo htmlspecialchars($ing['nombre']); ?></span><?php echo $op['tipo'] === 'quitar' ? '' : ' ' . fmt_cant($oi['cantidad']) . ' ' . htmlspecialchars($ing['unidad']); ?></span>
                                        <?php endforeach; endif; ?>
                                    </td>
                                    <td><?php echo $op['tipo'] === 'extra' ? '+$' . number_format($op['precio'], 2) . ' MXN' : '—'; ?></td>
                                    <td><span class="badge <?php echo $op['activo'] ? 'completado' : 'pendiente'; ?>" data-i18n="<?php echo $op['activo'] ? 'aVisible' : 'aHiddenF'; ?>"><?php echo $op['activo'] ? 'Visible' : 'Oculta'; ?></span></td>
                                    <td>
                                        <button class="btn-action" onclick="editarOpcion(<?php echo (int)$op['id']; ?>)" title="Editar" data-i18n-title="aEditTitle"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-action" onclick="alternarOpcion(<?php echo (int)$op['id']; ?>, <?php echo $op['activo'] ? 0 : 1; ?>)" title="<?php echo $op['activo'] ? 'Ocultar' : 'Mostrar'; ?>" data-i18n-title="<?php echo $op['activo'] ? 'aHideTitle' : 'aShowTitle'; ?>"><i class="fa-solid <?php echo $op['activo'] ? 'fa-eye-slash' : 'fa-eye'; ?>"></i></button>
                                        <button class="btn-action btn-danger" onclick="eliminarOpcion(<?php echo (int)$op['id']; ?>)" title="Eliminar" data-i18n-title="aDeleteTitle"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            <?php endforeach; endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>

    <!-- MODAL NUEVO PLATO (ADMIN) -->
    <div id="admin-product-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
        <div class="modal-content" style="background: var(--bg-card); color: var(--text-main); padding: 25px; border-radius: 10px; width: 100%; max-width: 450px;">
            <h3 id="modal-plato-titulo" data-i18n="aModalAddDish">Agregar Nuevo Plato al Menú</h3>
            <input type="hidden" id="new-p-id" value="">
            <div style="margin-top: 15px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aDishName">Nombre del Plato:</label>
                <input type="text" id="new-p-name" placeholder="Ej. Tteokbokki Especial" data-i18n-placeholder="aDishNamePh" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aDishPrice">Precio (MXN):</label>
                <input type="number" id="new-p-price" placeholder="Ej. 95" data-i18n-placeholder="aDishPricePh" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aStockLbl">Stock:</label>
                <input type="number" id="new-p-stock" value="50" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
                <small class="section-note" style="display:block; margin-top:4px;" data-i18n="aStockHint">Solo se usa si el platillo no tiene receta; con receta, el stock sale de los ingredientes.</small>
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aCategory">Categoría:</label>
                <select id="new-p-cat" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
                    <option value="Banderillas Coreanas" data-dyn>Banderillas Coreanas</option>
                    <option value="Platillos Tradicionales" data-dyn>Platillos Tradicionales</option>
                    <option value="Estación del Ramen" data-dyn>Estación del Ramen</option>
                    <option value="Bebidas Asiáticas" data-dyn>Bebidas Asiáticas</option>
                    <option value="Seoul Café" data-dyn>Seoul Café</option>
                    <option value="K-Snack" data-dyn>K-Snack</option>
                </select>
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aDesc">Descripción:</label>
                <textarea id="new-p-desc" placeholder="Breve descripción del platillo..." data-i18n-placeholder="aDescPh" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px; height: 60px; resize: none;"></textarea>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="cerrarModalNuevoPlato()" style="flex: 1; padding: 10px; background: #888; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aCancel">Cancelar</button>
                <button onclick="guardarNuevoPlato()" style="flex: 1; padding: 10px; background: #c2185b; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aSaveDish">Guardar Plato</button>
            </div>
        </div>
    </div>


    <!-- MODAL OPCIÓN (INGREDIENTE / EXTRA) -->
    <div id="admin-option-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
        <div class="modal-content" style="background: var(--bg-card); color: var(--text-main); padding: 25px; border-radius: 10px; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto;">
            <h3 id="modal-opcion-titulo" data-i18n="aNewOptTitle">Nueva opción</h3>
            <input type="hidden" id="opc-id" value="">
            <div style="margin-top: 15px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aProductLbl">Producto:</label>
                <select id="opc-producto" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
                    <?php foreach ($listaProductos as $prod): ?>
                        <option value="<?php echo (int)$prod['id']; ?>" data-dyn>#<?php echo (int)$prod['id']; ?> - <?php echo htmlspecialchars($prod['nombre']); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aTypeLbl">Tipo:</label>
                <select id="opc-tipo" onchange="actualizarCampoPrecio()" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
                    <option value="relleno" data-i18n="aTRelleno">Relleno base (obligatorio, elige uno)</option>
                    <option value="proteina" data-i18n="aTProteina">Proteína (elige una)</option>
                    <option value="sabor" data-i18n="aTSabor">Sabor / Variedad (elige uno)</option>
                    <option value="quitar" data-i18n="aTQuitar">Ingrediente a eliminar / Ajuste</option>
                    <option value="extra" data-i18n="aTExtra">Extra (+ precio)</option>
                </select>
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aOptName">Nombre de la opción:</label>
                <input type="text" id="opc-nombre" maxlength="120" placeholder="Ej. Sin Ketchup" data-i18n-placeholder="aOptNamePh" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="margin-top: 10px;">
                <label id="opc-ing-label" style="font-size: 0.85rem; font-weight: bold;">Ingredientes que consume:</label>
                <div id="opc-ing-rows"></div>
                <button type="button" class="btn-action" onclick="agregarFilaIng('opc-ing-rows')"><i class="fa-solid fa-plus"></i> <span data-i18n="aAddIngRow">Agregar ingrediente</span></button>
            </div>
            <div id="opc-precio-box" style="margin-top: 10px; display: none;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aExtraPrice">Precio extra (MXN):</label>
                <input type="number" id="opc-precio" min="0" step="0.5" value="0" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="cerrarModalOpcion()" style="flex: 1; padding: 10px; background: #888; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aCancel">Cancelar</button>
                <button onclick="guardarOpcion()" style="flex: 1; padding: 10px; background: #c2185b; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aSave">Guardar</button>
            </div>
        </div>
    </div>

    <!-- MODAL INGREDIENTE -->
    <div id="admin-ingredient-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
        <div class="modal-content" style="background: var(--bg-card); color: var(--text-main); padding: 25px; border-radius: 10px; width: 100%; max-width: 450px;">
            <h3 id="modal-ing-titulo" data-i18n="aNewIng">Nuevo Ingrediente</h3>
            <input type="hidden" id="ing-id" value="">
            <div style="margin-top: 15px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aIngName">Nombre del ingrediente:</label>
                <input type="text" id="ing-nombre" maxlength="100" placeholder="Ej. Queso Mozzarella" data-i18n-placeholder="aIngNamePh" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aIngUnit">Unidad:</label>
                <select id="ing-unidad" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
                    <option value="pza" data-i18n="aUnitPza">Piezas (pza)</option>
                    <option value="g" data-i18n="aUnitG">Gramos (g)</option>
                    <option value="ml" data-i18n="aUnitMl">Mililitros (ml)</option>
                </select>
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aIngStock">Existencia actual:</label>
                <input type="number" id="ing-stock" min="0" step="0.001" value="0" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="margin-top: 10px;">
                <label style="font-size: 0.85rem; font-weight: bold;" data-i18n="aIngMin">Avisar cuando quede (mínimo):</label>
                <input type="number" id="ing-minimo" min="0" step="0.001" value="0" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="cerrarModalIngrediente()" style="flex: 1; padding: 10px; background: #888; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aCancel">Cancelar</button>
                <button onclick="guardarIngrediente()" style="flex: 1; padding: 10px; background: #c2185b; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aSave">Guardar</button>
            </div>
        </div>
    </div>

    <!-- MODAL RECETA (ingredientes de un platillo) -->
    <div id="admin-recipe-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
        <div class="modal-content" style="background: var(--bg-card); color: var(--text-main); padding: 25px; border-radius: 10px; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto;">
            <h3 id="modal-receta-titulo">Receta</h3>
            <input type="hidden" id="receta-producto-id" value="">
            <p class="section-note" data-i18n="aRecipeHint">Ingredientes que gasta UNA unidad de este platillo. Los rellenos, sabores y extras que el cliente elija se descuentan aparte (pestaña "Ingredientes y Extras").</p>
            <div id="receta-rows"></div>
            <button type="button" class="btn-action" onclick="agregarFilaIng('receta-rows')"><i class="fa-solid fa-plus"></i> <span data-i18n="aAddIngRow">Agregar ingrediente</span></button>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="cerrarModalReceta()" style="flex: 1; padding: 10px; background: #888; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aCancel">Cancelar</button>
                <button onclick="guardarReceta()" style="flex: 1; padding: 10px; background: #c2185b; color: #fff; border: none; border-radius: 5px; cursor: pointer;" data-i18n="aSave">Guardar</button>
            </div>
        </div>
    </div>

    <!-- Lista de ingredientes para los selectores de receta / opciones -->
    <script>
        const INGREDIENTES = <?php echo json_encode(array_map(fn($i) => ['id' => $i['id'], 'nombre' => $i['nombre'], 'unidad' => $i['unidad']], $listaIngredientes), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
    </script>
    <!-- Script de Administración conectado a MySQL -->
    <script src="Js/i18n.js"></script>
    <script src="Js/Administrador.js"></script>
</body>
</html>
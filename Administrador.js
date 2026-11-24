// ==========================================
// PANEL DE ADMINISTRADOR - SEOULMATE (MySQL via api.php)
// ==========================================
const API_URL = 'api.php';

async function llamarAPI(accion, datos = {}) {
    const resp = await fetch(`${API_URL}?accion=${accion}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (resp.status === 401) {            // sesión caducada
        location.href = 'index.html?login=1';
        throw new Error('Sesión caducada');
    }
    const json = await resp.json();
    if (!json.success) throw new Error(json.error || 'Error desconocido');   // SM.srv() lo traduce al mostrarlo
    return json;
}

async function ejecutar(accion, datos, claveError) {
    try {
        await llamarAPI(accion, datos);
        location.reload();
    } catch (err) {
        alert(SM.t(claveError || 'aErr') + ': ' + SM.srv(err.message));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Pestañas del sidebar ---
    const links = document.querySelectorAll('.sidebar-menu a[data-tab]');
    const secciones = document.querySelectorAll('.tab-section');
    function mostrarTab(tab) {
        secciones.forEach(s => s.classList.toggle('active', s.id === tab));
        links.forEach(l => l.classList.toggle('active', l.dataset.tab === tab));
        try { sessionStorage.setItem('admin_tab', tab); } catch (e) {}
    }
    links.forEach(link => link.addEventListener('click', e => {
        e.preventDefault();
        mostrarTab(link.dataset.tab);
    }));
    try {
        const t = sessionStorage.getItem('admin_tab');
        if (t && document.getElementById(t)) mostrarTab(t);
    } catch (e) {}

    // --- Filtros de pedidos ---
    function aplicarFiltro(filtro) {
        document.querySelectorAll('#orders-table-body tr[data-status]').forEach(tr => {
            tr.style.display = (filtro === 'all' || tr.dataset.status === filtro) ? '' : 'none';
        });
    }
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        aplicarFiltro(btn.dataset.filter);
        try { sessionStorage.setItem('admin_filtro', btn.dataset.filter); } catch (e) {}
    }));
    try {
        const f = sessionStorage.getItem('admin_filtro');
        const btn = f && document.querySelector(`.filter-btn[data-filter="${f}"]`);
        if (btn) btn.click();
    } catch (e) {}

    // --- Tema claro / oscuro ---
    const toggle = document.getElementById('theme-toggle');
    try {
        if (localStorage.getItem('admin_theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    } catch (e) {}
    if (toggle) toggle.addEventListener('click', () => {
        const oscuro = document.documentElement.getAttribute('data-theme') === 'dark';
        if (oscuro) document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('admin_theme', oscuro ? 'light' : 'dark'); } catch (e) {}
    });

    // --- Actualización automática cada 30 s (pedidos nuevos), salvo si hay un modal abierto ---
    setInterval(() => {
        const abiertos = ['admin-product-modal', 'admin-option-modal', 'admin-ingredient-modal', 'admin-recipe-modal'].map(id => document.getElementById(id));
        if (abiertos.some(m => m && m.style.display === 'flex')) return;
        location.reload();
    }, 30000);
});

// --- Pedidos ---
function cambiarEstadoPedidoBD(id, estado) {
    ejecutar('actualizar_estado', { id, estado }, 'aErrUpdate');
}
function archivarPedidosCompletados() {
    if (!confirm(SM.t('aConfirmShift'))) return;
    ejecutar('reiniciar_turno', {}, 'aErrShift');
}

// --- Mensajes ---
function marcarMensajeLeido(id) { ejecutar('marcar_mensaje_leido', { id }, 'aErr'); }
function marcarCalificacionLeida(id) { ejecutar('marcar_calificacion_leida', { id }, 'aErr'); }
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.msg-filter').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.msg-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.msgFilter;
        document.querySelectorAll('#messages-container .message-card').forEach(c => {
            c.style.display = (f === 'all' || c.dataset.origen === f) ? '' : 'none';
        });
    }));
});
function eliminarMensaje(id) {
    if (confirm(SM.t('aConfirmDelMsg'))) ejecutar('eliminar_mensaje', { id }, 'aErr');
}

// --- Platos ---
function abrirModalNuevoPlato() {
    document.getElementById('modal-plato-titulo').textContent = SM.t('aModalAddDish');
    ['new-p-id', 'new-p-name', 'new-p-price', 'new-p-desc'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('new-p-stock').value = 50;
    document.getElementById('admin-product-modal').style.display = 'flex';
}
function editarPlato(id) {
    const card = [...document.querySelectorAll('.menu-item-card')].find(c => {
        try { return JSON.parse(c.dataset.prod).id == id; } catch (e) { return false; }
    });
    if (!card) return;
    const p = JSON.parse(card.dataset.prod);
    document.getElementById('modal-plato-titulo').textContent = SM.t('aEditDish', { n: p.id });
    document.getElementById('new-p-id').value = p.id;
    document.getElementById('new-p-name').value = p.nombre;
    document.getElementById('new-p-price').value = p.precio;
    document.getElementById('new-p-stock').value = p.stock;
    document.getElementById('new-p-cat').value = p.categoria;
    document.getElementById('new-p-desc').value = p.descripcion || '';
    document.getElementById('admin-product-modal').style.display = 'flex';
}
function cerrarModalNuevoPlato() {
    document.getElementById('admin-product-modal').style.display = 'none';
}
async function guardarNuevoPlato() {
    const id     = parseInt(document.getElementById('new-p-id').value, 10) || 0;
    const nombre = document.getElementById('new-p-name').value.trim();
    const precio = parseFloat(document.getElementById('new-p-price').value);
    const stock  = parseInt(document.getElementById('new-p-stock').value, 10);
    const categoria   = document.getElementById('new-p-cat').value;
    const descripcion = document.getElementById('new-p-desc').value.trim();

    if (!nombre || !(precio > 0) || isNaN(stock) || stock < 0) {
        alert(SM.t('aFillDish'));
        return;
    }
    ejecutar(id ? 'editar_producto' : 'guardar_producto',
             { id, nombre, precio, stock, categoria, descripcion }, 'aErrSaveDish');
}
function alternarPlato(id, activo) {
    ejecutar('cambiar_activo_producto', { id, activo }, 'aErr');
}


// --- Ingredientes, rellenos y extras (opciones de "Personalizar") ---
function filtrarOpciones() {
    const f = document.getElementById('filtro-producto-opc').value;
    document.querySelectorAll('#options-table-body tr[data-producto]').forEach(tr => {
        tr.style.display = (f === 'all' || tr.dataset.producto === f) ? '' : 'none';
    });
}
function actualizarCampoPrecio() {
    const tipo = document.getElementById('opc-tipo').value;
    document.getElementById('opc-precio-box').style.display = tipo === 'extra' ? 'block' : 'none';
    // "Sin ..." = ingrediente que NO se descuenta; los demás tipos = ingredientes que SÍ se descuentan
    const omitir = tipo === 'quitar';
    document.getElementById('opc-ing-label').textContent = SM.t(omitir ? 'aOptIngsSkip' : 'aOptIngsUse');
    document.getElementById('opc-ing-rows').classList.toggle('skip-mode', omitir);
}
function abrirModalOpcion() {
    document.getElementById('modal-opcion-titulo').textContent = SM.t('aNewOptTitle');
    document.getElementById('opc-id').value = '';
    const f = document.getElementById('filtro-producto-opc').value;
    if (f !== 'all') document.getElementById('opc-producto').value = f;
    document.getElementById('opc-nombre').value = '';
    document.getElementById('opc-precio').value = 0;
    document.getElementById('opc-ing-rows').innerHTML = '';
    actualizarCampoPrecio();
    document.getElementById('admin-option-modal').style.display = 'flex';
}
function editarOpcion(id) {
    const tr = [...document.querySelectorAll('#options-table-body tr[data-opcion]')].find(t => JSON.parse(t.dataset.opcion).id == id);
    if (!tr) return;
    const o = JSON.parse(tr.dataset.opcion);
    document.getElementById('modal-opcion-titulo').textContent = SM.t('aEditOptTitle');
    document.getElementById('opc-id').value = o.id;
    document.getElementById('opc-producto').value = o.producto_id;
    document.getElementById('opc-tipo').value = o.tipo;
    document.getElementById('opc-nombre').value = o.nombre;
    document.getElementById('opc-precio').value = o.precio;
    document.getElementById('opc-ing-rows').innerHTML = '';
    (o.ingredientes || []).forEach(r => agregarFilaIng('opc-ing-rows', r.ingrediente_id, r.cantidad));
    actualizarCampoPrecio();
    document.getElementById('admin-option-modal').style.display = 'flex';
}
function cerrarModalOpcion() {
    document.getElementById('admin-option-modal').style.display = 'none';
}
function guardarOpcion() {
    const id = parseInt(document.getElementById('opc-id').value, 10) || 0;
    const producto_id = parseInt(document.getElementById('opc-producto').value, 10);
    const tipo = document.getElementById('opc-tipo').value;
    const nombre = document.getElementById('opc-nombre').value.trim();
    const precio = parseFloat(document.getElementById('opc-precio').value) || 0;
    if (!nombre) { alert(SM.t('aTypeName')); return; }
    if (tipo === 'extra' && precio < 0) { alert(SM.t('aNegPrice')); return; }
    try { sessionStorage.setItem('admin_tab', 'options'); } catch (e) {}
    ejecutar('guardar_opcion', { id, producto_id, tipo, nombre, precio, ingredientes: leerFilasIng('opc-ing-rows') }, 'aErrSaveOpt');
}
function alternarOpcion(id, activo) {
    try { sessionStorage.setItem('admin_tab', 'options'); } catch (e) {}
    ejecutar('cambiar_activo_opcion', { id, activo }, 'aErr');
}
function eliminarOpcion(id) {
    if (!confirm(SM.t('aConfirmDelOpt'))) return;
    try { sessionStorage.setItem('admin_tab', 'options'); } catch (e) {}
    ejecutar('eliminar_opcion', { id }, 'aErr');
}

// --- Inventario: ingredientes ---
function irAInventario() {
    const a = document.querySelector('.sidebar-menu a[data-tab="inventory"]');
    if (a) a.click();
}
function ingredientePorId(id) {
    const tr = [...document.querySelectorAll('#ingredients-table-body tr[data-ing]')].find(t => JSON.parse(t.dataset.ing).id == id);
    return tr ? JSON.parse(tr.dataset.ing) : null;
}
function abrirModalIngrediente() {
    document.getElementById('modal-ing-titulo').textContent = SM.t('aNewIng');
    document.getElementById('ing-id').value = '';
    document.getElementById('ing-nombre').value = '';
    document.getElementById('ing-unidad').value = 'g';
    document.getElementById('ing-stock').value = 0;
    document.getElementById('ing-minimo').value = 0;
    document.getElementById('admin-ingredient-modal').style.display = 'flex';
}
function editarIngrediente(id) {
    const ing = ingredientePorId(id);
    if (!ing) return;
    document.getElementById('modal-ing-titulo').textContent = SM.t('aEditIngTitle');
    document.getElementById('ing-id').value = ing.id;
    document.getElementById('ing-nombre').value = ing.nombre;
    const sel = document.getElementById('ing-unidad');
    if (![...sel.options].some(o => o.value === ing.unidad)) sel.add(new Option(ing.unidad, ing.unidad));   // unidad personalizada
    sel.value = ing.unidad;
    document.getElementById('ing-stock').value = ing.stock;
    document.getElementById('ing-minimo').value = ing.minimo;
    document.getElementById('admin-ingredient-modal').style.display = 'flex';
}
function cerrarModalIngrediente() {
    document.getElementById('admin-ingredient-modal').style.display = 'none';
}
function guardarIngrediente() {
    const id = parseInt(document.getElementById('ing-id').value, 10) || 0;
    const nombre = document.getElementById('ing-nombre').value.trim();
    const unidad = document.getElementById('ing-unidad').value;
    const stock = parseFloat(document.getElementById('ing-stock').value);
    const stock_minimo = parseFloat(document.getElementById('ing-minimo').value) || 0;
    if (!nombre || isNaN(stock) || stock < 0 || stock_minimo < 0) { alert(SM.t('aFillIng')); return; }
    try { sessionStorage.setItem('admin_tab', 'inventory'); } catch (e) {}
    ejecutar('guardar_ingrediente', { id, nombre, unidad, stock, stock_minimo }, 'aErrSaveIng');
}
function reabastecerIngrediente(id) {
    const ing = ingredientePorId(id);
    if (!ing) return;
    const txt = prompt(SM.t('aAddStockPrompt', { n: SM.dyn(ing.nombre), u: ing.unidad }));
    if (txt === null) return;
    const cantidad = parseFloat(String(txt).replace(',', '.'));
    if (!(cantidad > 0)) { alert(SM.t('aFillIng')); return; }
    try { sessionStorage.setItem('admin_tab', 'inventory'); } catch (e) {}
    ejecutar('ajustar_stock_ingrediente', { id, cantidad }, 'aErrSaveIng');
}
function eliminarIngrediente(id) {
    if (!confirm(SM.t('aConfirmDelIng'))) return;
    try { sessionStorage.setItem('admin_tab', 'inventory'); } catch (e) {}
    ejecutar('eliminar_ingrediente', { id }, 'aErr');
}

// --- Filas "ingrediente + cantidad" (se usan en la receta de un platillo y en las opciones) ---
function etiquetaIng(i) { return SM.dyn(i.nombre) + ' (' + i.unidad + ')'; }
function agregarFilaIng(contenedorId, ingId, cantidad) {
    if (!INGREDIENTES.length) { alert(SM.t('aNoIngsYet')); return; }
    const row = document.createElement('div');
    row.className = 'ing-row';
    const sel = document.createElement('select');
    sel.className = 'ing-sel';
    INGREDIENTES.forEach(i => {
        const o = new Option(etiquetaIng(i), i.id);
        o.dataset.ing = i.id;
        sel.add(o);
    });
    if (ingId) sel.value = ingId;
    const qty = document.createElement('input');
    qty.type = 'number'; qty.className = 'ing-qty'; qty.min = '0'; qty.step = '0.001';
    qty.value = cantidad !== undefined && cantidad !== null ? parseFloat(cantidad) : 1;
    qty.setAttribute('aria-label', SM.t('aQty'));
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'btn-action btn-danger'; del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    del.onclick = () => row.remove();
    row.append(sel, qty, del);
    document.getElementById(contenedorId).appendChild(row);
}
function leerFilasIng(contenedorId) {
    const out = [];
    document.querySelectorAll('#' + contenedorId + ' .ing-row').forEach(r => {
        const ingrediente_id = parseInt(r.querySelector('.ing-sel').value, 10);
        const cantidad = parseFloat(r.querySelector('.ing-qty').value);
        const modoOmitir = r.parentElement.classList.contains('skip-mode');     // en "Sin ..." la cantidad no importa
        if (ingrediente_id > 0 && (modoOmitir || cantidad > 0)) out.push({ ingrediente_id, cantidad: modoOmitir ? 1 : cantidad });
    });
    return out;
}

// --- Receta de un platillo ---
let recetaNombre = '';
function productoPorId(id) {
    const card = [...document.querySelectorAll('.menu-item-card')].find(c => {
        try { return JSON.parse(c.dataset.prod).id == id; } catch (e) { return false; }
    });
    return card ? JSON.parse(card.dataset.prod) : null;
}
function abrirReceta(id) {
    const p = productoPorId(id);
    if (!p) return;
    recetaNombre = p.nombre;
    document.getElementById('modal-receta-titulo').textContent = SM.t('aRecipeTitle', { n: SM.dyn(p.nombre) });
    document.getElementById('receta-producto-id').value = p.id;
    document.getElementById('receta-rows').innerHTML = '';
    (p.receta || []).forEach(r => agregarFilaIng('receta-rows', r.ingrediente_id, r.cantidad));
    document.getElementById('admin-recipe-modal').style.display = 'flex';
}
function cerrarModalReceta() {
    document.getElementById('admin-recipe-modal').style.display = 'none';
}
function guardarReceta() {
    const producto_id = parseInt(document.getElementById('receta-producto-id').value, 10);
    try { sessionStorage.setItem('admin_tab', 'menu'); } catch (e) {}
    ejecutar('guardar_receta', { producto_id, items: leerFilasIng('receta-rows') }, 'aErrSaveRecipe');
}

// Si el idioma cambia con un modal abierto, se refresca su título
SM.onChange(() => {
    const idP = document.getElementById('new-p-id');
    const tP  = document.getElementById('modal-plato-titulo');
    if (idP && tP) tP.textContent = idP.value ? SM.t('aEditDish', { n: idP.value }) : SM.t('aModalAddDish');
    // Selectores de ingredientes y títulos de los modales nuevos
    document.querySelectorAll('.ing-sel option').forEach(o => {
        const i = INGREDIENTES.find(x => x.id == o.dataset.ing);
        if (i) o.textContent = etiquetaIng(i);
    });
    const rT = document.getElementById('modal-receta-titulo');
    if (rT && recetaNombre) rT.textContent = SM.t('aRecipeTitle', { n: SM.dyn(recetaNombre) });
    const iId = document.getElementById('ing-id'), iT = document.getElementById('modal-ing-titulo');
    if (iId && iT) iT.textContent = iId.value ? SM.t('aEditIngTitle') : SM.t('aNewIng');
    const oTipo = document.getElementById('opc-tipo');
    if (oTipo) actualizarCampoPrecio();
    const idO = document.getElementById('opc-id');
    const tO  = document.getElementById('modal-opcion-titulo');
    if (idO && tO) tO.textContent = idO.value ? SM.t('aEditOptTitle') : SM.t('aNewOptTitle');
});

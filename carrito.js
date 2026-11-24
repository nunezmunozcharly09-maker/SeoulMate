// Los pedidos y mensajes se guardan en MySQL mediante api.php
const API_URL = 'api.php';

let carrito = [];
let productoEnEdicion = null;
let cantidadModal = 1;
const cantidadesCards = {};

const LOCALES = { es: 'es-MX', en: 'en-US', ko: 'ko-KR' };

const tasasMoneda = {
    es: { sufijo: " MXN", simbolo: "$", divisor: 1 },
    en: { sufijo: " USD", simbolo: "$", divisor: 20 },
    ko: { sufijo: "원", simbolo: "₩", divisor: 0.075 }
};

window.addEventListener('DOMContentLoaded', () => {
    cargarMenuDinamico();
    const urlParams = new URLSearchParams(window.location.search);
    const mesaParam = urlParams.get('mesa');

    // Solo se acepta un número de mesa válido (1-99). Si no hay QR válido, queda "--" y no se puede pedir.
    if (mesaParam && /^\d{1,2}$/.test(mesaParam.trim()) && parseInt(mesaParam, 10) > 0) {
        const elementoMesa = document.getElementById('table-number');
        if (elementoMesa) {
            const numeroFormateado = String(parseInt(mesaParam, 10)).padStart(2, '0');
            elementoMesa.dataset.mesa = numeroFormateado;   // el texto (Mesa / Table / 테이블) lo pone pintarMesa()
        }
    }

    if (urlParams.get('admin') === '1' || urlParams.get('admi') === '1') {
        const btnAdmin = document.getElementById('btn-admin-ordenes');
        if (btnAdmin) {
            btnAdmin.style.display = 'inline-block';
        }
    }

    const sidebarLinks = document.querySelectorAll('.sidebar a, .sidebar button, nav a, .nav-links a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const customNotes = document.getElementById('custom-notes');
    const noteError = document.getElementById('note-error');

    if (customNotes && noteError) {
        customNotes.setAttribute('maxlength', '100');
        customNotes.addEventListener('input', function() {
            const langActual = localStorage.getItem('seoulmate_lang') || 'es';
            const t = traducciones[langActual] || traducciones.es;
            const soloLetrasAcentos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
            noteError.textContent = t.modNoteError;

            if (!soloLetrasAcentos.test(this.value)) {
                noteError.style.display = 'block';
                this.style.borderColor = '#e74c3c';
            } else if (this.value.length > 100) {
                noteError.textContent = t.modNoteLengthError;
                noteError.style.display = 'block';
                this.style.borderColor = '#e74c3c';
            } else {
                noteError.style.display = 'none';
                this.style.borderColor = '#ddd';
            }
        });
    }

    const nameInput = document.getElementById('comment-name');
    if (nameInput) {
        let nameError = document.getElementById('name-error');
        if (!nameError) {
            nameError = document.createElement('small');
            nameError.id = 'name-error';
            nameError.style.color = '#e74c3c';
            nameError.style.display = 'none';
            nameError.style.marginTop = '4px';
            nameError.style.fontSize = '0.85rem';
            nameInput.parentNode.appendChild(nameError);
        }

        nameInput.setAttribute('maxlength', '50');
        nameInput.addEventListener('input', function() {
            const langActual = localStorage.getItem('seoulmate_lang') || 'es';
            const soloLetrasAcentos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
            
            nameError.textContent = SM.t('onlyLetters');

            if (!soloLetrasAcentos.test(this.value)) {
                nameError.style.display = 'block';
                this.style.borderColor = '#e74c3c';
            } else {
                nameError.style.display = 'none';
                this.style.borderColor = '#ddd';
            }
        });
    }

    const commentInput = document.getElementById('comment-text');
    if (commentInput) {
        let commentError = document.getElementById('comment-error-msg');
        if (!commentError) {
            commentError = document.createElement('small');
            commentError.id = 'comment-error-msg';
            commentError.style.color = '#e74c3c';
            commentError.style.display = 'none';
            commentError.style.marginTop = '4px';
            commentError.style.fontSize = '0.85rem';
            commentInput.parentNode.appendChild(commentError);
        }

        commentInput.setAttribute('maxlength', '100');
        commentInput.addEventListener('input', function() {
            const langActual = localStorage.getItem('seoulmate_lang') || 'es';
            const soloLetrasAcentos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

            commentError.textContent = SM.t('onlyLetters');

            if (!soloLetrasAcentos.test(this.value)) {
                commentError.style.display = 'block';
                this.style.borderColor = '#e74c3c';
            } else if (this.value.length > 100) {
                commentError.textContent = SM.t('maxChars');
                commentError.style.display = 'block';
                this.style.borderColor = '#e74c3c';
            } else {
                commentError.style.display = 'none';
                this.style.borderColor = '#ddd';
            }
        });
    }

    if (typeof agregarBotonBarraLateralCalificarComida === 'function') agregarBotonBarraLateralCalificarComida();

    const langGuardado = localStorage.getItem('seoulmate_lang') || 'es';
    const selectLang = document.getElementById('lang-selector');
    if (selectLang) {
        selectLang.value = langGuardado;
    }
    aplicarTraducciones(langGuardado);
});

// ==========================================
// CATÁLOGO DE PRODUCTOS (IDs vinculados a MySQL/XAMPP)
// ==========================================
const productos = {
    1: { id: 1, nombre: "Classic Gold", precio: 65.00 },
    2: { id: 2, nombre: "Potato Bomb", precio: 85.00 },
    3: { id: 3, nombre: "Krispy Ramen", precio: 75.00 },
    4: { id: 4, nombre: "Hot Cheeto", precio: 80.00 },
    5: { id: 5, nombre: "Gyozas", precio: 90.00 },
    6: { id: 6, nombre: "Bibimbap", precio: 135.00 },
    7: { id: 7, nombre: "Kimchi", precio: 45.00 },
    8: { id: 8, nombre: "Black Velvet", precio: 110.00 },
    9: { id: 9, nombre: "Cheese Ramen", precio: 95.00 },
    10: { id: 10, nombre: "Red Tide", precio: 105.00 },
    11: { id: 11, nombre: "Hwachae", precio: 85.00 },
    12: { id: 12, nombre: "Soju", precio: 120.00 },
    13: { id: 13, nombre: "Hallabong", precio: 65.00 },
    14: { id: 14, nombre: "Banana Milk Coffee", precio: 70.00 },
    15: { id: 15, nombre: "Dalgona Coffee", precio: 75.00 },
    16: { id: 16, nombre: "Injeolmi Latte", precio: 80.00 },
    17: { id: 17, nombre: "Pepero", precio: 35.00 },
    18: { id: 18, nombre: "My Chew", precio: 25.00 },
    19: { id: 19, nombre: "Ramen Packet", precio: 45.00 }
};

const traducciones = {
    es: {
        navBanderillas: "Banderillas Coreanas",
        navTradicionales: "Platillos Tradicionales",
        navRamen: "Estación del Ramen",
        navBebidas: "Bebidas Asiáticas",
        navCafe: "Seoul Café",
        navSnack: "K-Snack",
        navComentarios: "💬 Dejar Comentario",
        mesaDetectada: "Mesa detectada:",
        pedidoActual: "Pedido Actual:",
        totalLabel: "Total:",
        verCarritoBtn: "🛒 Ver Carrito",
        catBanderillas: "Banderillas Coreanas",
        catTradicionales: "Platillos Tradicionales",
        catRamen: "Estación del Ramen",
        catBebidas: "Bebidas Asiáticas",
        catCafe: "Seoul Café",
        catSnack: "K-Snack",
        btnPersonalizar: "Personalizar",
        btnPedir: "Pedir",
        footerTag: "THE BEST KOREAN CORNDOGS! | K-STREET FOOD EXPERIENCE",
        modCustomTitle: "Personalizar Producto",
        modQtyLabel: "Cantidad a ordenar:",
        modNotesLabel: "Comentarios o instrucciones especiales",
        modNotesPlaceholder: "Escribe instrucciones (solo letras, máx 100 carac)...",
        modNoteError: "⚠️ Solo se permiten letras y acentos (sin números ni símbolos).",
        modNoteLengthError: "⚠️ La nota no debe exceder los 100 caracteres.",
        modAddCartBtn: "Agregar al Carrito",
        ticketGracias: "¡Gracias por tu compra!",
        ticketCocina: "Tu pedido ha sido enviado a cocina 🍳",
        ticketUbicacion: "Ubicación:",
        ticketFecha: "Fecha y Hora:",
        ticketTotal: "TOTAL:",
        ticketCerrar: "Entendido / Cerrar",
        drawerTitle: "📋 Tu Pedido",
        drawerEmpty: "Tu carrito está vacío",
        drawerTotalLabel: "Total:",
        drawerConfirmBtn: "Confirmar Pedido",
        commentSubtext: "¿Tienes alguna sugerencia o comentario sobre nuestro menú? ¡Escríbenos!",
        commentNamePlaceholder: "Tu nombre...",
        commentTextPlaceholder: "Escribe aquí tu comentario...",
        commentSendBtn: "Enviar Comentario",
        ratingTitle: "🌟 Valora tu experiencia",
        ratingSub: "¿Qué te pareció nuestro servicio?",
        ratingBtnEnviar: "Enviar Valoración",
        ratingBtnOmitir: "Omitir por ahora",
        ratingNavBtn: "⭐ Calificar comida",
        ratingCommentPh: "Cuéntanos más (opcional)",
        ratingThanks: "¡Gracias por tu opinión! 💖",
        ratingPick: "Elige de 1 a 5 estrellas",
        lblRelleno: "Elije tu relleno base (Obligatorio)",
        lblProteina: "Elije tu proteína",
        lblSabor: "Selecciona Sabor / Variedad",
        lblQuitar: "Ingredientes a eliminar / Ajustes",
        lblExtras: "Agregar Extras (+ Precio)"
    },
    en: {
        navBanderillas: "Korean Corndogs",
        navTradicionales: "Traditional Dishes",
        navRamen: "Ramen Station",
        navBebidas: "Asian Drinks",
        navCafe: "Seoul Café",
        navSnack: "K-Snack",
        navComentarios: "💬 Leave Feedback",
        mesaDetectada: "Detected Table:",
        pedidoActual: "Current Order:",
        totalLabel: "Total:",
        verCarritoBtn: "🛒 View Cart",
        catBanderillas: "Korean Corndogs",
        catTradicionales: "Traditional Dishes",
        catRamen: "Ramen Station",
        catBebidas: "Asian Drinks",
        catCafe: "Seoul Café",
        catSnack: "K-Snack",
        btnPersonalizar: "Customize",
        btnPedir: "Order",
        footerTag: "THE BEST KOREAN CORNDOGS! | K-STREET FOOD EXPERIENCE",
        modCustomTitle: "Customize Product",
        modQtyLabel: "Quantity to order:",
        modNotesLabel: "Comments or special instructions",
        modNotesPlaceholder: "E.g. No numbers allowed...",
        modNoteError: "⚠️ Only letters and accents allowed.",
        modNoteLengthError: "⚠️ Note must not exceed 100 characters.",
        modAddCartBtn: "Add to Cart",
        ticketGracias: "Thank you for your purchase!",
        ticketCocina: "Your order has been sent to the kitchen 🍳",
        ticketUbicacion: "Location:",
        ticketFecha: "Date & Time:",
        ticketTotal: "TOTAL:",
        ticketCerrar: "Understood / Close",
        drawerTitle: "📋 Your Order",
        drawerEmpty: "Your cart is empty",
        drawerTotalLabel: "Total:",
        drawerConfirmBtn: "Confirm Order",
        commentSubtext: "Do you have any suggestions? Write to us!",
        commentNamePlaceholder: "Your name...",
        commentTextPlaceholder: "Write your comment here...",
        commentSendBtn: "Send Comment",
        ratingTitle: "🌟 Rate your experience",
        ratingSub: "What did you think?",
        ratingBtnEnviar: "Send Rating",
        ratingBtnOmitir: "Skip for now",
        ratingNavBtn: "⭐ Rate your food",
        ratingCommentPh: "Tell us more (optional)",
        ratingThanks: "Thanks for your feedback! 💖",
        ratingPick: "Choose 1 to 5 stars",
        lblRelleno: "Choose your base filling",
        lblProteina: "Choose your protein",
        lblSabor: "Select Flavor",
        lblQuitar: "Ingredients to remove",
        lblExtras: "Add Extras"
    },
    ko: {
        navBanderillas: "한국식 핫도그",
        navTradicionales: "전통 요리",
        navRamen: "라면 스테이션",
        navBebidas: "아시안 음료",
        navCafe: "서울 카페",
        navSnack: "K-스낵",
        navComentarios: "💬 피드백 남기기",
        mesaDetectada: "감지된 테이블:",
        pedidoActual: "현재 주문:",
        totalLabel: "합계:",
        verCarritoBtn: "🛒 장바구니 보기",
        catBanderillas: "한국식 핫도그",
        catTradicionales: "전통 요리",
        catRamen: "라면 스테이션",
        catBebidas: "아시안 음료",
        catCafe: "서울 카페",
        catSnack: "K-스낵",
        btnPersonalizar: "맞춤설정",
        btnPedir: "주문하기",
        footerTag: "최고의 한국식 핫도그!",
        modCustomTitle: "상품 맞춤설정",
        modQtyLabel: "주문 수량:",
        modNotesLabel: "요청사항",
        modNotesPlaceholder: "요청사항 입력...",
        modNoteError: "⚠️ 문자만 허용됩니다.",
        modNoteLengthError: "⚠️ 100자 초과 불가",
        modAddCartBtn: "장바구니에 담기",
        ticketGracias: "감사합니다!",
        ticketCocina: "주문이 전송되었습니다 🍳",
        ticketUbicacion: "위치:",
        ticketFecha: "시간:",
        ticketTotal: "합계:",
        ticketCerrar: "닫기",
        drawerTitle: "📋 장바구니",
        drawerEmpty: "장바구니가 비어 있습니다.",
        drawerTotalLabel: "합계:",
        drawerConfirmBtn: "주문 확정",
        commentSubtext: "의견을 남겨주세요!",
        commentNamePlaceholder: "성함...",
        commentTextPlaceholder: "의견 작성...",
        commentSendBtn: "보내기",
        ratingTitle: "🌟 평가하기",
        ratingSub: "어떠셨나요?",
        ratingBtnEnviar: "제출",
        ratingBtnOmitir: "건너뛰기",
        ratingNavBtn: "⭐ 음식 평가",
        ratingCommentPh: "의견을 남겨주세요 (선택)",
        ratingThanks: "의견 감사합니다! 💖",
        ratingPick: "별 1~5개를 선택하세요",
        lblRelleno: "속재료 선택",
        lblProteina: "단백질 선택",
        lblSabor: "맛 선택",
        lblQuitar: "제외할 재료",
        lblExtras: "추가 토핑"
    }
};

// Textos extra (nombres/descripciones de platillos, mensajes, administrador...) vienen de Js/i18n.js
if (window.SM) Object.keys(traducciones).forEach(l => {
    SM.extend(l, traducciones[l]);                 // los textos de arriba pasan al motor compartido (barra lateral, botones, modales...)
    Object.assign(traducciones[l], SM.dict(l));    // y los textos nuevos de i18n.js se suman aquí
});

const diccOpciones = {
    "Queso Mozzarella": { es: "Queso Mozzarella", en: "Mozzarella Cheese", ko: "모짜렐라 치즈" },
    "Salchicha": { es: "Salchicha", en: "Sausage", ko: "소시지" },
    "Mitad Queso / Mitad Salchicha": { es: "Mitad Queso / Mitad Salchicha", en: "Half Cheese / Half Sausage", ko: "반은 치즈 / 반은 소시지" }
};

function traducirTextoOpcion(textoOriginal, lang) {
    return window.SM ? SM.dyn(textoOriginal, lang) : textoOriginal;
}

// Nombre del platillo en el idioma elegido (los platillos nuevos del admin se quedan como se escribieron)
function nombreProducto(prod, lang) {
    const t = traducciones[lang] || traducciones.es;
    return t['p' + prod.id + 'Name'] || prod.nombre;
}

// Escribe "Mesa 04" / "Table 04" / "테이블 04" según el idioma
function pintarMesa() {
    const el = document.getElementById('table-number');
    if (el && el.dataset.mesa) el.textContent = SM.t('mesaWord') + ' ' + el.dataset.mesa;
}

const opcionesEspecificas = {
    1: { rellenos: ["Queso Mozzarella", "Salchicha", "Mitad Queso / Mitad Salchicha"], quitar: ["Sin Panko crujiente", "Sin Mayonesa"], extras: [{ nombre: "Aderezo Spicy Mayo", precio: 12 }] },
    2: { rellenos: ["Queso Mozzarella", "Salchicha"], quitar: ["Sin Trocitos de Papa"], extras: [{ nombre: "Porción Extra de Papas Cubierta", precio: 18 }] },
    3: { rellenos: ["Queso Mozzarella", "Salchicha"], quitar: ["Sin Costra de Ramen Crujiente"], extras: [{ nombre: "Extra Queso Mozzarella Gratinado", precio: 20 }] },
    4: { rellenos: ["Queso Mozzarella", "Salchicha"], quitar: ["Sin Cheetos Flamin' Hot"], extras: [{ nombre: "Salsa de Queso Flamin' Hot Extra", precio: 18 }] },
    5: { quitar: ["Sin Sellado a la Plancha"], extras: [{ nombre: "Orden de 3 Gyozas Extras", precio: 45 }] },
    6: { proteinas: ["Carne de Res Marinada", "Pollo Teriyaki", "Tofu a la Plancha"], quitar: ["Sin Huevo Frito"], extras: [{ nombre: "Extra Carne Marinada", precio: 35 }] },
    7: { quitar: ["Sin Semillas de Ajonjolí"], extras: [{ nombre: "Porción Extra de Kimchi (150g)", precio: 30 }] },
    8: { quitar: ["Sin Salsa Jajangmyeon"], extras: [{ nombre: "Huevo Nitamago Marinado", precio: 15 }] },
    9: { quitar: ["Sin Toque de Queso Fundido"], extras: [{ nombre: "Rebanada Extra de Queso Americano", precio: 12 }] },
    10: { quitar: ["Sin Mariscos"], extras: [{ nombre: "Mejillones y Camarones Extras", precio: 40 }] },
    11: { quitar: ["Sin Leche Condensada"], extras: [{ nombre: "Perlas de Boba / Tapioca", precio: 15 }] },
    12: { sabores: ["Soju Original", "Soju de Toronja", "Soju de Uva Verde"], extras: [{ nombre: "Lata de Sprite para Mezclar", precio: 25 }] },
    13: { quitar: ["Sin Hielo"], extras: [{ nombre: "Topping de Popping Boba", precio: 15 }] },
    14: { quitar: ["Sin Leche de Banana"], extras: [{ nombre: "Shot Extra de Café Espresso", precio: 15 }] },
    15: { quitar: ["Sin Espuma Dalgona"], extras: [{ nombre: "Capa Extra de Espuma Dalgona", precio: 15 }] },
    16: { quitar: ["Sin Harina de Soya"], extras: [{ nombre: "Mochi Mini Injeolmi", precio: 18 }] },
    17: { sabores: ["Pepero Original", "Pepero Almond"], extras: [{ nombre: "Empaque para Regalo", precio: 10 }] },
    18: { sabores: ["My Chew Uva", "My Chew Fresa"], extras: [{ nombre: "Empaque para Regalo", precio: 10 }] },
    19: { sabores: ["Shin Ramyun", "Buldak Carbonara"], extras: [{ nombre: "Servicio de Cocina con Huevo y Queso", precio: 25 }] }
};

// ---- Disponibilidad real (la calcula el servidor con los ingredientes que quedan) ----
const disponibles = {};              // id de producto -> unidades que se pueden preparar (Infinity = sin límite)
const opcionesAgotadas = new Set();  // "idProducto|tipo|nombre" de rellenos/sabores/extras a los que les falta ingrediente

function limiteProducto(id) { return disponibles[id] === undefined ? Infinity : disponibles[id]; }
function enCarrito(id) { return carrito.reduce((n, it) => n + (Number(it.id) === Number(id) ? it.cantidad : 0), 0); }

function mostrarAviso(msg) {
    let t = document.getElementById('sm-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'sm-toast';
        t.setAttribute('role', 'alert');
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(mostrarAviso._t);
    mostrarAviso._t = setTimeout(() => t.classList.remove('show'), 3500);
}
function nombreParaAviso(id) {
    const p = productos[id];
    return p ? nombreProducto(p, SM.lang()) : '';
}
function avisarAgotado(id) { mostrarAviso(SM.t('soldOutMsg', { n: nombreParaAviso(id) })); }
function avisarLimite(id) {
    const quedan = Math.max(limiteProducto(id) - enCarrito(id), 0);
    mostrarAviso(SM.t('onlyLeftMsg', { n: nombreParaAviso(id), q: quedan }));
}
/** ¿Se pueden agregar `cantidad` más de este producto al carrito? Si no, avisa al cliente. */
function puedeAgregar(id, cantidad) {
    const lim = limiteProducto(id);
    if (lim <= 0) { avisarAgotado(id); return false; }
    if (enCarrito(id) + cantidad > lim) { avisarLimite(id); return false; }
    return true;
}

function cambiarCantCard(id, delta) {
    if (limiteProducto(id) <= 0) { avisarAgotado(id); return; }
    const nueva = Math.max((cantidadesCards[id] || 1) + delta, 1);
    if (delta > 0 && enCarrito(id) + nueva > limiteProducto(id)) { avisarLimite(id); return; }
    cantidadesCards[id] = nueva;
    const el = document.getElementById(`qty-card-${id}`);
    if (el) el.textContent = cantidadesCards[id];
}

function cambiarCantModal(delta) {
    if (delta > 0 && productoEnEdicion && enCarrito(productoEnEdicion.id) + cantidadModal + delta > limiteProducto(productoEnEdicion.id)) {
        avisarLimite(productoEnEdicion.id);
        return;
    }
    cantidadModal += delta;
    if (cantidadModal < 1) cantidadModal = 1;
    const el = document.getElementById('custom-modal-qty');
    if (el) el.textContent = cantidadModal;
}

function agregarDirecto(id) {
    const prod = productos[id];
    const cant = cantidadesCards[id] || 1;
    if (prod) {
        if (!puedeAgregar(id, cant)) return;
        carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precioUnitario: prod.precio,
            cantidad: cant,
            detalles: []
        });
        actualizarCarritoUI();
        cantidadesCards[id] = 1;
        const el = document.getElementById(`qty-card-${id}`);
        if (el) el.textContent = 1;
    }
}

function openCustomizer(id) {
    const prod = productos[id];
    if (!prod) return;
    if (limiteProducto(id) <= 0) { avisarAgotado(id); return; }

    const langActual = localStorage.getItem('seoulmate_lang') || 'es';
    const t = traducciones[langActual] || traducciones.es;
    const configMoneda = tasasMoneda[langActual] || tasasMoneda.es;

    productoEnEdicion = { id: prod.id, nombre: prod.nombre, precio: prod.precio };
    cantidadModal = cantidadesCards[id] || 1;
    
    const qtyEl = document.getElementById('custom-modal-qty');
    if (qtyEl) qtyEl.textContent = cantidadModal;
    
    const titleEl = document.getElementById('custom-title');
    if (titleEl) titleEl.textContent = `${t.modCustomTitle}: ${nombreProducto(prod, langActual)}`;
    
    const container = document.getElementById('dynamic-options-container');
    if (!container) return;
    container.innerHTML = '';

    const config = opcionesEspecificas[id] || {};
    const esc = v => escaparHTML(v).replace(/"/g, '&quot;');
    let html = '';

    const agotada = (tipo, nombre) => opcionesAgotadas.has(id + '|' + tipo + '|' + nombre);
    const etiquetaAgotado = ` <em style="color:#e74c3c;font-weight:700;">(${escaparHTML(SM.t('soldOut'))})</em>`;

    const grupoRadio = (lista, titulo, nombreInput, tipo) => {
        if (!lista || lista.length === 0) return '';
        const primera = lista.findIndex(op => !agotada(tipo, op));     // marcada por defecto: la primera que sí hay
        let h = `<div class="custom-group"><h4>${titulo}</h4>`;
        lista.forEach((op, i) => {
            const ag = agotada(tipo, op);
            h += `<label style="${ag ? 'opacity:.55;' : ''}"><input type="radio" name="${nombreInput}" value="${esc(op)}" ${i === primera ? 'checked' : ''} ${ag ? 'disabled' : ''}> ${escaparHTML(traducirTextoOpcion(op, langActual))}${ag ? etiquetaAgotado : ''}</label><br>`;
        });
        return h + `</div>`;
    };

    html += grupoRadio(config.rellenos, t.lblRelleno, 'relleno-opt', 'relleno');
    html += grupoRadio(config.proteinas, t.lblProteina, 'proteina-opt', 'proteina');
    html += grupoRadio(config.sabores, t.lblSabor, 'sabor-opt', 'sabor');

    if (config.quitar && config.quitar.length > 0) {
        html += `<div class="custom-group"><h4>${t.lblQuitar}</h4>`;
        config.quitar.forEach(q => {
            html += `<label><input type="checkbox" class="remove-opt" value="${esc(q)}"> ${escaparHTML(traducirTextoOpcion(q, langActual))}</label><br>`;
        });
        html += `</div>`;
    }

    if (config.extras && config.extras.length > 0) {
        html += `<div class="custom-group"><h4>${t.lblExtras}</h4>`;
        config.extras.forEach(ext => {
            const precioExtConv = ext.precio / configMoneda.divisor;
            const ag = agotada('extra', ext.nombre);
            html += `<label style="${ag ? 'opacity:.55;' : ''}"><input type="checkbox" class="add-extra" value="${esc(ext.nombre)}" data-price="${ext.precio}" ${ag ? 'disabled' : ''}> ${escaparHTML(traducirTextoOpcion(ext.nombre, langActual))} (+${configMoneda.simbolo}${precioExtConv.toFixed(2)}${configMoneda.sufijo})${ag ? etiquetaAgotado : ''}</label><br>`;
        });
        html += `</div>`;
    }
    container.innerHTML = html;

    const notasEl = document.getElementById('custom-notes');
    if (notasEl) notasEl.value = '';

    const modal = document.getElementById('custom-modal');
    if (modal) modal.classList.add('open');
}

function closeCustomizer() {
    const modal = document.getElementById('custom-modal');
    if (modal) modal.classList.remove('open');
    productoEnEdicion = null;
}

function confirmarPersonalizacion() {
    if (!productoEnEdicion) return;

    let precioUnitario = productoEnEdicion.precio;
    let detalles = [];

    const relChecked = document.querySelector('input[name="relleno-opt"]:checked');
    if (relChecked) detalles.push(relChecked.value);

    const proChecked = document.querySelector('input[name="proteina-opt"]:checked');
    if (proChecked) detalles.push(proChecked.value);

    const sabChecked = document.querySelector('input[name="sabor-opt"]:checked');
    if (sabChecked) detalles.push(sabChecked.value);

    document.querySelectorAll('.remove-opt:checked').forEach(cb => detalles.push(cb.value));

    document.querySelectorAll('.add-extra:checked').forEach(cb => {
        const precioExtra = parseFloat(cb.getAttribute('data-price'));
        precioUnitario += precioExtra;
        detalles.push(`+ ${cb.value}`);
    });

    const notasEl = document.getElementById('custom-notes');
    const nota = notasEl ? notasEl.value.trim() : '';
    if (nota) {
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(nota) || nota.length > 100) { notasEl.focus(); return; }
        detalles.push('Nota: ' + nota);
    }

    if (!puedeAgregar(productoEnEdicion.id, cantidadModal)) return;
    carrito.push({
        id: productoEnEdicion.id,
        nombre: productoEnEdicion.nombre,
        precioUnitario: precioUnitario,
        cantidad: cantidadModal,
        detalles: detalles
    });

    actualizarCarritoUI();
    closeCustomizer();
    verCarrito();
}

function cambiarCantCarrito(index, delta) {
    if (delta > 0 && enCarrito(carrito[index].id) + delta > limiteProducto(carrito[index].id)) {
        avisarLimite(carrito[index].id);
        return;
    }
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    actualizarCarritoUI();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const langActual = localStorage.getItem('seoulmate_lang') || 'es';
    const configMoneda = tasasMoneda[langActual] || tasasMoneda.es;

    const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const precioTotalMXN = carrito.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    const precioTotalConvertido = precioTotalMXN / configMoneda.divisor;

    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    const drawerTotalEl = document.getElementById('drawer-total');

    if (cartCountEl) cartCountEl.textContent = SM.t('cartItems', { n: totalProductos });
    if (cartTotalEl) cartTotalEl.textContent = `${configMoneda.simbolo}${precioTotalConvertido.toFixed(2)}${configMoneda.sufijo}`;
    if (drawerTotalEl) drawerTotalEl.textContent = `${configMoneda.simbolo}${precioTotalConvertido.toFixed(2)}${configMoneda.sufijo}`;

    renderizarItemsDrawer();
}

function renderizarItemsDrawer() {
    const langActual = localStorage.getItem('seoulmate_lang') || 'es';
    const configMoneda = tasasMoneda[langActual] || tasasMoneda.es;

    const container = document.getElementById('drawer-items');
    if (!container) return;

    if (carrito.length === 0) {
        container.innerHTML = `<p class="empty-msg">${escaparHTML(SM.t('drawerEmpty'))}</p>`;
        return;
    }

    container.innerHTML = '';
    carrito.forEach((prod, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'drawer-item';

        let detallesHTML = '';
        if (prod.detalles && prod.detalles.length > 0) {
            const itemsList = prod.detalles.map(d => `<li>• ${escaparHTML(traducirTextoOpcion(d, langActual))}</li>`).join('');
            detallesHTML = `<ul class="item-details">${itemsList}</ul>`;
        }

        const subtotalConv = (prod.precioUnitario * prod.cantidad) / configMoneda.divisor;
        const unitarioConv = prod.precioUnitario / configMoneda.divisor;

        itemDiv.innerHTML = `
            <div style="flex: 1;">
                <strong>${escaparHTML(nombreProducto(prod, langActual))}</strong>
                ${detallesHTML}
                <span class="item-price">${configMoneda.simbolo}${subtotalConv.toFixed(2)}${configMoneda.sufijo} <small>(${configMoneda.simbolo}${unitarioConv.toFixed(2)} ${SM.t('each')})</small></span>
            </div>
            <div class="cart-qty-control">
                <div class="qty-selector mini">
                    <button onclick="cambiarCantCarrito(${index}, -1)">-</button>
                    <span>${prod.cantidad}</span>
                    <button onclick="cambiarCantCarrito(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="eliminarDelCarrito(${index})">🗑️</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}

function verCarrito() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
}

function cerrarCarrito() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

// ==========================================
// CONFIRMAR PEDIDO (Conexión Frontend -> Base de Datos XAMPP via PHP)
// ==========================================
let enviandoPedido = false;
let ultimoPedidoId = null;

function confirmarPedido() {
    if (carrito.length === 0 || enviandoPedido) return;

    const elementoMesa = document.getElementById('table-number');
    const mesaNum = (elementoMesa && elementoMesa.dataset.mesa) || '--';
    if (!/^\d{2}$/.test(mesaNum)) { alert(SM.t('errNoMesa')); return; }   // sin QR válido no se puede pedir
    const mesaText = 'Mesa ' + mesaNum;   // formato fijo para la base de datos
    enviandoPedido = true;

    // Enviar el pedido a MySQL; el ticket solo aparece si el servidor lo guardó
    fetch(API_URL + '?accion=guardar_pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesa: mesaText, productos: carrito })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            ultimoPedidoId = data.pedido_id || null;
            mostrarTicket(mesaText);
        } else {
            alert(SM.t('errSendOrder', { m: SM.srv(data.error) || SM.t('errUnknown') }));
        }
    })
    .catch(error => {
        console.error('Error al conectar con el servidor:', error);
        alert(SM.t('errConn'));
    })
    .finally(() => { enviandoPedido = false; });
}

function mostrarTicket(mesaText) {
    // 3. Mostrar Ticket Visual en Pantalla
    const ticketTable = document.getElementById('ticket-table');
    const ticketTime = document.getElementById('ticket-time');
    const ahora = new Date();
    const loc = LOCALES[SM.lang()] || 'es-MX';
    const fechaHora = ahora.toLocaleDateString(loc) + ' ' + ahora.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });

    if (ticketTable) ticketTable.textContent = SM.dyn(mesaText);
    if (ticketTime) ticketTime.textContent = fechaHora;

    const ticketContainer = document.getElementById('ticket-items-list');
    if (ticketContainer) ticketContainer.innerHTML = '';

    let totalAccMXN = 0;
    const langActual = localStorage.getItem('seoulmate_lang') || 'es';
    const configMoneda = tasasMoneda[langActual] || tasasMoneda.es;

    carrito.forEach(prod => {
        const subtotalMXN = prod.precioUnitario * prod.cantidad;
        totalAccMXN += subtotalMXN;
        const subtotalConv = subtotalMXN / configMoneda.divisor;

        if (ticketContainer) {
            const row = document.createElement('div');
            row.className = 'ticket-item-row';
            let subDetalles = prod.detalles && prod.detalles.length > 0 ? `<small>${escaparHTML(prod.detalles.map(d => traducirTextoOpcion(d, langActual)).join(', '))}</small>` : '';

            row.innerHTML = `
                <div>
                    <div><strong>${prod.cantidad}x ${escaparHTML(nombreProducto(prod, langActual))}</strong></div>
                    ${subDetalles}
                </div>
                <div>${configMoneda.simbolo}${subtotalConv.toFixed(2)}${configMoneda.sufijo}</div>
            `;
            ticketContainer.appendChild(row);
        }
    });

    const finalTotalEl = document.getElementById('ticket-final-total');
    if (finalTotalEl) {
        const totalConv = totalAccMXN / configMoneda.divisor;
        finalTotalEl.textContent = `${configMoneda.simbolo}${totalConv.toFixed(2)}${configMoneda.sufijo}`;
    }

    cerrarCarrito();
    const ticketModal = document.getElementById('ticket-modal');
    if (ticketModal) ticketModal.classList.add('open');

    carrito = [];
    actualizarCarritoUI();
}

function cerrarTicket() {
    const ticketModal = document.getElementById('ticket-modal');
    if (ticketModal) ticketModal.classList.remove('open');
    // Después de confirmar el pedido, invitar a calificar la comida
    if (ultimoPedidoId) abrirCalificacion();
}

// ==========================================
// CALIFICAR LA COMIDA
// ==========================================
let estrellasElegidas = 0;
const pedidosCalificados = new Set();

function pintarEstrellas(n) {
    document.querySelectorAll('#rating-stars button').forEach(b => {
        b.classList.toggle('on', parseInt(b.dataset.v, 10) <= n);
    });
}
function elegirEstrellas(n) {
    estrellasElegidas = n;
    pintarEstrellas(n);
    const err = document.getElementById('rating-error');
    if (err) err.style.display = 'none';
}
function abrirCalificacion() {
    estrellasElegidas = 0;
    pintarEstrellas(0);
    const c = document.getElementById('rating-comment');
    if (c) c.value = '';
    const err = document.getElementById('rating-error');
    if (err) err.style.display = 'none';
    const modal = document.getElementById('rating-modal');
    if (modal) modal.classList.add('open');
}
function cerrarCalificacion() {
    const modal = document.getElementById('rating-modal');
    if (modal) modal.classList.remove('open');
}
function enviarCalificacion() {
    const err = document.getElementById('rating-error');
    if (estrellasElegidas < 1) { if (err) err.style.display = 'block'; return; }
    if (ultimoPedidoId && pedidosCalificados.has(ultimoPedidoId)) { cerrarCalificacion(); return; }
    const comentario = (document.getElementById('rating-comment') || { value: '' }).value.trim();
    const btn = document.getElementById('rating-send');
    if (btn) btn.disabled = true;

    fetch(API_URL + '?accion=guardar_calificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido_id: ultimoPedidoId, estrellas: estrellasElegidas, comentario: comentario })
    })
    .then(r => r.json())
    .then(data => {
        if (!data.success) throw new Error(data.error || 'Error');
        if (ultimoPedidoId) pedidosCalificados.add(ultimoPedidoId);
        cerrarCalificacion();
        const lang = localStorage.getItem('seoulmate_lang') || 'es';
        alert((traducciones[lang] || traducciones.es).ratingThanks);
    })
    .catch(e => alert(SM.t('errRating', { m: SM.srv(e.message) })))
    .finally(() => { if (btn) btn.disabled = false; });
}

// Botón fijo en la barra lateral para calificar en cualquier momento
function agregarBotonBarraLateralCalificarComida() {
    const nav = document.querySelector('.nav-menu');
    if (!nav || document.getElementById('nav-calificar')) return;
    const a = document.createElement('a');
    a.href = '#';
    a.id = 'nav-calificar';
    a.setAttribute('data-i18n', 'ratingNavBtn');
    a.textContent = '⭐ Calificar comida';
    a.addEventListener('click', e => { e.preventDefault(); abrirCalificacion(); });
    nav.appendChild(a);
}

function cambiarIdioma(lang) {
    SM.setLang(lang);          // guarda el idioma, traduce todo lo marcado con data-i18n y avisa abajo
}

// Cuando cambia el idioma (aquí o desde la portada) se refrescan precios, carrito y textos dinámicos
if (window.SM) SM.onChange(lang => aplicarTraducciones(lang));

function aplicarTraducciones(lang) {
    const configMoneda = tasasMoneda[lang] || tasasMoneda.es;

    // Textos fijos, placeholders, nombres y descripciones de platillos (data-i18n...)
    SM.apply();
    pintarMesa();

    // Precios convertidos a la moneda del idioma
    document.querySelectorAll('.product-card').forEach((card) => {
        const qtyEl = card.querySelector('[id^="qty-card-"]');
        const prodId = qtyEl ? parseInt(qtyEl.id.replace('qty-card-', ''), 10) : 0;
        if (productos[prodId]) {
            const precioConv = productos[prodId].precio / configMoneda.divisor;
            const priceContainer = card.querySelector('.price-container');
            if (priceContainer) {
                priceContainer.innerHTML = `<span class="price-mxn">${configMoneda.simbolo}${precioConv.toFixed(lang === 'ko' ? 0 : 2)}${configMoneda.sufijo}</span>`;
            }
        }
    });

    actualizarCarritoUI();
}

function enviarComentarioPagina() {
    const nombreInput = document.getElementById('comment-name');
    const textoInput = document.getElementById('comment-text');
    const statusMsg = document.getElementById('comment-status');

    const langActual = localStorage.getItem('seoulmate_lang') || 'es';
    const t = traducciones[langActual] || traducciones.es;

    const nombre = nombreInput.value.trim() || 'Anónimo';   // se guarda en español; el admin lo traduce al mostrarlo
    const comentario = textoInput.value.trim();

    const soloLetrasAcentos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

    if (!soloLetrasAcentos.test(nombreInput.value) || !soloLetrasAcentos.test(comentario)) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#e74c3c';
        statusMsg.textContent = SM.t('cmtErrOnly');
        return;
    }

    if (!comentario) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#e74c3c';
        statusMsg.textContent = SM.t('cmtEmpty');
        return;
    }

    const ahora = new Date();
    const fechaHora = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    fetch(API_URL + '?accion=guardar_mensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, mensaje: comentario })
    })
    .then(r => r.json())
    .then(data => {
        if (!data.success) throw new Error(data.error || 'Error');
        nombreInput.value = '';
        textoInput.value = '';

        statusMsg.style.display = 'block';
        statusMsg.style.color = '#27ae60';
        statusMsg.textContent = SM.t('cmtOk');

        setTimeout(() => {
            statusMsg.style.display = 'none';
        }, 4000);
    }).catch(error => {
        console.error("Error al guardar comentario: ", error);
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#e74c3c';
        statusMsg.textContent = SM.t('cmtFail');
    });
}

const cartCanvas = document.getElementById('cart-petals-canvas');
const cartCtx = cartCanvas ? cartCanvas.getContext('2d') : null;

function resizeCartCanvas() {
    if (!cartCanvas) return;
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
        cartCanvas.width = drawer.clientWidth;
        cartCanvas.height = drawer.clientHeight;
    }
}
window.addEventListener('resize', resizeCartCanvas);

const totalCartPetals = 20;
const cartPetals = [];

class CartPetal {
    constructor() {
        this.reset();
    }

    reset() {
        if (!cartCanvas) return;
        this.x = Math.random() * cartCanvas.width;
        this.y = Math.random() * -cartCanvas.height;
        this.scale = Math.random() * 0.25 + 0.15;
        this.speedY = Math.random() * 1.0 + 0.6;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.2;
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
        if (!cartCanvas) return;
        this.y += this.speedY;
        this.x += Math.sin(this.y / 25) + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > cartCanvas.height + 20) {
            this.reset();
        }
    }

    draw() {
        if (!cartCtx) return;
        cartCtx.save();
        cartCtx.translate(this.x, this.y);
        cartCtx.rotate((this.rotation * Math.PI) / 180);
        cartCtx.scale(this.scale, this.scale);

        const gradient = cartCtx.createRadialGradient(0, 0, 2, 0, 0, 25);
        gradient.addColorStop(0, `rgba(255, 215, 225, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(238, 110, 148, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(195, 55, 92, ${this.opacity})`);

        cartCtx.fillStyle = gradient;

        cartCtx.beginPath();
        cartCtx.moveTo(0, 25);
        cartCtx.bezierCurveTo(-15, 15, -22, -5, -12, -20);
        cartCtx.bezierCurveTo(-5, -28, 5, -28, 12, -20);
        cartCtx.bezierCurveTo(22, -5, 15, 15, 0, 25);
        cartCtx.closePath();
        cartCtx.fill();

        cartCtx.restore();
    }
}

if (cartCanvas) {
    for (let i = 0; i < totalCartPetals; i++) {
        cartPetals.push(new CartPetal());
    }

    function animateCartPetals() {
        if (cartCtx && cartCanvas) {
            cartCtx.clearRect(0, 0, cartCanvas.width, cartCanvas.height);
            cartPetals.forEach((petal) => {
                petal.update();
                petal.draw();
            });
        }
        requestAnimationFrame(animateCartPetals);
    }

    animateCartPetals();
}

// ==========================================
// MENÚ SINCRONIZADO CON MySQL (precios, stock, platos ocultos y platos nuevos)
// ==========================================
function escaparHTML(t) {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
}

// Opciones de "Personalizar" guardadas en MySQL (si el servidor no responde se usan las del código)
const TIPO_A_CLAVE = { relleno: 'rellenos', proteina: 'proteinas', sabor: 'sabores', quitar: 'quitar' };
function aplicarOpcionesBD(filas) {
    if (!Array.isArray(filas) || filas.length === 0) return;
    Object.keys(opcionesEspecificas).forEach(k => delete opcionesEspecificas[k]);
    opcionesAgotadas.clear();
    filas.forEach(o => {
        const id = parseInt(o.producto_id, 10);
        if (o.agotada) opcionesAgotadas.add(id + '|' + o.tipo + '|' + o.nombre);
        const cfg = opcionesEspecificas[id] = opcionesEspecificas[id] || {};
        if (o.tipo === 'extra') (cfg.extras = cfg.extras || []).push({ nombre: o.nombre, precio: parseFloat(o.precio) });
        else if (TIPO_A_CLAVE[o.tipo]) (cfg[TIPO_A_CLAVE[o.tipo]] = cfg[TIPO_A_CLAVE[o.tipo]] || []).push(o.nombre);
    });
}

function cargarMenuDinamico() {
    const pOpc = fetch(API_URL + '?accion=listar_opciones').then(r => r.json()).catch(() => null);
    const pProd = fetch(API_URL + '?accion=listar_productos').then(r => r.json());
    Promise.all([pOpc, pProd])
        .then(([dataOpc, data]) => {
            if (dataOpc && dataOpc.success) aplicarOpcionesBD(dataOpc.opciones);
            if (!data.success) return;
            const contenedor = document.getElementById('productos-dinamicos');
            const titulo = document.getElementById('titulo-nuevos');
            let hayNuevos = false;

            data.productos.forEach(p => {
                const id = parseInt(p.id, 10);
                const activo = parseInt(p.activo, 10) === 1;
                // unidades que se pueden preparar con los ingredientes que quedan (null = sin límite)
                const disp = (p.disponible === null || p.disponible === undefined) ? Infinity : parseInt(p.disponible, 10);
                disponibles[id] = disp;
                const precio = parseFloat(p.precio);
                let card = null;

                if (id <= 19) {                         // platos estáticos del HTML
                    const qty = document.getElementById('qty-card-' + id);
                    card = qty ? qty.closest('.product-card') : null;
                    if (productos[id]) productos[id].precio = precio;
                } else if (activo && contenedor) {      // platos creados desde el panel
                    productos[id] = { id: id, nombre: p.nombre, precio: precio };
                    contenedor.insertAdjacentHTML('beforeend', `
                        <div class="product-card">
                            <div class="card-frame"><img src="img/cerezo1.jfif" alt="${escaparHTML(p.nombre)}"></div>
                            <h3>${escaparHTML(p.nombre)}</h3>
                            <p class="description">${escaparHTML(p.descripcion)}</p>
                            <div class="price-container"><span class="price-mxn">$${precio.toFixed(2)} MXN</span></div>
                            <div class="qty-selector">
                                <button onclick="cambiarCantCard(${id}, -1)">-</button>
                                <span id="qty-card-${id}">1</span>
                                <button onclick="cambiarCantCard(${id}, 1)">+</button>
                            </div>
                            <div class="card-actions-dual">
                                ${opcionesEspecificas[id] ? `<button class="btn-action btn-custom" onclick="openCustomizer(${id})" data-i18n="btnPersonalizar">Personalizar</button>` : ''}
                                <button class="btn-action btn-direct" onclick="agregarDirecto(${id})" data-i18n="btnPedir">Pedir</button>
                            </div>
                        </div>`);
                    card = document.getElementById('qty-card-' + id).closest('.product-card');
                    hayNuevos = true;
                }
                if (!card) return;
                if (!activo) { card.style.display = 'none'; return; }
                if (disp <= 0) {
                    // Los botones siguen activos a propósito: al tocarlos el cliente ve el aviso "AGOTADO" (ver puedeAgregar / avisarAgotado)
                    card.style.opacity = '0.5';
                    const h = card.querySelector('h3');
                    if (h && !card.querySelector('.agotado')) h.insertAdjacentHTML('afterend', '<p class="agotado" data-i18n="soldOut" style="color:#e74c3c;font-weight:700;">AGOTADO</p>');
                }
            });

            if (hayNuevos && titulo) titulo.style.display = '';
            aplicarTraducciones(localStorage.getItem('seoulmate_lang') || 'es');   // refresca precios convertidos
        })
        .catch(() => { /* sin servidor: se muestra el menú estático */ });
}

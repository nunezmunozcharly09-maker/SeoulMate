/* ==========================================================================
   SeoulMate - Motor de idiomas compartido (ES / EN / KO)
   --------------------------------------------------------------------------
   Lo usan index.html (portada), Menu.html y Administrador.php.
   El idioma se guarda en localStorage ('seoulmate_lang'), así que el que se
   elige en la portada se mantiene en el menú y en el administrador.

   Cómo marcar textos en el HTML:
     data-i18n="clave"              -> reemplaza el texto del elemento
     data-i18n-html="clave"         -> reemplaza el HTML interno (para <br>, <span>...)
     data-i18n-placeholder="clave"  -> placeholder de inputs/textarea
     data-i18n-title="clave"        -> atributo title (tooltip)
     data-dyn                       -> texto que viene de la base de datos
                                       (platillos, categorías, estados...): se traduce
                                       con el diccionario DYN de abajo.

   El texto en español es el que ya está escrito en el HTML (se guarda como
   original y se restaura al volver a "ES"). Solo hay que escribir EN y KO.
   ========================================================================== */
(function () {
    'use strict';

    var KEY = 'seoulmate_lang';
    var LANGS = ['es', 'en', 'ko'];

    /* ----------------------------------------------------------------------
       1) TEXTOS DE LA INTERFAZ  (clave -> texto)
       ES solo se define para los textos que se usan desde JavaScript
       (alertas, mensajes...). Los de los elementos HTML usan su propio texto.
       ---------------------------------------------------------------------- */
    var PACK = {
        es: {
            fileBanner: "⚠️ Abriste el sitio como archivo. Extrae TODO el zip, copia la carpeta a C:\\xampp\\htdocs\\SeoulMate y abre <u>http://localhost/SeoulMate/index.html</u> (Apache y MySQL encendidos).",
            // Portada
            fileAlert: "Estás abriendo el archivo directamente (file://).\nAbre: http://localhost/SeoulMate/index.html\n(con Apache y MySQL encendidos en XAMPP)",
            badResponse: "El servidor respondió algo inesperado.\nAbre http://localhost/SeoulMate/diagnostico.php para ver qué falta.",
            wrongPass: "Contraseña incorrecta. Acceso denegado.",
            tooMany: "Demasiados intentos. Espera un minuto.",
            noTable: "Falta la tabla 'admins'. Importa schema.sql en phpMyAdmin.",
            checkDiag: "Revisa: http://localhost/SeoulMate/diagnostico.php",
            noConn: "No se pudo conectar con el servidor.\n1) Enciende Apache y MySQL en XAMPP.\n2) Abre el sitio como http://localhost/SeoulMate/index.html\n3) Revisa http://localhost/SeoulMate/diagnostico.php",
            // Menú
            cartItems: "{n} productos",
            each: "c/u",
            mesaWord: "Mesa",
            soldOut: "AGOTADO",
            errSendOrder: "No se pudo enviar tu pedido: {m}",
            errConn: "No se pudo conectar con el servidor. Avisa a tu mesero.",
            errNoMesa: "Escanea el código QR de tu mesa para poder hacer el pedido.",
            errRating: "No se pudo enviar la calificación: {m}",
            errUnknown: "error desconocido",
            onlyLetters: "⚠️ Solo se permiten letras y acentos (sin números ni símbolos).",
            maxChars: "⚠️ Máximo 100 caracteres.",
            cmtErrOnly: "⚠️ Error: Solo se permiten letras y acentos (sin números ni símbolos).",
            cmtEmpty: "⚠️ Por favor escribe un comentario antes de enviar.",
            cmtOk: "✅ ¡Mensaje enviado con éxito!",
            cmtFail: "⚠️ Ocurrió un error al enviar tu mensaje. Inténtalo de nuevo.",
            // Administrador
            aConfirmShift: "Se cerrará el turno: los pedidos actuales se archivan y los mensajes se marcan como leídos. ¿Continuar?",
            aErrUpdate: "No se pudo actualizar el pedido",
            aErrShift: "No se pudo cerrar el turno",
            aErr: "Error",
            aConfirmDelMsg: "¿Eliminar este mensaje definitivamente?",
            aModalAddDish: "Agregar Nuevo Plato al Menú",
            aEditDish: "Editar Plato #{n}",
            aFillDish: "Completa nombre, precio (> 0) y un stock válido.",
            aErrSaveDish: "No se pudo guardar el plato",
            aNewOptTitle: "Nueva opción",
            aEditOptTitle: "Editar opción",
            aTypeName: "Escribe el nombre de la opción.",
            aNegPrice: "El precio no puede ser negativo.",
            aErrSaveOpt: "No se pudo guardar la opción",
            aConfirmDelOpt: "¿Eliminar esta opción definitivamente?",
            aInventory: "Inventario",
            aNeedSchema: "Falta importar schema.sql para activar el inventario por ingredientes (abre diagnostico.php y pulsa \"Importar schema.sql ahora\").",
            aAlertOutProd: "⚠️ Productos AGOTADOS (los clientes ven \"AGOTADO\" en el menú):",
            aAlertOutIng: "Ingredientes sin stock:",
            aSeeInventory: "Ver inventario y reabastecer →",
            aAlertLowIng: "Ingredientes por agotarse:",
            aStatLowIng: "Ingredientes por Reabastecer",
            aSoldOut: "AGOTADO",
            aServings: "Se pueden preparar:",
            aLimiting: "Se acaba primero:",
            aNoRecipe: "Sin receta de base: usa el stock manual (o los sabores/rellenos ligados a ingredientes).",
            aRecipeBtn: "Receta",
            aRecipeBtnTitle: "Ingredientes que usa este plato",
            aInvTitle: "Inventario de Ingredientes",
            aNewIng: "Nuevo Ingrediente",
            aInvNote: "Cada pedido descuenta automáticamente los ingredientes de la receta del platillo (y los de los rellenos, sabores y extras que el cliente elija). Cuando un ingrediente llega a 0, los platillos que lo necesitan aparecen como AGOTADO.",
            aThIngredient: "Ingrediente",
            aThStockLeft: "Existencia",
            aThMin: "Mínimo",
            aNoIngs: "No hay ingredientes. Importa schema.sql o agrega uno con \"Nuevo Ingrediente\".",
            aStOut: "AGOTADO",
            aStLow: "Stock bajo",
            aStOk: "Suficiente",
            aAddStockTitle: "Agregar existencia",
            aThConsumes: "Consume / Omite",
            aAddIngRow: "Agregar ingrediente",
            aIngName: "Nombre del ingrediente:",
            aIngNamePh: "Ej. Queso Mozzarella",
            aIngUnit: "Unidad:",
            aUnitPza: "Piezas (pza)",
            aUnitG: "Gramos (g)",
            aUnitMl: "Mililitros (ml)",
            aIngStock: "Existencia actual:",
            aIngMin: "Avisar cuando quede (mínimo):",
            aRecipeHint: "Ingredientes que gasta UNA unidad de este platillo. Los rellenos, sabores y extras que el cliente elija se descuentan aparte (pestaña \"Ingredientes y Extras\").",
            aEditIngTitle: "Editar ingrediente",
            aFillIng: "Escribe un nombre y cantidades válidas (0 o más).",
            aAddStockPrompt: "{n}: ¿cuánto agregar? ({u})",
            aConfirmDelIng: "¿Eliminar este ingrediente? También se quitará de las recetas y opciones que lo usan.",
            aErrSaveIng: "No se pudo guardar el ingrediente",
            aErrSaveRecipe: "No se pudo guardar la receta",
            aRecipeTitle: "Receta de {n}",
            aStockHint: "Solo se usa si el platillo no tiene receta; con receta, el stock sale de los ingredientes.",
            aOptIngsUse: "Ingredientes que consume esta opción:",
            aOptIngsSkip: "Ingrediente que NO se descuenta al elegir esto:",
            aQty: "Cantidad",
            aNoIngsYet: "Primero agrega ingredientes en la pestaña \"Inventario\".",
            soldOutMsg: "Lo sentimos, {n} está agotado por ahora.",
            onlyLeftMsg: "Solo quedan {q} de {n}."
        },

        en: {
            fileBanner: "⚠️ You opened the site as a file. Extract the WHOLE zip, copy the folder to C:\\xampp\\htdocs\\SeoulMate and open <u>http://localhost/SeoulMate/index.html</u> (with Apache and MySQL running).",
            // ---- Portada ----
            idxTitle: "SeoulMate | Korean Corndogs",
            idxTagline: "Korean Corndogs",
            idxSub: "KOREA · MEXICO",
            idxH1: "Flavors that<br><span>bloom ✿</span>",
            idxDesc: "Discover the best of Korean urban gastronomy: from delicious street snacks to our flavor-packed specialties full of tradition.",
            idxMenuBtn: "View Menu",
            idxAdminBtn: "Administrator",
            idxHours: "🕐 \u00a0 12pm – 10pm",
            idxModalTitle: "Administration Panel",
            idxModalText: "Enter your password to continue:",
            idxPassPh: "Password...",
            idxEnter: "Log in",
            idxCancel: "Cancel",
            fileAlert: "You are opening the file directly (file://).\nOpen: http://localhost/SeoulMate/index.html\n(with Apache and MySQL running in XAMPP)",
            badResponse: "The server returned something unexpected.\nOpen http://localhost/SeoulMate/diagnostico.php to see what is missing.",
            wrongPass: "Wrong password. Access denied.",
            tooMany: "Too many attempts. Please wait a minute.",
            noTable: "The 'admins' table is missing. Import schema.sql in phpMyAdmin.",
            checkDiag: "Check: http://localhost/SeoulMate/diagnostico.php",
            noConn: "Could not connect to the server.\n1) Start Apache and MySQL in XAMPP.\n2) Open the site as http://localhost/SeoulMate/index.html\n3) Check http://localhost/SeoulMate/diagnostico.php",

            // ---- Menú ----
            menuTitle: "Seoulmate - Korean Menu",
            moreMenu: "✨ More from the Menu",
            soldOut: "SOLD OUT",
            fbName: "Seoulmate Official",
            cartItems: "{n} items",
            each: "each",
            mesaWord: "Table",
            errSendOrder: "Your order could not be sent: {m}",
            errConn: "Could not connect to the server. Please tell your waiter.",
            errNoMesa: "Scan the QR code on your table to place your order.",
            errRating: "Your rating could not be sent: {m}",
            errUnknown: "unknown error",
            onlyLetters: "⚠️ Only letters and accents allowed (no numbers or symbols).",
            maxChars: "⚠️ Max 100 characters.",
            cmtErrOnly: "⚠️ Error: Only letters and accents allowed (no numbers or symbols).",
            cmtEmpty: "⚠️ Please write a comment before sending.",
            cmtOk: "✅ Message sent successfully!",
            cmtFail: "⚠️ Error sending message. Please try again.",
            p1Name: "Classic Gold", p1Desc: "Traditional corndog with your choice of filling and a crunchy panko coating.",
            p2Name: "Potato Bomb", p2Desc: "Corndog with your choice of filling, covered in golden crispy potato bits.",
            p3Name: "Krispy Ramen", p3Desc: "Corndog with your choice of filling, coated in a crunchy ramen crust.",
            p4Name: "Hot Cheeto", p4Desc: "Corndog with your choice of filling, breaded and dusted with Flamin' Hot Cheetos.",
            p5Name: "Gyozas", p5Desc: "Japanese/Korean dumplings, steamed and pan-seared.",
            p6Name: "Bibimbap", p6Desc: "Rice bowl with sautéed vegetables, meat and Korean chili sauce.",
            p7Name: "Kimchi", p7Desc: "Traditional side dish of seasoned, spicy fermented cabbage.",
            p8Name: "Black Velvet", p8Desc: "Korean noodles in sweet black bean sauce (Jajangmyeon).",
            p9Name: "Cheese Ramen", p9Desc: "Creamy ramen soup with melted cheese and green onion.",
            p10Name: "Red Tide", p10Desc: "Spicy Korean-style ramen with seafood and spices.",
            p11Name: "Hwachae", p11Desc: "Refreshing traditional dessert-drink with fruit and condensed milk.",
            p12Name: "Soju", p12Desc: "Traditional Korean distilled alcoholic beverage.",
            p13Name: "Hallabong", p13Desc: "Refreshing citrus drink made with Jeju mandarin.",
            p14Name: "Banana Milk Coffee", p14Desc: "Espresso coffee with classic Korean banana-flavored milk.",
            p15Name: "Dalgona Coffee", p15Desc: "Frothy whipped coffee served over creamy cold milk.",
            p16Name: "Injeolmi Latte", p16Desc: "Creamy latte with notes of roasted soybean flour and rice.",
            p17Name: "Pepero", p17Desc: "Stick cookies coated in crunchy chocolate.",
            p18Name: "My Chew", p18Desc: "Soft Korean chewy candies with fruity flavor.",
            p19Name: "Ramen Packet", p19Desc: "Traditional Korean instant ramen packet.",

            // ---- Administrador ----
            aTitle: "SeoulMate - Administration Panel",
            aDashboard: "Dashboard", aOrders: "Orders", aMessages: "Messages & Contact",
            aMenu: "Menu Management", aOptions: "Ingredients & Extras", aLogout: "Log out",
            aPanel: "Control Panel", aDate: "Today's date:", aThemeTitle: "Toggle light / dark mode",
            aSummary: "Daily Summary", aCloseShift: "Close Shift / Day",
            aStatOrders: "Orders this Shift", aStatSales: "Sales this Shift", aStatMsgs: "New Messages",
            aStatRating: "Average Rating", aNoData: "No data", aRatingsCount: "ratings",
            aStatLowStock: "Low-Stock Dishes", aRecentRatings: "Recent Ratings",
            aThDate: "Date", aThTable: "Table", aThStars: "Stars", aThComment: "Comment",
            aNoRatings: "No ratings yet.",
            aOrdersTitle: "Shift Order Management",
            aAll: "All", aPending: "Pending", aPreparingF: "In Preparation", aCompletedF: "Completed",
            aThOrderId: "Order ID", aThClient: "Customer", aThDishes: "Dishes", aThTotal: "Total",
            aThStatus: "Status", aThActions: "Actions",
            aNoOrders: "There are no orders in this shift.",
            aTitlePreparing: "Preparing", aTitleComplete: "Complete",
            aMsgTitle: "Messages & Inquiries Inbox", aMsgsBtn: "Messages", aRatingsBtn: "⭐ Ratings",
            aNoMsgs: "No messages or comments yet.", aRatingTag: "⭐ Rating",
            aMarkReadTitle: "Mark as read", aReadBtn: "Read", aDeleteTitle: "Delete",
            aMenuTitle: "Menu Items & Inventory (MySQL)", aNewDish: "New Dish",
            aHiddenTag: " · HIDDEN", aStockAvail: "Available stock:", aUnits: "units",
            aEditBtn: "Edit", aHideFromMenu: "Hide from menu", aShowInMenu: "Show on menu",
            aOptTitle: "Ingredients, Fillings & Extras", aAllProducts: "All products", aNewOpt: "New Option",
            aThProduct: "Product", aThType: "Type", aThOption: "Option", aThPrice: "Price",
            aVisible: "Visible", aHiddenF: "Hidden",
            aNoOpts: "There are no options. Import schema.sql or add one with \"New Option\".",
            aEditTitle: "Edit", aHideTitle: "Hide", aShowTitle: "Show",
            aModalAddDish: "Add New Dish to the Menu", aEditDish: "Edit Dish #{n}",
            aDishName: "Dish name:", aDishNamePh: "E.g. Special Tteokbokki",
            aDishPrice: "Price (MXN):", aDishPricePh: "E.g. 95", aStockLbl: "Stock:",
            aCategory: "Category:", aDesc: "Description:", aDescPh: "Short description of the dish...",
            aCancel: "Cancel", aSaveDish: "Save Dish", aSave: "Save",
            aNewOptTitle: "New option", aEditOptTitle: "Edit option",
            aProductLbl: "Product:", aTypeLbl: "Type:",
            aTRelleno: "Base filling (required, pick one)", aTProteina: "Protein (pick one)",
            aTSabor: "Flavor / Variety (pick one)", aTQuitar: "Ingredient to remove / Adjustment",
            aTExtra: "Extra (+ price)",
            aOptName: "Option name:", aOptNamePh: "E.g. No Ketchup", aExtraPrice: "Extra price (MXN):",
            aConfirmShift: "The shift will be closed: current orders will be archived and messages marked as read. Continue?",
            aErrUpdate: "The order could not be updated",
            aErrShift: "The shift could not be closed",
            aErr: "Error",
            aConfirmDelMsg: "Delete this message permanently?",
            aFillDish: "Fill in the name, a price (> 0) and a valid stock.",
            aErrSaveDish: "The dish could not be saved",
            aTypeName: "Enter the option name.",
            aNegPrice: "The price cannot be negative.",
            aErrSaveOpt: "The option could not be saved",
            aConfirmDelOpt: "Delete this option permanently?",
            aInventory: "Inventory",
            aNeedSchema: "schema.sql must be imported to enable ingredient inventory (open diagnostico.php and press \"Importar schema.sql ahora\").",
            aAlertOutProd: "⚠️ SOLD OUT products (customers see \"SOLD OUT\" on the menu):",
            aAlertOutIng: "Ingredients out of stock:",
            aSeeInventory: "View inventory and restock →",
            aAlertLowIng: "Ingredients running low:",
            aStatLowIng: "Ingredients to Restock",
            aSoldOut: "SOLD OUT",
            aServings: "Can still be made:",
            aLimiting: "Runs out first:",
            aNoRecipe: "No base recipe: uses manual stock (or flavors/fillings linked to ingredients).",
            aRecipeBtn: "Recipe",
            aRecipeBtnTitle: "Ingredients used by this dish",
            aInvTitle: "Ingredient Inventory",
            aNewIng: "New Ingredient",
            aInvNote: "Each order automatically deducts the ingredients in the dish's recipe (plus those of the fillings, flavors and extras the customer picks). When an ingredient reaches 0, the dishes that need it show as SOLD OUT.",
            aThIngredient: "Ingredient",
            aThStockLeft: "In stock",
            aThMin: "Minimum",
            aNoIngs: "No ingredients. Import schema.sql or add one with \"New Ingredient\".",
            aStOut: "SOLD OUT",
            aStLow: "Low stock",
            aStOk: "OK",
            aAddStockTitle: "Add stock",
            aThConsumes: "Uses / Skips",
            aAddIngRow: "Add ingredient",
            aIngName: "Ingredient name:",
            aIngNamePh: "e.g. Mozzarella cheese",
            aIngUnit: "Unit:",
            aUnitPza: "Pieces (pza)",
            aUnitG: "Grams (g)",
            aUnitMl: "Milliliters (ml)",
            aIngStock: "Current stock:",
            aIngMin: "Warn when this much is left (minimum):",
            aRecipeHint: "Ingredients used by ONE unit of this dish. Fillings, flavors and extras the customer picks are deducted separately (\"Ingredients & Extras\" tab).",
            aEditIngTitle: "Edit ingredient",
            aFillIng: "Enter a name and valid quantities (0 or more).",
            aAddStockPrompt: "{n}: how much to add? ({u})",
            aConfirmDelIng: "Delete this ingredient? It will also be removed from the recipes and options that use it.",
            aErrSaveIng: "Could not save the ingredient",
            aErrSaveRecipe: "Could not save the recipe",
            aRecipeTitle: "Recipe for {n}",
            aStockHint: "Only used if the dish has no recipe; with a recipe, stock comes from the ingredients.",
            aOptIngsUse: "Ingredients this option uses:",
            aOptIngsSkip: "Ingredient NOT deducted when this is chosen:",
            aQty: "Quantity",
            aNoIngsYet: "First add ingredients in the \"Inventory\" tab.",
            soldOutMsg: "Sorry, {n} is sold out for now.",
            onlyLeftMsg: "Only {q} of {n} left."
        },

        ko: {
            fileBanner: "⚠️ 사이트를 파일로 열었습니다. zip 전체를 압축 해제하고 폴더를 C:\\xampp\\htdocs\\SeoulMate 에 복사한 뒤 <u>http://localhost/SeoulMate/index.html</u> 로 접속하세요 (Apache와 MySQL 실행 필요).",
            // ---- 포털 (Portada) ----
            idxTitle: "서울메이트 | 한국식 핫도그",
            idxTagline: "한국식 반데리야스",
            idxSub: "한국 · 멕시코",
            idxH1: "꽃처럼<br><span>피어나는 맛 ✿</span>",
            idxDesc: "한국 길거리 음식의 진수를 만나보세요. 맛있는 간식부터 전통과 풍미가 가득한 시그니처 메뉴까지.",
            idxMenuBtn: "메뉴 보기",
            idxAdminBtn: "관리자",
            idxHours: "🕐 \u00a0 낮 12시 – 오후 10시",
            idxModalTitle: "관리자 패널",
            idxModalText: "계속하려면 비밀번호를 입력하세요:",
            idxPassPh: "비밀번호...",
            idxEnter: "로그인",
            idxCancel: "취소",
            idxSeparator: "✿ ✿ ✿ ✿ ✿ \u00a0 바삭하게, 치즈 듬뿍, 신선하게 \u00a0 ✿ ✿ ✿ ✿ ✿",
            fileAlert: "파일을 직접 열고 있습니다 (file://).\n다음 주소로 접속하세요: http://localhost/SeoulMate/index.html\n(XAMPP에서 Apache와 MySQL이 켜져 있어야 합니다)",
            badResponse: "서버가 예상치 못한 응답을 보냈습니다.\nhttp://localhost/SeoulMate/diagnostico.php 에서 누락된 항목을 확인하세요.",
            wrongPass: "비밀번호가 올바르지 않습니다. 접근이 거부되었습니다.",
            tooMany: "시도 횟수가 너무 많습니다. 1분 후에 다시 시도하세요.",
            noTable: "'admins' 테이블이 없습니다. phpMyAdmin에서 schema.sql을 가져오세요.",
            checkDiag: "확인: http://localhost/SeoulMate/diagnostico.php",
            noConn: "서버에 연결할 수 없습니다.\n1) XAMPP에서 Apache와 MySQL을 켜세요.\n2) http://localhost/SeoulMate/index.html 주소로 접속하세요.\n3) http://localhost/SeoulMate/diagnostico.php 를 확인하세요.",

            // ---- 메뉴 ----
            menuTitle: "서울메이트 - 한국 메뉴",
            moreMenu: "✨ 메뉴 더보기",
            soldOut: "품절",
            fbName: "서울메이트 공식",
            cartItems: "{n}개 상품",
            each: "개당",
            mesaWord: "테이블",
            errSendOrder: "주문을 전송할 수 없습니다: {m}",
            errConn: "서버에 연결할 수 없습니다. 직원에게 알려주세요.",
            errNoMesa: "주문하려면 테이블의 QR 코드를 스캔해 주세요.",
            errRating: "평가를 전송할 수 없습니다: {m}",
            errUnknown: "알 수 없는 오류",
            onlyLetters: "⚠️ 문자(알파벳과 악센트)만 입력할 수 있습니다 (숫자/기호 불가).",
            maxChars: "⚠️ 최대 100자까지 입력할 수 있습니다.",
            cmtErrOnly: "⚠️ 오류: 문자(알파벳과 악센트)만 입력할 수 있습니다 (숫자/기호 불가).",
            cmtEmpty: "⚠️ 보내기 전에 의견을 작성해주세요.",
            cmtOk: "✅ 메시지가 성공적으로 전송되었습니다!",
            cmtFail: "⚠️ 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.",
            p1Name: "클래식 골드", p1Desc: "원하는 속재료를 고를 수 있는 전통 핫도그, 바삭한 빵가루 코팅.",
            p2Name: "포테이토 봄", p2Desc: "원하는 속재료에 황금빛 감자 조각을 입힌 핫도그.",
            p3Name: "크리스피 라면", p3Desc: "원하는 속재료에 바삭한 라면 튀김옷을 입힌 핫도그.",
            p4Name: "핫 치토", p4Desc: "원하는 속재료에 빵가루를 입히고 플래밍 핫 치토스를 뿌린 핫도그.",
            p5Name: "교자", p5Desc: "찐 다음 팬에 구워낸 일본/한국식 만두.",
            p6Name: "비빔밥", p6Desc: "볶은 채소와 고기, 한국식 고추장 소스를 올린 덮밥.",
            p7Name: "김치", p7Desc: "양념한 매콤한 발효 배추로 만든 전통 반찬.",
            p8Name: "블랙 벨벳", p8Desc: "달콤한 춘장 소스의 한국식 면 요리 (짜장면).",
            p9Name: "치즈 라면", p9Desc: "녹인 치즈와 쪽파를 더한 크리미한 라면.",
            p10Name: "레드 타이드", p10Desc: "해산물과 향신료를 넣은 매운 한국식 라면.",
            p11Name: "화채", p11Desc: "과일과 연유를 넣은 시원한 전통 디저트 음료.",
            p12Name: "소주", p12Desc: "한국의 전통 증류주.",
            p13Name: "한라봉", p13Desc: "제주 한라봉으로 만든 상큼한 시트러스 음료.",
            p14Name: "바나나우유 커피", p14Desc: "클래식 한국 바나나우유를 더한 에스프레소 커피.",
            p15Name: "달고나 커피", p15Desc: "부드러운 차가운 우유 위에 올린 거품 커피.",
            p16Name: "인절미 라떼", p16Desc: "볶은 콩가루와 쌀의 풍미가 나는 크리미한 라떼.",
            p17Name: "빼빼로", p17Desc: "바삭한 초콜릿을 입힌 막대 과자.",
            p18Name: "마이쮸", p18Desc: "과일 맛의 부드러운 한국식 젤리 캔디.",
            p19Name: "봉지 라면", p19Desc: "전통 한국식 봉지 라면.",

            // ---- 관리자 (Administrador) ----
            aTitle: "서울메이트 - 관리자 패널",
            aDashboard: "대시보드", aOrders: "주문", aMessages: "메시지 및 문의",
            aMenu: "메뉴 관리", aOptions: "재료 및 추가 옵션", aLogout: "로그아웃",
            aPanel: "제어판", aDate: "오늘 날짜:", aThemeTitle: "라이트 / 다크 모드 전환",
            aSummary: "일일 요약", aCloseShift: "근무 / 영업일 마감",
            aStatOrders: "이번 근무 주문", aStatSales: "이번 근무 매출", aStatMsgs: "새 메시지",
            aStatRating: "평균 평점", aNoData: "데이터 없음", aRatingsCount: "건의 평가",
            aStatLowStock: "재고 부족 메뉴", aRecentRatings: "최근 평가",
            aThDate: "날짜", aThTable: "테이블", aThStars: "별점", aThComment: "의견",
            aNoRatings: "아직 평가가 없습니다.",
            aOrdersTitle: "근무 주문 관리",
            aAll: "전체", aPending: "대기 중", aPreparingF: "준비 중", aCompletedF: "완료",
            aThOrderId: "주문 번호", aThClient: "고객", aThDishes: "메뉴", aThTotal: "합계",
            aThStatus: "상태", aThActions: "작업",
            aNoOrders: "이번 근무에는 주문이 없습니다.",
            aTitlePreparing: "준비 중", aTitleComplete: "완료 처리",
            aMsgTitle: "메시지 및 문의함", aMsgsBtn: "메시지", aRatingsBtn: "⭐ 평가",
            aNoMsgs: "아직 메시지나 의견이 없습니다.", aRatingTag: "⭐ 평가",
            aMarkReadTitle: "읽음으로 표시", aReadBtn: "읽음", aDeleteTitle: "삭제",
            aMenuTitle: "메뉴 항목 및 재고 (MySQL)", aNewDish: "새 메뉴",
            aHiddenTag: " · 숨김", aStockAvail: "재고:", aUnits: "개",
            aEditBtn: "수정", aHideFromMenu: "메뉴에서 숨기기", aShowInMenu: "메뉴에 표시",
            aOptTitle: "재료, 속재료 및 추가 옵션", aAllProducts: "모든 상품", aNewOpt: "새 옵션",
            aThProduct: "상품", aThType: "유형", aThOption: "옵션", aThPrice: "가격",
            aVisible: "표시 중", aHiddenF: "숨김",
            aNoOpts: "옵션이 없습니다. schema.sql을 가져오거나 \"새 옵션\"으로 추가하세요.",
            aEditTitle: "수정", aHideTitle: "숨기기", aShowTitle: "표시",
            aModalAddDish: "메뉴에 새 요리 추가", aEditDish: "요리 #{n} 수정",
            aDishName: "요리 이름:", aDishNamePh: "예: 스페셜 떡볶이",
            aDishPrice: "가격 (MXN):", aDishPricePh: "예: 95", aStockLbl: "재고:",
            aCategory: "카테고리:", aDesc: "설명:", aDescPh: "요리에 대한 간단한 설명...",
            aCancel: "취소", aSaveDish: "요리 저장", aSave: "저장",
            aNewOptTitle: "새 옵션", aEditOptTitle: "옵션 수정",
            aProductLbl: "상품:", aTypeLbl: "유형:",
            aTRelleno: "기본 속재료 (필수, 하나 선택)", aTProteina: "단백질 (하나 선택)",
            aTSabor: "맛 / 종류 (하나 선택)", aTQuitar: "제외할 재료 / 조정",
            aTExtra: "추가 (+ 가격)",
            aOptName: "옵션 이름:", aOptNamePh: "예: 케첩 제외", aExtraPrice: "추가 가격 (MXN):",
            aConfirmShift: "근무를 마감합니다. 현재 주문은 보관되고 메시지는 읽음으로 표시됩니다. 계속할까요?",
            aErrUpdate: "주문을 업데이트할 수 없습니다",
            aErrShift: "근무를 마감할 수 없습니다",
            aErr: "오류",
            aConfirmDelMsg: "이 메시지를 완전히 삭제할까요?",
            aFillDish: "이름, 가격(0보다 큼), 올바른 재고를 입력하세요.",
            aErrSaveDish: "요리를 저장할 수 없습니다",
            aTypeName: "옵션 이름을 입력하세요.",
            aNegPrice: "가격은 음수일 수 없습니다.",
            aErrSaveOpt: "옵션을 저장할 수 없습니다",
            aConfirmDelOpt: "이 옵션을 완전히 삭제할까요?",
            aInventory: "재고",
            aNeedSchema: "재료별 재고 기능을 켜려면 schema.sql을 가져와야 합니다 (diagnostico.php를 열고 \"Importar schema.sql ahora\" 버튼을 누르세요).",
            aAlertOutProd: "⚠️ 품절된 메뉴 (고객에게 메뉴에서 \"품절\"로 표시됩니다):",
            aAlertOutIng: "재고가 없는 재료:",
            aSeeInventory: "재고 확인 및 보충 →",
            aAlertLowIng: "곧 떨어지는 재료:",
            aStatLowIng: "보충이 필요한 재료",
            aSoldOut: "품절",
            aServings: "만들 수 있는 수량:",
            aLimiting: "가장 먼저 떨어지는 재료:",
            aNoRecipe: "기본 레시피 없음: 수동 재고를 사용합니다 (또는 재료에 연결된 맛/속재료).",
            aRecipeBtn: "레시피",
            aRecipeBtnTitle: "이 메뉴에 사용되는 재료",
            aInvTitle: "재료 재고",
            aNewIng: "새 재료",
            aInvNote: "주문이 들어올 때마다 메뉴 레시피의 재료(고객이 고른 속재료·맛·추가 옵션의 재료 포함)가 자동으로 차감됩니다. 재료가 0이 되면 그 재료가 필요한 메뉴는 품절로 표시됩니다.",
            aThIngredient: "재료",
            aThStockLeft: "남은 수량",
            aThMin: "최소 수량",
            aNoIngs: "재료가 없습니다. schema.sql을 가져오거나 \"새 재료\"로 추가하세요.",
            aStOut: "품절",
            aStLow: "재고 부족",
            aStOk: "충분",
            aAddStockTitle: "재고 추가",
            aThConsumes: "사용 / 제외",
            aAddIngRow: "재료 추가",
            aIngName: "재료 이름:",
            aIngNamePh: "예: 모짜렐라 치즈",
            aIngUnit: "단위:",
            aUnitPza: "개 (pza)",
            aUnitG: "그램 (g)",
            aUnitMl: "밀리리터 (ml)",
            aIngStock: "현재 재고:",
            aIngMin: "알림 기준 (최소 수량):",
            aRecipeHint: "이 메뉴 1개를 만들 때 사용되는 재료입니다. 고객이 고른 속재료·맛·추가 옵션은 별도로 차감됩니다 (\"재료 및 추가 옵션\" 탭).",
            aEditIngTitle: "재료 수정",
            aFillIng: "올바른 이름과 수량(0 이상)을 입력하세요.",
            aAddStockPrompt: "{n}: 추가할 수량 ({u})",
            aConfirmDelIng: "이 재료를 삭제할까요? 레시피와 옵션에서도 제거됩니다.",
            aErrSaveIng: "재료를 저장할 수 없습니다",
            aErrSaveRecipe: "레시피를 저장할 수 없습니다",
            aRecipeTitle: "{n}의 레시피",
            aStockHint: "레시피가 없는 메뉴에만 사용됩니다. 레시피가 있으면 재료에서 재고가 계산됩니다.",
            aOptIngsUse: "이 옵션이 사용하는 재료:",
            aOptIngsSkip: "이 옵션을 고르면 차감하지 않는 재료:",
            aQty: "수량",
            aNoIngsYet: "먼저 \"재고\" 탭에서 재료를 추가하세요.",
            soldOutMsg: "죄송합니다. {n}은(는) 현재 품절입니다.",
            onlyLeftMsg: "{n}은(는) {q}개만 남았습니다."
        }
    };

    /* ----------------------------------------------------------------------
       2) DICCIONARIO DE DATOS (lo que viene de la base de datos, en español)
       Si falta un idioma, se deja el texto original.
       Los platos/opciones que el administrador cree con nombres nuevos se
       muestran tal como se escribieron (no hay forma de traducirlos sin un
       servicio externo); para traducirlos hay que añadirlos aquí.
       ---------------------------------------------------------------------- */
    var DYN = {
        // Platillos
        'Classic Gold': { ko: '클래식 골드' }, 'Potato Bomb': { ko: '포테이토 봄' },
        'Krispy Ramen': { ko: '크리스피 라면' }, 'Hot Cheeto': { ko: '핫 치토' },
        'Gyozas': { ko: '교자' }, 'Bibimbap': { ko: '비빔밥' }, 'Kimchi': { ko: '김치' },
        'Black Velvet': { ko: '블랙 벨벳' }, 'Cheese Ramen': { ko: '치즈 라면' }, 'Red Tide': { ko: '레드 타이드' },
        'Hwachae': { ko: '화채' }, 'Soju': { ko: '소주' }, 'Hallabong': { ko: '한라봉' },
        'Banana Milk Coffee': { ko: '바나나우유 커피' }, 'Dalgona Coffee': { ko: '달고나 커피' },
        'Injeolmi Latte': { ko: '인절미 라떼' }, 'Pepero': { ko: '빼빼로' }, 'My Chew': { ko: '마이쮸' },
        'Ramen Packet': { ko: '봉지 라면' },

        // Ingredientes (inventario)
        'Palito de madera': { en: 'Wooden stick', ko: '나무 꼬치' },
        'Masa para banderilla': { en: 'Corn dog batter', ko: '핫도그 반죽' },
        'Panko': { en: 'Panko', ko: '빵가루' },
        'Mayonesa': { en: 'Mayonnaise', ko: '마요네즈' },
        'Ketchup': { en: 'Ketchup', ko: '케첩' },
        'Azúcar': { en: 'Sugar', ko: '설탕' },
        'Papa en cubos': { en: 'Diced potato', ko: '깍둑썰기 감자' },
        'Paquete de ramen': { en: 'Ramen packet', ko: '라면 봉지' },
        'Cheetos Flamin\' Hot': { en: 'Flamin\' Hot Cheetos', ko: '플레이밍 핫 치토스' },
        'Queso Cheddar': { en: 'Cheddar cheese', ko: '체다 치즈' },
        'Salsa de queso Flamin\' Hot': { en: 'Flamin\' Hot cheese sauce', ko: '플레이밍 핫 치즈 소스' },
        'Gyoza': { en: 'Gyoza', ko: '교자' },
        'Arroz': { en: 'Rice', ko: '쌀밥' },
        'Carne de res marinada': { en: 'Marinated beef', ko: '양념 소고기' },
        'Pollo teriyaki': { en: 'Teriyaki chicken', ko: '데리야끼 치킨' },
        'Tofu': { en: 'Tofu', ko: '두부' },
        'Huevo': { en: 'Egg', ko: '계란' },
        'Verduras salteadas': { en: 'Sautéed vegetables', ko: '볶음 채소' },
        'Gochujang': { en: 'Gochujang', ko: '고추장' },
        'Ajonjolí': { en: 'Sesame seeds', ko: '참깨' },
        'Salsa Jajangmyeon': { en: 'Jajangmyeon sauce', ko: '짜장 소스' },
        'Caldo': { en: 'Broth', ko: '육수' },
        'Queso americano': { en: 'American cheese', ko: '아메리칸 치즈' },
        'Mariscos': { en: 'Seafood', ko: '해산물' },
        'Fruta mixta': { en: 'Mixed fruit', ko: '모둠 과일' },
        'Leche condensada': { en: 'Condensed milk', ko: '연유' },
        'Perlas de tapioca': { en: 'Tapioca pearls', ko: '타피오카 펄' },
        'Popping boba': { en: 'Popping boba', ko: '팝핑 보바' },
        'Hielo': { en: 'Ice', ko: '얼음' },
        'Vaso con tapa': { en: 'Cup with lid', ko: '뚜껑 있는 컵' },
        'Lata de Sprite': { en: 'Can of Sprite', ko: '스프라이트 캔' },
        'Jugo de mandarina': { en: 'Mandarin juice', ko: '귤 주스' },
        'Café molido': { en: 'Ground coffee', ko: '원두 가루' },
        'Café instantáneo': { en: 'Instant coffee', ko: '인스턴트 커피' },
        'Leche': { en: 'Milk', ko: '우유' },
        'Leche de banana': { en: 'Banana milk', ko: '바나나 우유' },
        'Harina de soya': { en: 'Soybean flour', ko: '콩가루' },
        'Mochi injeolmi': { en: 'Injeolmi mochi', ko: '인절미 모찌' },
        'Ramen Shin Ramyun': { en: 'Shin Ramyun ramen', ko: '신라면' },
        'Ramen Buldak Carbonara': { en: 'Buldak Carbonara ramen', ko: '까르보 불닭볶음면' },
        'Empaque para regalo': { en: 'Gift packaging', ko: '선물 포장' },

        // Categorías
        'Banderillas Coreanas': { en: 'Korean Corndogs', ko: '한국식 핫도그' },
        'Platillos Tradicionales': { en: 'Traditional Dishes', ko: '전통 요리' },
        'Estación del Ramen': { en: 'Ramen Station', ko: '라면 스테이션' },
        'Bebidas Asiáticas': { en: 'Asian Drinks', ko: '아시안 음료' },
        'Seoul Café': { ko: '서울 카페' }, 'K-Snack': { ko: 'K-스낵' },
        'General': { ko: '일반' },

        // Estados de pedido
        'Pendiente': { en: 'Pending', ko: '대기 중' },
        'Preparando': { en: 'Preparing', ko: '준비 중' },
        'Completado': { en: 'Completed', ko: '완료' },

        // Tipos de opción
        'Relleno base': { en: 'Base filling', ko: '기본 속재료' },
        'Proteína': { en: 'Protein', ko: '단백질' },
        'Sabor / Variedad': { en: 'Flavor / Variety', ko: '맛 / 종류' },
        'Ingrediente a eliminar': { en: 'Ingredient to remove', ko: '제외할 재료' },
        'Extra (+ precio)': { en: 'Extra (+ price)', ko: '추가 (+ 가격)' },

        // Varios
        'Mesa': { en: 'Table', ko: '테이블' },
        'Cliente': { en: 'Customer', ko: '고객' },
        'Anónimo': { en: 'Anonymous', ko: '익명' },
        'Nota:': { en: 'Note:', ko: '메모:' },
        'Sin detalle': { en: 'No details', ko: '세부 정보 없음' },

        // Rellenos / proteínas / sabores
        'Queso Mozzarella': { en: 'Mozzarella Cheese', ko: '모짜렐라 치즈' },
        'Salchicha': { en: 'Sausage', ko: '소시지' },
        'Mitad Queso / Mitad Salchicha': { en: 'Half Cheese / Half Sausage', ko: '반은 치즈 / 반은 소시지' },
        'Carne de Res Marinada': { en: 'Marinated Beef', ko: '양념 소고기' },
        'Pollo Teriyaki': { en: 'Teriyaki Chicken', ko: '데리야끼 치킨' },
        'Tofu a la Plancha': { en: 'Pan-seared Tofu', ko: '두부구이' },
        'Soju Original': { en: 'Original Soju', ko: '오리지널 소주' },
        'Soju de Toronja': { en: 'Grapefruit Soju', ko: '자몽 소주' },
        'Soju de Uva Verde': { en: 'Green Grape Soju', ko: '청포도 소주' },
        'Pepero Original': { en: 'Original Pepero', ko: '오리지널 빼빼로' },
        'Pepero Almond': { en: 'Almond Pepero', ko: '아몬드 빼빼로' },
        'My Chew Uva': { en: 'My Chew Grape', ko: '마이쮸 포도' },
        'My Chew Fresa': { en: 'My Chew Strawberry', ko: '마이쮸 딸기' },
        'Shin Ramyun': { ko: '신라면' },
        'Buldak Carbonara': { ko: '불닭 까르보나라' },

        // Ingredientes a eliminar
        'Sin Panko crujiente': { en: 'No crispy panko', ko: '바삭한 빵가루 제외' },
        'Sin Mayonesa': { en: 'No mayonnaise', ko: '마요네즈 제외' },
        'Sin Ketchup': { en: 'No ketchup', ko: '케첩 제외' },
        'Sin Azúcar espolvoreada': { en: 'No sprinkled sugar', ko: '뿌린 설탕 제외' },
        'Sin Trocitos de Papa': { en: 'No potato bits', ko: '감자 조각 제외' },
        'Sin Costra de Ramen Crujiente': { en: 'No crunchy ramen crust', ko: '바삭한 라면 튀김옷 제외' },
        "Sin Cheetos Flamin' Hot": { en: "No Flamin' Hot Cheetos", ko: '플래밍 핫 치토스 제외' },
        'Sin Sellado a la Plancha': { en: 'No pan-seared finish', ko: '팬 구이 마무리 제외' },
        'Sin Huevo Frito': { en: 'No fried egg', ko: '계란프라이 제외' },
        'Sin Semillas de Ajonjolí': { en: 'No sesame seeds', ko: '참깨 제외' },
        'Sin Salsa Jajangmyeon': { en: 'No jajangmyeon sauce', ko: '짜장 소스 제외' },
        'Sin Toque de Queso Fundido': { en: 'No melted cheese touch', ko: '녹인 치즈 제외' },
        'Sin Mariscos': { en: 'No seafood', ko: '해산물 제외' },
        'Sin Leche Condensada': { en: 'No condensed milk', ko: '연유 제외' },
        'Sin Hielo': { en: 'No ice', ko: '얼음 제외' },
        'Sin Leche de Banana': { en: 'No banana milk', ko: '바나나우유 제외' },
        'Sin Espuma Dalgona': { en: 'No dalgona foam', ko: '달고나 거품 제외' },
        'Sin Harina de Soya': { en: 'No soy flour', ko: '콩가루 제외' },

        // Extras
        'Aderezo Spicy Mayo': { en: 'Spicy Mayo dressing', ko: '스파이시 마요 드레싱' },
        'Extra Queso Cheddar Fundido': { en: 'Extra melted cheddar', ko: '녹인 체다 치즈 추가' },
        'Porción Extra de Papas Cubierta': { en: 'Extra potato coating portion', ko: '감자 코팅 추가' },
        'Extra Queso Mozzarella Gratinado': { en: 'Extra gratinated mozzarella', ko: '그라탱 모짜렐라 추가' },
        "Salsa de Queso Flamin' Hot Extra": { en: "Extra Flamin' Hot cheese sauce", ko: '플래밍 핫 치즈 소스 추가' },
        'Orden de 3 Gyozas Extras': { en: 'Extra order of 3 gyozas', ko: '교자 3개 추가' },
        'Extra Carne Marinada': { en: 'Extra marinated beef', ko: '양념 고기 추가' },
        'Porción Extra de Kimchi (150g)': { en: 'Extra portion of kimchi (150g)', ko: '김치 추가 (150g)' },
        'Huevo Nitamago Marinado': { en: 'Marinated nitamago egg', ko: '니타마고 양념 계란' },
        'Rebanada Extra de Queso Americano': { en: 'Extra slice of American cheese', ko: '아메리칸 치즈 한 장 추가' },
        'Mejillones y Camarones Extras': { en: 'Extra mussels and shrimp', ko: '홍합과 새우 추가' },
        'Perlas de Boba / Tapioca': { en: 'Boba / tapioca pearls', ko: '보바 / 타피오카 펄' },
        'Lata de Sprite para Mezclar': { en: 'Can of Sprite for mixing', ko: '믹서용 스프라이트 캔' },
        'Topping de Popping Boba': { en: 'Popping boba topping', ko: '팝핑 보바 토핑' },
        'Shot Extra de Café Espresso': { en: 'Extra espresso shot', ko: '에스프레소 샷 추가' },
        'Capa Extra de Espuma Dalgona': { en: 'Extra layer of dalgona foam', ko: '달고나 거품 추가' },
        'Mochi Mini Injeolmi': { en: 'Mini injeolmi mochi', ko: '미니 인절미 모찌' },
        'Empaque para Regalo': { en: 'Gift packaging', ko: '선물 포장' },
        'Servicio de Cocina con Huevo y Queso': { en: 'Kitchen service with egg and cheese', ko: '계란과 치즈 조리 서비스' }
    };

    /* Mensajes de error que llegan del servidor (PHP) siempre en español */
    var SRV = [
        [/^Error del servidor: (.*)$/, { en: 'Server error: $1', ko: '서버 오류: $1' }],
        [/^Método no permitido$/, { en: 'Method not allowed', ko: '허용되지 않는 요청 방식입니다' }],
        [/^El carrito está vacío o es inválido$/, { en: 'The cart is empty or invalid', ko: '장바구니가 비어 있거나 올바르지 않습니다' }],
        [/^Producto o cantidad inválidos$/, { en: 'Invalid product or quantity', ko: '상품 또는 수량이 올바르지 않습니다' }],
        [/^El producto #(\d+) no está disponible$/, { en: 'Product #$1 is not available', ko: '상품 #$1 은(는) 현재 이용할 수 없습니다' }],
        [/^Stock insuficiente de (.*)$/, { en: 'Insufficient stock of $1', ko: '$1 재고가 부족합니다' }],
        [/^El extra "(.*)" ya no está disponible$/, { en: 'The extra "$1" is no longer available', ko: '추가 옵션 "$1" 은(는) 더 이상 이용할 수 없습니다' }],
        [/^El mensaje está vacío$/, { en: 'The message is empty', ko: '메시지가 비어 있습니다' }],
        [/^Elige de 1 a 5 estrellas$/, { en: 'Choose 1 to 5 stars', ko: '별 1~5개를 선택하세요' }],
        [/^Este pedido ya fue calificado$/, { en: 'This order has already been rated', ko: '이 주문은 이미 평가되었습니다' }],
        [/^Datos inválidos$/, { en: 'Invalid data', ko: '잘못된 데이터입니다' }],
        [/^Nombre, precio \(> 0\) y stock \(≥ 0\) son obligatorios$/, { en: 'Name, price (> 0) and stock (≥ 0) are required', ko: '이름, 가격(0보다 큼), 재고(0 이상)는 필수입니다' }],
        [/^ID inválido$/, { en: 'Invalid ID', ko: '잘못된 ID입니다' }],
        [/^Producto, tipo y nombre son obligatorios \(precio ≥ 0\)$/, { en: 'Product, type and name are required (price ≥ 0)', ko: '상품, 유형, 이름은 필수입니다 (가격 0 이상)' }],
        [/^Esa opción ya existe para ese producto$/, { en: 'That option already exists for this product', ko: '이 상품에 이미 있는 옵션입니다' }],
        [/^Acción no válida$/, { en: 'Invalid action', ko: '잘못된 작업입니다' }],
        [/^Sesión de administrador requerida$/, { en: 'Administrator session required', ko: '관리자 로그인이 필요합니다' }],
        [/^Sesión caducada$/, { en: 'Session expired', ko: '세션이 만료되었습니다' }],
        [/^Nombre y cantidades \(≥ 0\) son obligatorios$/, { en: 'Name and quantities (≥ 0) are required', ko: '이름과 수량(0 이상)은 필수입니다' }],
        [/^Ese ingrediente ya existe$/, { en: 'That ingredient already exists', ko: '이미 있는 재료입니다' }],
        [/^Error desconocido$/, { en: 'Unknown error', ko: '알 수 없는 오류' }]
    ];

    /* ----------------------------------------------------------------------
       3) MOTOR
       ---------------------------------------------------------------------- */
    var cur = 'es';
    try {
        var saved = localStorage.getItem(KEY);
        if (LANGS.indexOf(saved) !== -1) cur = saved;
    } catch (e) { /* sin localStorage: se queda en español */ }

    var callbacks = [];

    // Regex única con todas las frases del diccionario (la más larga primero)
    var dynKeys = Object.keys(DYN).sort(function (a, b) { return b.length - a.length; });
    var dynRegex = new RegExp(dynKeys.map(function (k) {
        return k.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    }).join('|'), 'g');

    function dyn(text, lang) {
        lang = lang || cur;
        if (text == null) return '';
        text = String(text);
        if (lang === 'es') return text;
        return text.replace(dynRegex, function (m) {
            var e = DYN[m];
            return (e && e[lang]) ? e[lang] : m;
        });
    }

    function t(key, params, lang) {
        lang = lang || cur;
        var s = (PACK[lang] && PACK[lang][key] !== undefined) ? PACK[lang][key]
              : (PACK.es[key] !== undefined ? PACK.es[key] : key);
        if (params) {
            Object.keys(params).forEach(function (p) { s = s.split('{' + p + '}').join(params[p]); });
        }
        return s;
    }

    function srv(msg, lang) {
        lang = lang || cur;
        if (msg == null) return '';
        msg = String(msg);
        if (lang === 'es') return msg;
        for (var i = 0; i < SRV.length; i++) {
            var m = msg.match(SRV[i][0]);
            if (m && SRV[i][1][lang]) {
                var out = SRV[i][1][lang].replace(/\$(\d)/g, function (_, n) { return m[+n] || ''; });
                return dyn(out, lang);
            }
        }
        return dyn(msg, lang);
    }

    // Guarda el texto original (español) de cada elemento la primera vez que se ve
    function orig(el, slot, getter) {
        var o = el.__smo || (el.__smo = {});
        if (o[slot] === undefined) o[slot] = getter();
        return o[slot];
    }

    function lookup(lang, key) {
        var p = PACK[lang];
        return (p && p[key] !== undefined) ? p[key] : undefined;
    }

    function apply(root) {
        var lang = cur;
        var scope = root || document;
        document.documentElement.lang = lang;

        scope.querySelectorAll('[data-i18n]').forEach(function (el) {
            var o = orig(el, 't', function () { return el.textContent; });
            var v = lookup(lang, el.getAttribute('data-i18n'));
            el.textContent = (lang === 'es' || v === undefined) ? o : v;
        });
        scope.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var o = orig(el, 'h', function () { return el.innerHTML; });
            var v = lookup(lang, el.getAttribute('data-i18n-html'));
            el.innerHTML = (lang === 'es' || v === undefined) ? o : v;
        });
        scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var o = orig(el, 'p', function () { return el.getAttribute('placeholder') || ''; });
            var v = lookup(lang, el.getAttribute('data-i18n-placeholder'));
            el.setAttribute('placeholder', (lang === 'es' || v === undefined) ? o : v);
        });
        scope.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            var o = orig(el, 'ti', function () { return el.getAttribute('title') || ''; });
            var v = lookup(lang, el.getAttribute('data-i18n-title'));
            el.setAttribute('title', (lang === 'es' || v === undefined) ? o : v);
        });
        scope.querySelectorAll('[data-dyn]').forEach(function (el) {
            var o = orig(el, 'd', function () { return el.textContent; });
            el.textContent = dyn(o, lang);
        });
        document.querySelectorAll('#lang-selector, .sm-lang').forEach(function (s) { s.value = lang; });
    }

    function setLang(lang) {
        if (LANGS.indexOf(lang) === -1) return;
        cur = lang;
        try { localStorage.setItem(KEY, lang); } catch (e) {}
        apply();
        callbacks.forEach(function (fn) { try { fn(lang); } catch (e) { console.error(e); } });
    }

    // Si cambian el idioma en otra pestaña (por ejemplo la portada), esta se actualiza sola
    window.addEventListener('storage', function (ev) {
        if (ev.key === KEY && LANGS.indexOf(ev.newValue) !== -1 && ev.newValue !== cur) setLang(ev.newValue);
    });

    window.SM = {
        lang: function () { return cur; },
        t: t,
        dyn: dyn,
        srv: srv,
        apply: apply,
        setLang: setLang,
        dict: function (lang) { return PACK[lang] || {}; },
        // Registra textos extra (por ejemplo los que ya existían en carrito.js) sin pisar los de este archivo
        extend: function (lang, obj) {
            if (!PACK[lang]) return;
            Object.keys(obj).forEach(function (k) { if (PACK[lang][k] === undefined) PACK[lang][k] = obj[k]; });
        },
        onChange: function (fn) { callbacks.push(fn); }
    };

    // Aplicar de inmediato (el script va al final del <body>) y de nuevo al terminar de cargar
    if (document.body) apply();
    document.addEventListener('DOMContentLoaded', function () { apply(); });
})();

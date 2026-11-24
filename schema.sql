-- SeoulMate: ejecutar completo en phpMyAdmin (pestaña SQL). Sirve para base nueva o ya existente (XAMPP / MariaDB).
CREATE DATABASE IF NOT EXISTS seoulmate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE seoulmate_db;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 50
);
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mesa VARCHAR(30) NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL
);
CREATE TABLE IF NOT EXISTS mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- Columnas nuevas (si ya existen, se omiten)
ALTER TABLE productos       ADD COLUMN IF NOT EXISTS categoria   VARCHAR(60)  NOT NULL DEFAULT 'General';
ALTER TABLE productos       ADD COLUMN IF NOT EXISTS descripcion VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE productos       ADD COLUMN IF NOT EXISTS activo      TINYINT(1)   NOT NULL DEFAULT 1;
ALTER TABLE pedidos         ADD COLUMN IF NOT EXISTS archivado   TINYINT(1)   NOT NULL DEFAULT 0;
ALTER TABLE detalle_pedido  ADD COLUMN IF NOT EXISTS notas           VARCHAR(255)  NOT NULL DEFAULT '';
ALTER TABLE detalle_pedido  ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE mensajes        ADD COLUMN IF NOT EXISTS leido       TINYINT(1)   NOT NULL DEFAULT 0;

-- Productos del menú: los IDs 1-19 deben coincidir con Js/carrito.js
INSERT INTO productos (id, nombre, precio, categoria) VALUES
(1,'Classic Gold',65,'Banderillas Coreanas'),(2,'Potato Bomb',85,'Banderillas Coreanas'),
(3,'Krispy Ramen',75,'Banderillas Coreanas'),(4,'Hot Cheeto',80,'Banderillas Coreanas'),
(5,'Gyozas',90,'Platillos Tradicionales'),(6,'Bibimbap',135,'Platillos Tradicionales'),(7,'Kimchi',45,'Platillos Tradicionales'),
(8,'Black Velvet',110,'Estación del Ramen'),(9,'Cheese Ramen',95,'Estación del Ramen'),(10,'Red Tide',105,'Estación del Ramen'),
(11,'Hwachae',85,'Bebidas Asiáticas'),(12,'Soju',120,'Bebidas Asiáticas'),(13,'Hallabong',65,'Bebidas Asiáticas'),
(14,'Banana Milk Coffee',70,'Seoul Café'),(15,'Dalgona Coffee',75,'Seoul Café'),(16,'Injeolmi Latte',80,'Seoul Café'),
(17,'Pepero',35,'K-Snack'),(18,'My Chew',25,'K-Snack'),(19,'Ramen Packet',45,'K-Snack')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), categoria=VALUES(categoria);

-- Administrador: usuario "admin", contraseña inicial "Cha&Azul" (cámbiala, ver LEEME.txt)
INSERT INTO admins (usuario, password_hash) VALUES ('admin', '$2y$10$RvLgrr830s9oFB28NSOLU.3xKJ2QzImMwYqoJh8so0CcI3oH9YCUm')
ON DUPLICATE KEY UPDATE usuario=usuario;


-- ============================================================
-- Personalización de productos: rellenos, sabores, proteínas,
-- ingredientes a eliminar y extras (lo que sale en "Personalizar")
-- INSERT IGNORE + clave única => si una opción YA existe no se vuelve a insertar.
-- ============================================================
CREATE TABLE IF NOT EXISTS opciones_producto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,            -- relleno | proteina | sabor | quitar | extra
  nombre VARCHAR(120) NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_opcion (producto_id, tipo, nombre)
);
INSERT IGNORE INTO opciones_producto (producto_id, tipo, nombre, precio, orden) VALUES
(1,'relleno','Queso Mozzarella',0,0),
(1,'relleno','Salchicha',0,1),
(1,'relleno','Mitad Queso / Mitad Salchicha',0,2),
(1,'quitar','Sin Panko crujiente',0,0),
(1,'quitar','Sin Mayonesa',0,1),
(1,'quitar','Sin Ketchup',0,2),
(1,'quitar','Sin Azúcar espolvoreada',0,3),
(1,'extra','Aderezo Spicy Mayo',12,0),
(1,'extra','Extra Queso Cheddar Fundido',15,1),
(2,'relleno','Queso Mozzarella',0,0),
(2,'relleno','Salchicha',0,1),
(2,'quitar','Sin Trocitos de Papa',0,0),
(2,'extra','Porción Extra de Papas Cubierta',18,0),
(3,'relleno','Queso Mozzarella',0,0),
(3,'relleno','Salchicha',0,1),
(3,'quitar','Sin Costra de Ramen Crujiente',0,0),
(3,'extra','Extra Queso Mozzarella Gratinado',20,0),
(4,'relleno','Queso Mozzarella',0,0),
(4,'relleno','Salchicha',0,1),
(4,'quitar','Sin Cheetos Flamin'' Hot',0,0),
(4,'extra','Salsa de Queso Flamin'' Hot Extra',18,0),
(5,'quitar','Sin Sellado a la Plancha',0,0),
(5,'extra','Orden de 3 Gyozas Extras',45,0),
(6,'proteina','Carne de Res Marinada',0,0),
(6,'proteina','Pollo Teriyaki',0,1),
(6,'proteina','Tofu a la Plancha',0,2),
(6,'quitar','Sin Huevo Frito',0,0),
(6,'extra','Extra Carne Marinada',35,0),
(7,'quitar','Sin Semillas de Ajonjolí',0,0),
(7,'extra','Porción Extra de Kimchi (150g)',30,0),
(8,'quitar','Sin Salsa Jajangmyeon',0,0),
(8,'extra','Huevo Nitamago Marinado',15,0),
(9,'quitar','Sin Toque de Queso Fundido',0,0),
(9,'extra','Rebanada Extra de Queso Americano',12,0),
(10,'quitar','Sin Mariscos',0,0),
(10,'extra','Mejillones y Camarones Extras',40,0),
(11,'quitar','Sin Leche Condensada',0,0),
(11,'extra','Perlas de Boba / Tapioca',15,0),
(12,'sabor','Soju Original',0,0),
(12,'sabor','Soju de Toronja',0,1),
(12,'sabor','Soju de Uva Verde',0,2),
(12,'extra','Lata de Sprite para Mezclar',25,0),
(13,'quitar','Sin Hielo',0,0),
(13,'extra','Topping de Popping Boba',15,0),
(14,'quitar','Sin Leche de Banana',0,0),
(14,'extra','Shot Extra de Café Espresso',15,0),
(15,'quitar','Sin Espuma Dalgona',0,0),
(15,'extra','Capa Extra de Espuma Dalgona',15,0),
(16,'quitar','Sin Harina de Soya',0,0),
(16,'extra','Mochi Mini Injeolmi',18,0),
(17,'sabor','Pepero Original',0,0),
(17,'sabor','Pepero Almond',0,1),
(17,'extra','Empaque para Regalo',10,0),
(18,'sabor','My Chew Uva',0,0),
(18,'sabor','My Chew Fresa',0,1),
(18,'extra','Empaque para Regalo',10,0),
(19,'sabor','Shin Ramyun',0,0),
(19,'sabor','Buldak Carbonara',0,1),
(19,'extra','Servicio de Cocina con Huevo y Queso',25,0);


-- ============================================================
-- Calificaciones de los clientes (aparecen tras confirmar el pedido)
-- ============================================================
CREATE TABLE IF NOT EXISTS calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NULL,
  estrellas TINYINT NOT NULL,
  comentario VARCHAR(255) NOT NULL DEFAULT '',
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_calif_pedido (pedido_id)
);

ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS leido TINYINT(1) NOT NULL DEFAULT 0;


-- ============================================================
-- INVENTARIO POR INGREDIENTES
--  ingredientes        : existencias reales (g, ml, pza...) con mínimo para avisar
--  recetas             : qué ingredientes (y cuánto) consume UNA unidad de cada producto
--  opcion_ingredientes : lo que consume una opción de "Personalizar"
--                        relleno/proteína/sabor/extra -> SUMA ese ingrediente
--                        quitar ("Sin ...")           -> NO descuenta ese ingrediente de la receta
-- Todo es INSERT IGNORE: volver a importar este archivo NO borra tus existencias ni tus cambios.
-- Las cantidades y existencias iniciales son ESTIMADAS: ajústalas en Administrador > Inventario / Gestión de Menú.
-- ============================================================
CREATE TABLE IF NOT EXISTS ingredientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  unidad VARCHAR(20) NOT NULL DEFAULT 'pza',
  stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  stock_minimo DECIMAL(12,3) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_ingrediente (nombre)
);
CREATE TABLE IF NOT EXISTS recetas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ingrediente_id INT NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_receta (producto_id, ingrediente_id)
);
CREATE TABLE IF NOT EXISTS opcion_ingredientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  opcion_id INT NOT NULL,
  ingrediente_id INT NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_opcion_ing (opcion_id, ingrediente_id)
);

INSERT IGNORE INTO ingredientes (nombre, unidad, stock, stock_minimo) VALUES
('Salchicha','pza',60,10), ('Queso Mozzarella','g',3000,500), ('Palito de madera','pza',100,20),
('Masa para banderilla','g',5000,800), ('Panko','g',2000,300), ('Mayonesa','g',1500,300),
('Ketchup','g',1500,300), ('Azúcar','g',2000,300), ('Papa en cubos','g',4000,600),
('Paquete de ramen','pza',60,10), ('Cheetos Flamin'' Hot','g',1500,300), ('Queso Cheddar','g',1500,300),
('Aderezo Spicy Mayo','g',1000,200), ('Salsa de queso Flamin'' Hot','g',1500,300),
('Gyoza','pza',120,20), ('Arroz','g',6000,1000), ('Carne de res marinada','g',3000,500),
('Pollo teriyaki','g',3000,500), ('Tofu','g',2000,300), ('Huevo','pza',90,15),
('Verduras salteadas','g',3000,500), ('Gochujang','g',1000,200), ('Kimchi','g',5000,800),
('Ajonjolí','g',500,100), ('Salsa Jajangmyeon','g',1500,300), ('Caldo','ml',8000,1500),
('Queso americano','pza',80,15), ('Mariscos','g',2500,400), ('Fruta mixta','g',4000,600),
('Leche condensada','ml',3000,500), ('Perlas de tapioca','g',2000,300), ('Popping boba','g',1500,250),
('Hielo','g',20000,3000), ('Vaso con tapa','pza',200,30), ('Soju Original','pza',24,4),
('Soju de Toronja','pza',24,4), ('Soju de Uva Verde','pza',24,4), ('Lata de Sprite','pza',48,8),
('Jugo de mandarina','ml',5000,800), ('Café molido','g',2000,300), ('Café instantáneo','g',800,150),
('Leche','ml',10000,1500), ('Leche de banana','ml',6000,1000), ('Harina de soya','g',800,150),
('Mochi injeolmi','pza',60,10), ('Pepero Original','pza',40,8), ('Pepero Almond','pza',40,8),
('My Chew Uva','pza',60,10), ('My Chew Fresa','pza',60,10), ('Ramen Shin Ramyun','pza',40,8),
('Ramen Buldak Carbonara','pza',40,8), ('Empaque para regalo','pza',60,10);

-- Receta base de cada producto (por 1 unidad vendida)
INSERT IGNORE INTO recetas (producto_id, ingrediente_id, cantidad)
SELECT r.p, i.id, r.c FROM (
  SELECT 1 p,'Palito de madera' n,1 c UNION ALL SELECT 1,'Masa para banderilla',90 UNION ALL SELECT 1,'Panko',40
  UNION ALL SELECT 1,'Mayonesa',10 UNION ALL SELECT 1,'Ketchup',10 UNION ALL SELECT 1,'Azúcar',5
  UNION ALL SELECT 2,'Palito de madera',1 UNION ALL SELECT 2,'Masa para banderilla',90 UNION ALL SELECT 2,'Papa en cubos',60
  UNION ALL SELECT 2,'Mayonesa',10 UNION ALL SELECT 2,'Ketchup',10
  UNION ALL SELECT 3,'Palito de madera',1 UNION ALL SELECT 3,'Masa para banderilla',90 UNION ALL SELECT 3,'Paquete de ramen',0.5
  UNION ALL SELECT 3,'Mayonesa',10 UNION ALL SELECT 3,'Ketchup',10
  UNION ALL SELECT 4,'Palito de madera',1 UNION ALL SELECT 4,'Masa para banderilla',90 UNION ALL SELECT 4,'Cheetos Flamin'' Hot',40
  UNION ALL SELECT 4,'Mayonesa',10 UNION ALL SELECT 4,'Ketchup',10
  UNION ALL SELECT 5,'Gyoza',5
  UNION ALL SELECT 6,'Arroz',250 UNION ALL SELECT 6,'Verduras salteadas',120 UNION ALL SELECT 6,'Huevo',1
  UNION ALL SELECT 6,'Gochujang',20 UNION ALL SELECT 6,'Ajonjolí',3
  UNION ALL SELECT 7,'Kimchi',150 UNION ALL SELECT 7,'Ajonjolí',2
  UNION ALL SELECT 8,'Paquete de ramen',1 UNION ALL SELECT 8,'Salsa Jajangmyeon',60 UNION ALL SELECT 8,'Caldo',350
  UNION ALL SELECT 9,'Paquete de ramen',1 UNION ALL SELECT 9,'Caldo',350 UNION ALL SELECT 9,'Queso americano',2
  UNION ALL SELECT 10,'Paquete de ramen',1 UNION ALL SELECT 10,'Caldo',350 UNION ALL SELECT 10,'Mariscos',120
  UNION ALL SELECT 11,'Fruta mixta',150 UNION ALL SELECT 11,'Leche condensada',40 UNION ALL SELECT 11,'Hielo',150 UNION ALL SELECT 11,'Vaso con tapa',1
  UNION ALL SELECT 12,'Hielo',100
  UNION ALL SELECT 13,'Jugo de mandarina',250 UNION ALL SELECT 13,'Hielo',150 UNION ALL SELECT 13,'Vaso con tapa',1
  UNION ALL SELECT 14,'Café molido',18 UNION ALL SELECT 14,'Leche de banana',200 UNION ALL SELECT 14,'Hielo',100 UNION ALL SELECT 14,'Vaso con tapa',1
  UNION ALL SELECT 15,'Café instantáneo',12 UNION ALL SELECT 15,'Azúcar',12 UNION ALL SELECT 15,'Leche',200 UNION ALL SELECT 15,'Hielo',100 UNION ALL SELECT 15,'Vaso con tapa',1
  UNION ALL SELECT 16,'Café molido',18 UNION ALL SELECT 16,'Leche',220 UNION ALL SELECT 16,'Harina de soya',10 UNION ALL SELECT 16,'Vaso con tapa',1
) r JOIN ingredientes i ON i.nombre = r.n;

-- Lo que consume cada opción de "Personalizar" (se aplica a todos los productos que tengan esa opción)
INSERT IGNORE INTO opcion_ingredientes (opcion_id, ingrediente_id, cantidad)
SELECT o.id, i.id, m.c FROM (
  SELECT 'relleno' t,'Queso Mozzarella' o,'Queso Mozzarella' n,40 c
  UNION ALL SELECT 'relleno','Salchicha','Salchicha',1
  UNION ALL SELECT 'relleno','Mitad Queso / Mitad Salchicha','Queso Mozzarella',20
  UNION ALL SELECT 'relleno','Mitad Queso / Mitad Salchicha','Salchicha',0.5
  UNION ALL SELECT 'proteina','Carne de Res Marinada','Carne de res marinada',120
  UNION ALL SELECT 'proteina','Pollo Teriyaki','Pollo teriyaki',120
  UNION ALL SELECT 'proteina','Tofu a la Plancha','Tofu',120
  UNION ALL SELECT 'sabor','Soju Original','Soju Original',1
  UNION ALL SELECT 'sabor','Soju de Toronja','Soju de Toronja',1
  UNION ALL SELECT 'sabor','Soju de Uva Verde','Soju de Uva Verde',1
  UNION ALL SELECT 'sabor','Pepero Original','Pepero Original',1
  UNION ALL SELECT 'sabor','Pepero Almond','Pepero Almond',1
  UNION ALL SELECT 'sabor','My Chew Uva','My Chew Uva',1
  UNION ALL SELECT 'sabor','My Chew Fresa','My Chew Fresa',1
  UNION ALL SELECT 'sabor','Shin Ramyun','Ramen Shin Ramyun',1
  UNION ALL SELECT 'sabor','Buldak Carbonara','Ramen Buldak Carbonara',1
  UNION ALL SELECT 'extra','Aderezo Spicy Mayo','Aderezo Spicy Mayo',25
  UNION ALL SELECT 'extra','Extra Queso Cheddar Fundido','Queso Cheddar',30
  UNION ALL SELECT 'extra','Porción Extra de Papas Cubierta','Papa en cubos',60
  UNION ALL SELECT 'extra','Extra Queso Mozzarella Gratinado','Queso Mozzarella',40
  UNION ALL SELECT 'extra','Salsa de Queso Flamin'' Hot Extra','Salsa de queso Flamin'' Hot',30
  UNION ALL SELECT 'extra','Orden de 3 Gyozas Extras','Gyoza',3
  UNION ALL SELECT 'extra','Extra Carne Marinada','Carne de res marinada',80
  UNION ALL SELECT 'extra','Porción Extra de Kimchi (150g)','Kimchi',150
  UNION ALL SELECT 'extra','Huevo Nitamago Marinado','Huevo',1
  UNION ALL SELECT 'extra','Rebanada Extra de Queso Americano','Queso americano',1
  UNION ALL SELECT 'extra','Mejillones y Camarones Extras','Mariscos',100
  UNION ALL SELECT 'extra','Perlas de Boba / Tapioca','Perlas de tapioca',40
  UNION ALL SELECT 'extra','Lata de Sprite para Mezclar','Lata de Sprite',1
  UNION ALL SELECT 'extra','Topping de Popping Boba','Popping boba',30
  UNION ALL SELECT 'extra','Shot Extra de Café Espresso','Café molido',18
  UNION ALL SELECT 'extra','Capa Extra de Espuma Dalgona','Café instantáneo',12
  UNION ALL SELECT 'extra','Capa Extra de Espuma Dalgona','Azúcar',12
  UNION ALL SELECT 'extra','Mochi Mini Injeolmi','Mochi injeolmi',2
  UNION ALL SELECT 'extra','Empaque para Regalo','Empaque para regalo',1
  UNION ALL SELECT 'extra','Servicio de Cocina con Huevo y Queso','Huevo',1
  UNION ALL SELECT 'extra','Servicio de Cocina con Huevo y Queso','Queso americano',1
  UNION ALL SELECT 'quitar','Sin Panko crujiente','Panko',1
  UNION ALL SELECT 'quitar','Sin Mayonesa','Mayonesa',1
  UNION ALL SELECT 'quitar','Sin Ketchup','Ketchup',1
  UNION ALL SELECT 'quitar','Sin Azúcar espolvoreada','Azúcar',1
  UNION ALL SELECT 'quitar','Sin Trocitos de Papa','Papa en cubos',1
  UNION ALL SELECT 'quitar','Sin Costra de Ramen Crujiente','Paquete de ramen',1
  UNION ALL SELECT 'quitar','Sin Cheetos Flamin'' Hot','Cheetos Flamin'' Hot',1
  UNION ALL SELECT 'quitar','Sin Huevo Frito','Huevo',1
  UNION ALL SELECT 'quitar','Sin Semillas de Ajonjolí','Ajonjolí',1
  UNION ALL SELECT 'quitar','Sin Salsa Jajangmyeon','Salsa Jajangmyeon',1
  UNION ALL SELECT 'quitar','Sin Toque de Queso Fundido','Queso americano',1
  UNION ALL SELECT 'quitar','Sin Mariscos','Mariscos',1
  UNION ALL SELECT 'quitar','Sin Leche Condensada','Leche condensada',1
  UNION ALL SELECT 'quitar','Sin Hielo','Hielo',1
  UNION ALL SELECT 'quitar','Sin Leche de Banana','Leche de banana',1
  UNION ALL SELECT 'quitar','Sin Espuma Dalgona','Café instantáneo',1
  UNION ALL SELECT 'quitar','Sin Espuma Dalgona','Azúcar',1
  UNION ALL SELECT 'quitar','Sin Harina de Soya','Harina de soya',1
) m
JOIN opciones_producto o ON o.tipo = m.t AND o.nombre = m.o
JOIN ingredientes i ON i.nombre = m.n;

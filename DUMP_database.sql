-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: Sport
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `categorieName` varchar(100) NOT NULL,
  `categorieID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`categorieID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('Гантели',1),('Гири',2),('Блины',3),('Фитнес',4);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoriesandproducts`
--

DROP TABLE IF EXISTS `categoriesandproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoriesandproducts` (
  `categoriesandproductsID` int NOT NULL AUTO_INCREMENT,
  `categorieID` int NOT NULL,
  `productID` int NOT NULL,
  PRIMARY KEY (`categoriesandproductsID`,`categorieID`,`productID`),
  KEY `categoriesandproducts_products_FK` (`productID`),
  KEY `categoriesandproducts_categories_FK` (`categorieID`),
  CONSTRAINT `categoriesandproducts_categories_FK` FOREIGN KEY (`categorieID`) REFERENCES `categories` (`categorieID`),
  CONSTRAINT `categoriesandproducts_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesandproducts`
--

LOCK TABLES `categoriesandproducts` WRITE;
/*!40000 ALTER TABLE `categoriesandproducts` DISABLE KEYS */;
INSERT INTO `categoriesandproducts` VALUES (36,1,2),(37,4,2),(5,1,3),(6,1,4),(32,1,5),(8,1,6),(9,4,6),(33,1,7),(14,3,8),(15,3,9),(16,3,10),(17,3,11),(18,2,12),(19,2,13),(20,2,14),(21,2,15),(22,2,16),(23,2,17),(24,2,18),(25,4,19),(26,4,20),(27,4,21),(28,4,22),(29,4,23);
/*!40000 ALTER TABLE `categoriesandproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customerName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerEmail` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerID` int NOT NULL AUTO_INCREMENT,
  `customerThumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '/images/Avatars/Avatar2.jpg',
  `customerPassword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `customerRank` varchar(20) DEFAULT 'user',
  PRIMARY KEY (`customerID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('User','danil228lol12@mail.ru',2,'/images/Avatars/Avatar3.jpg','$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im','admin'),('PUPA','sbiktobirov@gmail.com',3,'/images/Avatars/Thumbnail_1.jpg','$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.','user'),('test','test@mail.ru',13,'/images/Avatars/Thumbnail_2.png','$2b$10$3adq0qU2ERtfS9UGam5dbO/E6AZtofnqR3BpHO4he1dKj86p/804.','user'),('van_dam_0','van_dam_0@mail.ru',14,'/images/Avatars/Avatar2.jpg','$2b$10$F8iOEtJpzQv/ekGLRMGAN..icED0M.VkAurj.Ox6AUsK24gwRIkyG','user'),('User_Looser','van_dam_1@mail.ru',15,'/images/Avatars/Avatar2.jpg','$2b$10$g3uPF3Ju54TjwE9DwJ.mFOAtSblfBGvUhHEXjGoQjAMcJoKRWcuH6','user'),('Perdole','123@ia.ru',16,'/images/Avatars/Avatar4.jpg','$2b$10$x4KldyOiX4Zgl58rMIs/ZOmpOlpOhCZkcNh0/l65qT4LaowgZ8.J.','user'),('123','123@mail.ru',17,'/images/Avatars/Avatar2.jpg','$2b$10$C0/WN7p.u2FGMhpOY09/KO8FZiCWNbg4dUHnhDnIuFr3EPGWRNTja','user');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_points`
--

DROP TABLE IF EXISTS `delivery_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_points` (
  `pointID` int NOT NULL AUTO_INCREMENT,
  `pointName` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `work_hours` varchar(100) DEFAULT 'Пн-Вс: 9:00-21:00',
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`pointID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_points`
--

LOCK TABLES `delivery_points` WRITE;
/*!40000 ALTER TABLE `delivery_points` DISABLE KEYS */;
INSERT INTO `delivery_points` VALUES (1,'Пункт выдачи №1','г. Москва, ул. Тверская, д. 1',55.75580000,37.61730000,'Пн-Вс: 9:00-21:00','+7 (495) 123-45-67',1),(2,'Пункт выдачи №2','г. Москва, ул. Ленина, д. 15',55.75220000,37.61560000,'Пн-Пт: 10:00-22:00, Сб-Вс: 10:00-20:00','+7 (495) 234-56-78',1),(3,'Пункт выдачи №3','г. Москва, пр. Мира, д. 50',55.78310000,37.61710000,'Пн-Вс: 8:00-22:00','+7 (495) 345-67-89',1);
/*!40000 ALTER TABLE `delivery_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `favoritesID` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `customerID` int NOT NULL,
  PRIMARY KEY (`favoritesID`,`customerID`,`productID`),
  KEY `favorites_products_FK` (`productID`),
  KEY `favorites_customers_FK` (`customerID`),
  CONSTRAINT `favorites_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  CONSTRAINT `favorites_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (7,5,2),(5,6,2),(6,7,2);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `orderItemID` int NOT NULL AUTO_INCREMENT,
  `orderID` int NOT NULL,
  `productID` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discountedPrice` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`orderItemID`),
  KEY `order_items_orders_FK` (`orderID`),
  KEY `order_items_products_FK` (`productID`),
  KEY `idx_order_product` (`orderID`,`productID`),
  CONSTRAINT `order_items_orders_FK` FOREIGN KEY (`orderID`) REFERENCES `orders` (`orderID`) ON DELETE CASCADE,
  CONSTRAINT `order_items_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,7,1,1699.00,1359.20,'2026-02-14 06:13:33');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status`
--

DROP TABLE IF EXISTS `order_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status` (
  `statusID` int NOT NULL AUTO_INCREMENT,
  `statusName` varchar(50) NOT NULL,
  `statusDescription` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`statusID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status`
--

LOCK TABLES `order_status` WRITE;
/*!40000 ALTER TABLE `order_status` DISABLE KEYS */;
INSERT INTO `order_status` VALUES (1,'В обработке','Заказ принят и ожидает обработки'),(2,'Подтвержден','Заказ подтвержден менеджером'),(3,'Собран','Заказ собран и готов к выдаче/отправке'),(4,'В доставке','Заказ передан в службу доставки'),(5,'Доставлен','Заказ успешно доставлен'),(6,'Завершен','Заказ завершен и оплачен'),(7,'Отменен','Заказ отменен');
/*!40000 ALTER TABLE `order_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `orderID` int NOT NULL AUTO_INCREMENT,
  `customerID` int NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `deliveryType` enum('pickup','delivery') NOT NULL,
  `deliveryAddress` varchar(255) DEFAULT NULL,
  `deliveryPointID` int DEFAULT NULL,
  `deliveryCost` decimal(10,2) DEFAULT '0.00',
  `paymentType` enum('cash','card','online') NOT NULL,
  `paymentStatus` enum('pending','paid','cancelled') DEFAULT 'pending',
  `orderStatusID` int DEFAULT '1',
  `customerName` varchar(100) NOT NULL,
  `customerPhone` varchar(20) NOT NULL,
  `customerEmail` varchar(100) NOT NULL,
  `comment` text,
  `qrCodeData` text,
  `paymentLink` varchar(255) DEFAULT NULL,
  `orderDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`orderID`),
  KEY `orders_customers_FK` (`customerID`),
  KEY `orders_delivery_points_FK` (`deliveryPointID`),
  KEY `orders_order_status_FK` (`orderStatusID`),
  KEY `idx_customer_orders` (`customerID`,`orderDate`),
  KEY `idx_order_status` (`orderStatusID`),
  CONSTRAINT `orders_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`) ON DELETE CASCADE,
  CONSTRAINT `orders_delivery_points_FK` FOREIGN KEY (`deliveryPointID`) REFERENCES `delivery_points` (`pointID`) ON DELETE SET NULL,
  CONSTRAINT `orders_order_status_FK` FOREIGN KEY (`orderStatusID`) REFERENCES `order_status` (`statusID`) ON DELETE SET DEFAULT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,1359.20,'pickup',NULL,1,0.00,'cash','pending',1,'User','+7 (950) 129-15-76','danil228lol12@mail.ru',NULL,NULL,NULL,'2026-02-14 06:13:33');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_features`
--

DROP TABLE IF EXISTS `product_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_features` (
  `featureID` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `feature_key` varchar(100) NOT NULL,
  `feature_value` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`featureID`),
  KEY `product_features_products_FK` (`productID`),
  KEY `idx_product_features_key` (`feature_key`),
  KEY `idx_product_features_productID` (`productID`),
  CONSTRAINT `product_features_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_features`
--

LOCK TABLES `product_features` WRITE;
/*!40000 ALTER TABLE `product_features` DISABLE KEYS */;
INSERT INTO `product_features` VALUES (5,3,'Вес','0.5кг','2025-12-11 01:55:57'),(6,3,'Материал','Чугун','2025-12-11 01:55:57'),(7,4,'Вес','5кг','2025-12-11 01:57:00'),(8,4,'Материал','Чугун','2025-12-11 01:57:00'),(11,6,'Вес','1кг','2025-12-11 02:06:26'),(12,6,'Материал','Чугун','2025-12-11 02:06:26'),(18,8,'Материал','Чугун','2026-01-13 20:04:17'),(19,8,'Вес','2.5кг','2026-01-13 20:04:17'),(20,9,'Материал','Чугун','2026-01-13 20:30:15'),(21,9,'Вес','1.25кг','2026-01-13 20:30:15'),(22,10,'Материал','Чугун','2026-01-13 20:31:43'),(23,10,'Вес','10кг','2026-01-13 20:31:43'),(24,11,'Материал','Чугун','2026-01-13 20:32:25'),(25,11,'Вес','5кг','2026-01-13 20:32:25'),(26,12,'Материал','Чугун','2026-01-13 20:34:36'),(27,12,'Вес','6кг','2026-01-13 20:34:36'),(28,13,'Материал','Чугун','2026-01-13 20:35:21'),(29,13,'Вес','8кг','2026-01-13 20:35:21'),(30,14,'Материал','Чугун','2026-01-13 20:36:03'),(31,14,'Вес','32кг','2026-01-13 20:36:03'),(32,15,'Материал','Чугун','2026-01-13 20:37:06'),(33,15,'Вес','24кг','2026-01-13 20:37:06'),(34,16,'Материал','Чугун','2026-01-13 20:38:21'),(35,16,'Вес','12кг','2026-01-13 20:38:21'),(36,17,'Материал','Чугун','2026-01-13 20:39:22'),(37,17,'Вес','16кг','2026-01-13 20:39:22'),(38,18,'Материал','Чугун','2026-01-13 20:40:46'),(39,18,'Вес','4кг','2026-01-13 20:40:46'),(40,19,'Вес','0.25кг','2026-01-13 20:47:46'),(41,20,'Вес','5кг','2026-01-13 20:48:15'),(42,21,'Вес','0.5кг','2026-01-13 20:49:53'),(43,22,'Вес','1.5кг','2026-01-13 20:50:35'),(44,23,'Вес','2кг','2026-01-13 20:51:17'),(47,5,'Вес','3кг','2026-02-03 16:53:02'),(48,5,'Материал','Чугун','2026-02-03 16:53:02'),(49,7,'Вес','4кг','2026-02-14 03:52:51'),(50,7,'Материал','Чугун','2026-02-14 03:52:51'),(53,2,'Вес','2кг','2026-02-14 05:26:44'),(54,2,'Материал','Чугун','2026-02-14 05:26:44');
/*!40000 ALTER TABLE `product_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `productID` int NOT NULL AUTO_INCREMENT,
  `productDescription` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `productTitle` varchar(100) NOT NULL,
  `productThumbnail` varchar(100) NOT NULL,
  `productManufacturer` varchar(100) NOT NULL,
  `productRating` double NOT NULL DEFAULT '0',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `discount_price` decimal(10,2) DEFAULT NULL,
  `discount_start_date` datetime DEFAULT NULL,
  `discount_end_date` datetime DEFAULT NULL,
  `is_on_sale` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `productPrice` decimal(10,2) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `is_available` tinyint(1) GENERATED ALWAYS AS ((`stock_quantity` > 0)) STORED,
  PRIMARY KEY (`productID`),
  KEY `idx_productPrice` (`productPrice`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` (`productID`, `productDescription`, `productTitle`, `productThumbnail`, `productManufacturer`, `productRating`, `discount_percentage`, `discount_price`, `discount_start_date`, `discount_end_date`, `is_on_sale`, `created_at`, `productPrice`, `stock_quantity`) VALUES (2,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 2 кг','1765446877808_Demix2kg.jpg','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 01:54:37',899.00,15),(3,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 0.5 кг','1765446957700_Demix0.5kg.jpg','Demix',4,0.00,NULL,NULL,NULL,0,'2025-12-11 01:55:57',299.00,10),(4,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 5 кг','1765447020098_Demix5kg.jpg','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 01:57:00',1899.00,10),(5,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 3 кг','1765447103453_Demix3kg.jpg','Demix',0,90.00,NULL,'2026-02-04 08:52:00','2026-02-11 08:52:00',0,'2025-12-11 01:58:23',1499.00,10),(6,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 1 кг','1765447586349_Demix1kgNeo.jpg','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 02:06:26',499.00,10),(7,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 4 кг','1765447640443_Demix4kgNeo.jpg','Demix',0,20.00,1359.20,'2026-02-14 11:52:00','2026-02-21 11:52:00',1,'2025-12-11 02:07:20',1699.00,9),(8,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 2.5 кг.','Диск стальной обрезиненный KETTLER, 2.5 кг','1768363395664_KETTLER2.5kg.jpg','KETTLER',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:03:15',1199.00,10),(9,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 1.25 кг.','Диск стальной обрезиненный KETTLER 1.25 кг','1768365015694_KETTLER1.25kg.jpg','KETTLER',0,99.00,NULL,'2026-01-14 12:29:00','2026-01-21 12:29:00',0,'2026-01-13 20:30:15',599.00,10),(10,'Прочный чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 50 мм, что делает его совместимым с олимпийскими грифами. Вес диска 10 кг.','Диск чугунный обрезиненный KETTLER, 51 мм, 10 кг','1768365103083_KETTLER10kg.jpg','KETTLER',0,1.00,NULL,'2026-01-14 12:31:00','2026-01-21 12:31:00',0,'2026-01-13 20:31:43',4599.00,10),(11,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 5 кг.','Диск стальной обрезиненный KETTLER, 5 кг','1768365145977_KETTLER5kg.jpg','KETTLER',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:32:25',2399.00,10),(12,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 6 кг','1768365276715_Torneo6kg.jpg','Torneo',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:34:36',2899.00,10),(13,'\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 8 кг','1768365321482_Torneo8kg.jpg','Torneo',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:35:21',3599.00,10),(14,'Чугунная гиря Torneo весом 32 кг. Благодаря оболочке из ПВХ снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью: это обеспечивает улучшенное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 32 кг','1768365363498_Torneo32kg.jpg','Torneo',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:36:03',11999.00,10),(15,'\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 24 кг','1768365426009_Torneo24kg.jpg','Torneo',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:37:06',7999.00,10),(16,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 12 кг','1768365501689_Torneo12kg.jpg','Torneo',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:38:21',4199.00,10),(17,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 16 кг','1768365562855_Torneo16kg.jpg','Torneo',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:39:22',5599.00,10),(18,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 4 кг','1768365646888_Torneo4kg.jpg','Torneo',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:40:46',1899.00,10),(19,'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.','Утяжелители Demix, 2 х 0.25 кг','1768366066417_Утяжелитель 0.25.png','Demix',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:47:46',699.00,10),(20,'Утяжеленный жилет весом 5 кг поможет повысить эффективность тренировок и развить выносливость. Благодаря анатомической форме гарантирован комфорт во время использования.','Жилет утяжеленный Demix, 5 кг','1768366095987_Утяжелитель 5.png','Demix',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:48:15',2449.00,10),(21,'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.','Утяжелители Demix, 2 х 0.5 кг','1768366193127_Утяжелитель 0.5.png','Demix',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:49:53',899.00,10),(22,'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 1.5 кг.','Утяжелители Demix, 2 х 1.5 кг','1768366235529_Утяжелитель 1.5.png','Demix',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:50:35',1499.00,10),(23,'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 2 кг.','Утяжелители Demix, 2 х 2 кг','1768366277583_Утяжелитель 1.png','Demix',0,0.00,NULL,NULL,NULL,0,'2026-01-13 20:51:17',1999.00,10);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `reviewID` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `customerID` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reviewID`),
  UNIQUE KEY `unique_user_product_review` (`customerID`,`productID`),
  KEY `reviews_products_FK` (`productID`),
  KEY `reviews_customers_FK` (`customerID`),
  CONSTRAINT `reviews_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  CONSTRAINT `reviews_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,3,16,4,'Prekol\'no 10 slov','2026-01-13 18:42:58');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_cart`
--

DROP TABLE IF EXISTS `shopping_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_cart` (
  `shopping_cartID` int NOT NULL AUTO_INCREMENT,
  `customerID` int NOT NULL,
  `productID` int NOT NULL,
  `sc_count` int NOT NULL,
  PRIMARY KEY (`shopping_cartID`,`customerID`,`productID`),
  KEY `shopping_cart_customers_FK` (`customerID`),
  KEY `shopping_cart_products_FK` (`productID`),
  CONSTRAINT `shopping_cart_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  CONSTRAINT `shopping_cart_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_cart`
--

LOCK TABLES `shopping_cart` WRITE;
/*!40000 ALTER TABLE `shopping_cart` DISABLE KEYS */;
INSERT INTO `shopping_cart` VALUES (5,16,7,1),(6,16,2,1);
/*!40000 ALTER TABLE `shopping_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'Sport'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-14 14:15:49

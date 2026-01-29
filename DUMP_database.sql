-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
<<<<<<< HEAD
-- Хост: 127.0.0.1:3306
<<<<<<< HEAD
-- Время создания: Янв 28 2026 г., 08:39
=======
-- Время создания: Янв 14 2026 г., 08:20
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1
-- Версия сервера: 8.0.30
-- Версия PHP: 7.2.34
=======
-- Host: localhost    Database: sporti
-- ------------------------------------------------------
-- Server version	8.0.41
>>>>>>> parent of 37eb59f (Realease v1.3)

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesandproducts`
--

<<<<<<< HEAD
INSERT INTO `categoriesandproducts` (`categoriesandproductsID`, `categorieID`, `productID`) VALUES
<<<<<<< HEAD
(30, 1, 2),
(31, 4, 2),
=======
(11, 1, 2),
(12, 4, 2),
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1
(5, 1, 3),
(6, 1, 4),
(7, 1, 5),
(8, 1, 6),
(9, 4, 6),
(10, 1, 7),
(14, 3, 8),
(15, 3, 9),
(16, 3, 10),
(17, 3, 11),
(18, 2, 12),
(19, 2, 13),
(20, 2, 14),
(21, 2, 15),
(22, 2, 16),
(23, 2, 17),
(24, 2, 18),
(25, 4, 19),
(26, 4, 20),
(27, 4, 21),
(28, 4, 22),
(29, 4, 23);

-- --------------------------------------------------------
=======
LOCK TABLES `categoriesandproducts` WRITE;
/*!40000 ALTER TABLE `categoriesandproducts` DISABLE KEYS */;
INSERT INTO `categoriesandproducts` VALUES (11,1,2),(12,4,2),(5,1,3),(6,1,4),(7,1,5),(8,1,6),(9,4,6),(10,1,7);
/*!40000 ALTER TABLE `categoriesandproducts` ENABLE KEYS */;
UNLOCK TABLES;
>>>>>>> parent of 37eb59f (Realease v1.3)

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('User','danil228lol12@mail.ru',2,'/images/Avatars/Avatar3.jpg','$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im','admin'),('PUPA','sbiktobirov@gmail.com',3,'/images/Avatars/Thumbnail_1.jpg','$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.','user'),('test','test@mail.ru',13,'/images/Avatars/Thumbnail_2.png','$2b$10$3adq0qU2ERtfS9UGam5dbO/E6AZtofnqR3BpHO4he1dKj86p/804.','user'),('van_dam_0','van_dam_0@mail.ru',14,'/images/Avatars/Avatar2.jpg','$2b$10$F8iOEtJpzQv/ekGLRMGAN..icED0M.VkAurj.Ox6AUsK24gwRIkyG','user'),('User_Looser','van_dam_1@mail.ru',15,'/images/Avatars/Avatar2.jpg','$2b$10$g3uPF3Ju54TjwE9DwJ.mFOAtSblfBGvUhHEXjGoQjAMcJoKRWcuH6','user');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_features`
--

LOCK TABLES `product_features` WRITE;
/*!40000 ALTER TABLE `product_features` DISABLE KEYS */;
INSERT INTO `product_features` VALUES (5,3,'Вес','0.5кг','2025-12-11 09:55:57'),(6,3,'Материал','Чугун','2025-12-11 09:55:57'),(7,4,'Вес','5кг','2025-12-11 09:57:00'),(8,4,'Материал','Чугун','2025-12-11 09:57:00'),(9,5,'Вес','3кг','2025-12-11 09:58:23'),(10,5,'Материал','Чугун','2025-12-11 09:58:23'),(11,6,'Вес','1кг','2025-12-11 10:06:26'),(12,6,'Материал','Чугун','2025-12-11 10:06:26'),(13,7,'Вес','4кг','2025-12-11 10:07:20'),(14,7,'Материал','Чугун','2025-12-11 10:07:20'),(15,2,'Вес','2кг','2025-12-11 10:08:03'),(16,2,'Материал','Чугун','2025-12-11 10:08:03');
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
  `productPrice` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `productManufacturer` varchar(100) NOT NULL,
  `productRating` double NOT NULL DEFAULT '0',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `discount_price` decimal(10,2) DEFAULT NULL,
  `discount_start_date` datetime DEFAULT NULL,
  `discount_end_date` datetime DEFAULT NULL,
  `is_on_sale` tinyint(1) DEFAULT '0',
<<<<<<< HEAD
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
<<<<<<< HEAD
  `productPrice` decimal(10,2) NOT NULL
=======
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
=======
  PRIMARY KEY (`productID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
>>>>>>> parent of 37eb59f (Realease v1.3)

--
-- Dumping data for table `products`
--

<<<<<<< HEAD
<<<<<<< HEAD
INSERT INTO `products` (`productID`, `productDescription`, `productTitle`, `productThumbnail`, `productManufacturer`, `productRating`, `discount_percentage`, `discount_price`, `discount_start_date`, `discount_end_date`, `is_on_sale`, `created_at`, `productPrice`) VALUES
(2, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 2 кг', '1765446877808_Demix2kg.jpg', 'Demix', 0, '30.00', '629.30', '2026-01-28 00:00:00', '2026-02-04 00:00:00', 1, '2025-12-11 09:54:37', '899.00'),
(3, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 0.5 кг', '1765446957700_Demix0.5kg.jpg', 'Demix', 4, '0.00', NULL, NULL, NULL, 0, '2025-12-11 09:55:57', '299.00'),
(4, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 5 кг', '1765447020098_Demix5kg.jpg', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 09:57:00', '1899.00'),
(5, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 3 кг', '1765447103453_Demix3kg.jpg', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 09:58:23', '1499.00'),
(6, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 1 кг', '1765447586349_Demix1kgNeo.jpg', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 10:06:26', '499.00'),
(7, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 4 кг', '1765447640443_Demix4kgNeo.jpg', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 10:07:20', '1699.00'),
(8, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 2.5 кг.', 'Диск стальной обрезиненный KETTLER, 2.5 кг', '1768363395664_KETTLER2.5kg.jpg', 'KETTLER', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:03:15', '1199.00'),
(9, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 1.25 кг.', 'Диск стальной обрезиненный KETTLER 1.25 кг', '1768365015694_KETTLER1.25kg.jpg', 'KETTLER', 0, '99.00', NULL, '2026-01-14 12:29:00', '2026-01-21 12:29:00', 0, '2026-01-14 04:30:15', '599.00'),
(10, 'Прочный чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 50 мм, что делает его совместимым с олимпийскими грифами. Вес диска 10 кг.', 'Диск чугунный обрезиненный KETTLER, 51 мм, 10 кг', '1768365103083_KETTLER10kg.jpg', 'KETTLER', 0, '1.00', NULL, '2026-01-14 12:31:00', '2026-01-21 12:31:00', 0, '2026-01-14 04:31:43', '4599.00'),
(11, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 5 кг.', 'Диск стальной обрезиненный KETTLER, 5 кг', '1768365145977_KETTLER5kg.jpg', 'KETTLER', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:32:25', '2399.00'),
(12, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 6 кг', '1768365276715_Torneo6kg.jpg', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:34:36', '2899.00'),
(13, '\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 8 кг', '1768365321482_Torneo8kg.jpg', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:35:21', '3599.00'),
(14, 'Чугунная гиря Torneo весом 32 кг. Благодаря оболочке из ПВХ снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью: это обеспечивает улучшенное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 32 кг', '1768365363498_Torneo32kg.jpg', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:36:03', '11999.00'),
(15, '\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 24 кг', '1768365426009_Torneo24kg.jpg', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:37:06', '7999.00'),
(16, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 12 кг', '1768365501689_Torneo12kg.jpg', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:38:21', '4199.00'),
(17, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 16 кг', '1768365562855_Torneo16kg.jpg', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:39:22', '5599.00'),
(18, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 4 кг', '1768365646888_Torneo4kg.jpg', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:40:46', '1899.00'),
(19, 'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.', 'Утяжелители Demix, 2 х 0.25 кг', '1768366066417_Утяжелитель 0.25.png', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:47:46', '699.00'),
(20, 'Утяжеленный жилет весом 5 кг поможет повысить эффективность тренировок и развить выносливость. Благодаря анатомической форме гарантирован комфорт во время использования.', 'Жилет утяжеленный Demix, 5 кг', '1768366095987_Утяжелитель 5.png', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:48:15', '2449.00'),
(21, 'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.', 'Утяжелители Demix, 2 х 0.5 кг', '1768366193127_Утяжелитель 0.5.png', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:49:53', '899.00'),
(22, 'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 1.5 кг.', 'Утяжелители Demix, 2 х 1.5 кг', '1768366235529_Утяжелитель 1.5.png', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:50:35', '1499.00'),
(23, 'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 2 кг.', 'Утяжелители Demix, 2 х 2 кг', '1768366277583_Утяжелитель 1.png', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:51:17', '1999.00');
=======
INSERT INTO `products` (`productID`, `productDescription`, `productTitle`, `productThumbnail`, `productPrice`, `productManufacturer`, `productRating`, `discount_percentage`, `discount_price`, `discount_start_date`, `discount_end_date`, `is_on_sale`, `created_at`) VALUES
(2, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 2 кг', '1765446877808_Demix2kg.jpg', '899', 'Demix', 0, '30.00', NULL, '2025-12-11 18:07:00', '2025-12-18 18:07:00', 0, '2025-12-11 09:54:37'),
(3, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 0.5 кг', '1765446957700_Demix0.5kg.jpg', '299', 'Demix', 4, '0.00', NULL, NULL, NULL, 0, '2025-12-11 09:55:57'),
(4, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 5 кг', '1765447020098_Demix5kg.jpg', '1899', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 09:57:00'),
(5, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 3 кг', '1765447103453_Demix3kg.jpg', '1499', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 09:58:23'),
(6, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 1 кг', '1765447586349_Demix1kgNeo.jpg', '499', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 10:06:26'),
(7, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 4 кг', '1765447640443_Demix4kgNeo.jpg', '1699', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2025-12-11 10:07:20'),
(8, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 2.5 кг.', 'Диск стальной обрезиненный KETTLER, 2.5 кг', '1768363395664_KETTLER2.5kg.jpg', '1199', 'KETTLER', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:03:15'),
(9, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 1.25 кг.', 'Диск стальной обрезиненный KETTLER 1.25 кг', '1768365015694_KETTLER1.25kg.jpg', '599', 'KETTLER', 0, '99.00', '5.99', '2026-01-14 12:29:00', '2026-01-21 12:29:00', 1, '2026-01-14 04:30:15'),
(10, 'Прочный чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 50 мм, что делает его совместимым с олимпийскими грифами. Вес диска 10 кг.', 'Диск чугунный обрезиненный KETTLER, 51 мм, 10 кг', '1768365103083_KETTLER10kg.jpg', '4599', 'KETTLER', 0, '1.00', '4553.01', '2026-01-14 12:31:00', '2026-01-21 12:31:00', 1, '2026-01-14 04:31:43'),
(11, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 5 кг.', 'Диск стальной обрезиненный KETTLER, 5 кг', '1768365145977_KETTLER5kg.jpg', '2399', 'KETTLER', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:32:25'),
(12, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 6 кг', '1768365276715_Torneo6kg.jpg', '2899', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:34:36'),
(13, '\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 8 кг', '1768365321482_Torneo8kg.jpg', '3599', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:35:21'),
(14, 'Чугунная гиря Torneo весом 32 кг. Благодаря оболочке из ПВХ снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью: это обеспечивает улучшенное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 32 кг', '1768365363498_Torneo32kg.jpg', '11999', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:36:03'),
(15, '\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 24 кг', '1768365426009_Torneo24kg.jpg', '7999', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:37:06'),
(16, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 12 кг', '1768365501689_Torneo12kg.jpg', '4199', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:38:21'),
(17, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 16 кг', '1768365562855_Torneo16kg.jpg', '5599', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:39:22'),
(18, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 4 кг', '1768365646888_Torneo4kg.jpg', '1899', 'Torneo', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:40:46'),
(19, 'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.', 'Утяжелители Demix, 2 х 0.25 кг', '1768366066417_Утяжелитель 0.25.png', '699', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:47:46'),
(20, 'Утяжеленный жилет весом 5 кг поможет повысить эффективность тренировок и развить выносливость. Благодаря анатомической форме гарантирован комфорт во время использования.', 'Жилет утяжеленный Demix, 5 кг', '1768366095987_Утяжелитель 5.png', '2449', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:48:15'),
(21, 'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.', 'Утяжелители Demix, 2 х 0.5 кг', '1768366193127_Утяжелитель 0.5.png', '899', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:49:53'),
(22, 'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 1.5 кг.', 'Утяжелители Demix, 2 х 1.5 кг', '1768366235529_Утяжелитель 1.5.png', '1499', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:50:35'),
(23, 'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 2 кг.', 'Утяжелители Demix, 2 х 2 кг', '1768366277583_Утяжелитель 1.png', '1999', 'Demix', 0, '0.00', NULL, NULL, NULL, 0, '2026-01-14 04:51:17');
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1

-- --------------------------------------------------------

--
-- Структура таблицы `product_features`
--

CREATE TABLE `product_features` (
  `featureID` int NOT NULL,
  `productID` int NOT NULL,
  `feature_key` varchar(100) NOT NULL,
  `feature_value` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `product_features`
--

INSERT INTO `product_features` (`featureID`, `productID`, `feature_key`, `feature_value`, `created_at`) VALUES
(5, 3, 'Вес', '0.5кг', '2025-12-11 09:55:57'),
(6, 3, 'Материал', 'Чугун', '2025-12-11 09:55:57'),
(7, 4, 'Вес', '5кг', '2025-12-11 09:57:00'),
(8, 4, 'Материал', 'Чугун', '2025-12-11 09:57:00'),
(9, 5, 'Вес', '3кг', '2025-12-11 09:58:23'),
(10, 5, 'Материал', 'Чугун', '2025-12-11 09:58:23'),
(11, 6, 'Вес', '1кг', '2025-12-11 10:06:26'),
(12, 6, 'Материал', 'Чугун', '2025-12-11 10:06:26'),
(13, 7, 'Вес', '4кг', '2025-12-11 10:07:20'),
(14, 7, 'Материал', 'Чугун', '2025-12-11 10:07:20'),
<<<<<<< HEAD
=======
(15, 2, 'Вес', '2кг', '2025-12-11 10:08:03'),
(16, 2, 'Материал', 'Чугун', '2025-12-11 10:08:03'),
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1
(18, 8, 'Материал', 'Чугун', '2026-01-14 04:04:17'),
(19, 8, 'Вес', '2.5кг', '2026-01-14 04:04:17'),
(20, 9, 'Материал', 'Чугун', '2026-01-14 04:30:15'),
(21, 9, 'Вес', '1.25кг', '2026-01-14 04:30:15'),
(22, 10, 'Материал', 'Чугун', '2026-01-14 04:31:43'),
(23, 10, 'Вес', '10кг', '2026-01-14 04:31:43'),
(24, 11, 'Материал', 'Чугун', '2026-01-14 04:32:25'),
(25, 11, 'Вес', '5кг', '2026-01-14 04:32:25'),
(26, 12, 'Материал', 'Чугун', '2026-01-14 04:34:36'),
(27, 12, 'Вес', '6кг', '2026-01-14 04:34:36'),
(28, 13, 'Материал', 'Чугун', '2026-01-14 04:35:21'),
(29, 13, 'Вес', '8кг', '2026-01-14 04:35:21'),
(30, 14, 'Материал', 'Чугун', '2026-01-14 04:36:03'),
(31, 14, 'Вес', '32кг', '2026-01-14 04:36:03'),
(32, 15, 'Материал', 'Чугун', '2026-01-14 04:37:06'),
(33, 15, 'Вес', '24кг', '2026-01-14 04:37:06'),
(34, 16, 'Материал', 'Чугун', '2026-01-14 04:38:21'),
(35, 16, 'Вес', '12кг', '2026-01-14 04:38:21'),
(36, 17, 'Материал', 'Чугун', '2026-01-14 04:39:22'),
(37, 17, 'Вес', '16кг', '2026-01-14 04:39:22'),
(38, 18, 'Материал', 'Чугун', '2026-01-14 04:40:46'),
(39, 18, 'Вес', '4кг', '2026-01-14 04:40:46'),
(40, 19, 'Вес', '0.25кг', '2026-01-14 04:47:46'),
(41, 20, 'Вес', '5кг', '2026-01-14 04:48:15'),
(42, 21, 'Вес', '0.5кг', '2026-01-14 04:49:53'),
(43, 22, 'Вес', '1.5кг', '2026-01-14 04:50:35'),
<<<<<<< HEAD
(44, 23, 'Вес', '2кг', '2026-01-14 04:51:17'),
(45, 2, 'Вес', '2кг', '2026-01-28 02:29:07'),
(46, 2, 'Материал', 'Чугун', '2026-01-28 02:29:07');
=======
(44, 23, 'Вес', '2кг', '2026-01-14 04:51:17');
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1

-- --------------------------------------------------------

--
-- Структура таблицы `reviews`
=======
LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (2,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 2 кг','1765446877808_Demix2kg.jpg','899','Demix',0,30.00,629.30,'2025-12-11 18:07:00','2025-12-18 18:07:00',1,'2025-12-11 09:54:37'),(3,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 0.5 кг','1765446957700_Demix0.5kg.jpg','299','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 09:55:57'),(4,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 5 кг','1765447020098_Demix5kg.jpg','1899','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 09:57:00'),(5,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 3 кг','1765447103453_Demix3kg.jpg','1499','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 09:58:23'),(6,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 1 кг','1765447586349_Demix1kgNeo.jpg','499','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 10:06:26'),(7,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 4 кг','1765447640443_Demix4kgNeo.jpg','1699','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 10:07:20');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
>>>>>>> parent of 37eb59f (Realease v1.3)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_cart`
--

LOCK TABLES `shopping_cart` WRITE;
/*!40000 ALTER TABLE `shopping_cart` DISABLE KEYS */;
INSERT INTO `shopping_cart` VALUES (1,2,7,2);
/*!40000 ALTER TABLE `shopping_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sporti'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

<<<<<<< HEAD
--
-- Индексы таблицы `categoriesandproducts`
--
ALTER TABLE `categoriesandproducts`
  ADD PRIMARY KEY (`categoriesandproductsID`,`categorieID`,`productID`),
  ADD KEY `categoriesandproducts_products_FK` (`productID`),
  ADD KEY `categoriesandproducts_categories_FK` (`categorieID`);

--
-- Индексы таблицы `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customerID`);

--
-- Индексы таблицы `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`favoritesID`,`customerID`,`productID`),
  ADD KEY `favorites_products_FK` (`productID`),
  ADD KEY `favorites_customers_FK` (`customerID`);

--
-- Индексы таблицы `products`
--
ALTER TABLE `products`
<<<<<<< HEAD
  ADD PRIMARY KEY (`productID`),
  ADD KEY `idx_productPrice` (`productPrice`);
=======
  ADD PRIMARY KEY (`productID`);
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1

--
-- Индексы таблицы `product_features`
--
ALTER TABLE `product_features`
  ADD PRIMARY KEY (`featureID`),
  ADD KEY `product_features_products_FK` (`productID`),
  ADD KEY `idx_product_features_key` (`feature_key`),
  ADD KEY `idx_product_features_productID` (`productID`);

--
-- Индексы таблицы `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`reviewID`),
  ADD UNIQUE KEY `unique_user_product_review` (`customerID`,`productID`),
  ADD KEY `reviews_products_FK` (`productID`),
  ADD KEY `reviews_customers_FK` (`customerID`);

--
-- Индексы таблицы `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD PRIMARY KEY (`shopping_cartID`,`customerID`,`productID`),
  ADD KEY `shopping_cart_customers_FK` (`customerID`),
  ADD KEY `shopping_cart_products_FK` (`productID`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `categories`
--
ALTER TABLE `categories`
  MODIFY `categorieID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `categoriesandproducts`
--
ALTER TABLE `categoriesandproducts`
<<<<<<< HEAD
  MODIFY `categoriesandproductsID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;
=======
  MODIFY `categoriesandproductsID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1

--
-- AUTO_INCREMENT для таблицы `customers`
--
ALTER TABLE `customers`
  MODIFY `customerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT для таблицы `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoritesID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `products`
--
ALTER TABLE `products`
  MODIFY `productID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT для таблицы `product_features`
--
ALTER TABLE `product_features`
<<<<<<< HEAD
  MODIFY `featureID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;
=======
  MODIFY `featureID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1

--
-- AUTO_INCREMENT для таблицы `reviews`
--
ALTER TABLE `reviews`
  MODIFY `reviewID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `shopping_cart`
--
ALTER TABLE `shopping_cart`
  MODIFY `shopping_cartID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `categoriesandproducts`
--
ALTER TABLE `categoriesandproducts`
  ADD CONSTRAINT `categoriesandproducts_categories_FK` FOREIGN KEY (`categorieID`) REFERENCES `categories` (`categorieID`),
  ADD CONSTRAINT `categoriesandproducts_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`);

--
-- Ограничения внешнего ключа таблицы `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  ADD CONSTRAINT `favorites_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`);

--
-- Ограничения внешнего ключа таблицы `product_features`
--
ALTER TABLE `product_features`
  ADD CONSTRAINT `product_features_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  ADD CONSTRAINT `reviews_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`);

--
-- Ограничения внешнего ключа таблицы `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD CONSTRAINT `shopping_cart_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  ADD CONSTRAINT `shopping_cart_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`);
<<<<<<< HEAD
COMMIT;
=======
COMMIT;
>>>>>>> 50e9382a2a9fe22c68dbaf80b28d11fe345f53f1
=======
-- Dump completed on 2025-12-11 21:55:05
>>>>>>> parent of 37eb59f (Realease v1.3)

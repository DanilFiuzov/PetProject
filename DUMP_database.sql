-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: sporti
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesandproducts`
--

LOCK TABLES `categoriesandproducts` WRITE;
/*!40000 ALTER TABLE `categoriesandproducts` DISABLE KEYS */;
INSERT INTO `categoriesandproducts` VALUES (11,1,2),(12,4,2),(5,1,3),(6,1,4),(7,1,5),(8,1,6),(9,4,6),(10,1,7);
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
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`productID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (2,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 2 кг','1765446877808_Demix2kg.jpg','899','Demix',0,30.00,629.30,'2025-12-11 18:07:00','2025-12-18 18:07:00',1,'2025-12-11 09:54:37'),(3,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 0.5 кг','1765446957700_Demix0.5kg.jpg','299','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 09:55:57'),(4,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 5 кг','1765447020098_Demix5kg.jpg','1899','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 09:57:00'),(5,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.','Гантель Demix, 3 кг','1765447103453_Demix3kg.jpg','1499','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 09:58:23'),(6,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 1 кг','1765447586349_Demix1kgNeo.jpg','499','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 10:06:26'),(7,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 4 кг','1765447640443_Demix4kgNeo.jpg','1699','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-11 10:07:20');
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

-- Dump completed on 2025-12-11 21:55:05

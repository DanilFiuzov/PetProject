-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: GameCenter
-- ------------------------------------------------------
-- Server version	8.0.30

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
INSERT INTO `categories` VALUES ('Р“Р°РЅС‚РµР»Рё',1),('Р“РёСЂРё',2),('Р‘Р»РёРЅС‹',3),('Р¤РёС‚РЅРµСЃ',4);
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
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesandproducts`
--

LOCK TABLES `categoriesandproducts` WRITE;
/*!40000 ALTER TABLE `categoriesandproducts` DISABLE KEYS */;
INSERT INTO `categoriesandproducts` VALUES (55,1,8),(54,1,9),(60,1,10),(61,4,10),(29,1,11),(30,4,11),(31,1,12),(32,4,12),(33,1,13),(34,4,13),(35,1,14),(36,4,14),(56,2,15),(57,4,15),(5,2,16),(6,4,16),(7,2,17),(8,4,17),(9,2,18),(10,4,18),(11,2,19),(12,4,19),(13,2,20),(14,4,20),(15,2,21),(16,4,21),(17,3,22),(18,4,22),(19,3,23),(20,4,23),(21,3,24),(22,4,24),(45,3,25);
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (27,9,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_features`
--

LOCK TABLES `product_features` WRITE;
/*!40000 ALTER TABLE `product_features` DISABLE KEYS */;
INSERT INTO `product_features` VALUES (6,25,'Р’РµСЃ','1.25РєРі','2025-12-08 14:25:04'),(19,8,'Р’РµСЃ','2РєРі','2025-12-10 14:50:49'),(20,8,'РњР°С‚РµСЂРёР°Р»','Р§СѓРіСѓРЅ','2025-12-10 14:50:49'),(22,10,'Р’РµСЃ','3РєРі','2025-12-11 03:17:06'),(23,10,'РњР°С‚РµСЂРёР°Р»','Р§СѓРіСѓРЅ','2025-12-11 03:17:06');
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (8,'Р“Р°РЅС‚РµР»СЊ СЌСЂРіРѕРЅРѕРјРёС‡РЅРѕР№ С„РѕСЂРјС‹ СЃРѕ СЃРєСЂСѓРіР»РµРЅРЅС‹РјРё РєСЂР°СЏРјРё. РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅР° РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕРіРѕ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ Рё С…СЂР°РЅРµРЅРёСЏ РІ РґРѕРјР°С€РЅРёС… СѓСЃР»РѕРІРёСЏС…. РќРµСЃРєРѕР»СЊР·СЏС‰РµРµ РЅРµРѕРїСЂРµРЅРѕРІРѕРµ РїРѕРєСЂС‹С‚РёРµ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РЅР°РґРµР¶РЅС‹Р№ С…РІР°С‚ РіР°РЅС‚РµР»РµР№ РІРѕ РІСЂРµРјСЏ Р·Р°РЅСЏС‚РёР№ Рё Р°РјРѕСЂС‚РёР·Р°С†РёСЋ РїСЂРё СЃРѕРїСЂРёРєРѕСЃРЅРѕРІРµРЅРёРё СЃ РїРѕР»РѕРј.','Р“Р°РЅС‚РµР»СЊ Demix, 2 РєРі','Demix2kg.jpg','799','Demix',4.333333333,35.00,519.35,'2025-12-10 09:26:00','2025-12-17 09:26:00',1,'2025-11-25 16:00:00'),(9,'Р“Р°РЅС‚РµР»СЊ СЌСЂРіРѕРЅРѕРјРёС‡РЅРѕР№ С„РѕСЂРјС‹ СЃРѕ СЃРєСЂСѓРіР»РµРЅРЅС‹РјРё РєСЂР°СЏРјРё. РќРµСЃРєРѕР»СЊР·СЏС‰РµРµ РЅРµРѕРїСЂРµРЅРѕРІРѕРµ РїРѕРєСЂС‹С‚РёРµ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РЅР°РґРµР¶РЅС‹Р№ С…РІР°С‚ РІРѕ РІСЂРµРјСЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ Рё Р°РјРѕСЂС‚РёР·Р°С†РёСЋ РїСЂРё СЃРѕРїСЂРёРєРѕСЃРЅРѕРІРµРЅРёРё СЃ РїРѕР»РѕРј.','Р“Р°РЅС‚РµР»СЊ Demix, 0.5 РєРі','Demix0.5kg.jpg','299','Demix',4,20.00,239.20,'2025-12-10 19:37:00','2025-12-17 19:37:00',1,'2025-11-29 16:00:00'),(10,'Р“Р°РЅС‚РµР»СЊ СЌСЂРіРѕРЅРѕРјРёС‡РЅРѕР№ С„РѕСЂРјС‹ СЃРѕ СЃРєСЂСѓРіР»РµРЅРЅС‹РјРё РєСЂР°СЏРјРё. РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅР° РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕРіРѕ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ Рё С…СЂР°РЅРµРЅРёСЏ РІ РґРѕРјР°С€РЅРёС… СѓСЃР»РѕРІРёСЏС…. РќРµСЃРєРѕР»СЊР·СЏС‰РµРµ РЅРµРѕРїСЂРµРЅРѕРІРѕРµ РїРѕРєСЂС‹С‚РёРµ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РЅР°РґРµР¶РЅС‹Р№ С…РІР°С‚ РіР°РЅС‚РµР»РµР№ РІРѕ РІСЂРµРјСЏ Р·Р°РЅСЏС‚РёР№ Рё Р°РјРѕСЂС‚РёР·Р°С†РёСЋ РїСЂРё СЃРѕРїСЂРёРєРѕСЃРЅРѕРІРµРЅРёРё СЃ РїРѕР»РѕРј.','Р“Р°РЅС‚РµР»СЊ Demix, 3 РєРі','Demix3kg.jpg','1299','Demix',0,10.00,1169.10,'2025-12-11 03:16:00','2025-12-18 03:16:00',1,'2025-12-04 16:00:00'),(11,'Р“Р°РЅС‚РµР»СЊ СЌСЂРіРѕРЅРѕРјРёС‡РЅРѕР№ С„РѕСЂРјС‹ СЃРѕ СЃРєСЂСѓРіР»РµРЅРЅС‹РјРё РєСЂР°СЏРјРё. РќРµСЃРєРѕР»СЊР·СЏС‰РµРµ РЅРµРѕРїСЂРµРЅРѕРІРѕРµ РїРѕРєСЂС‹С‚РёРµ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РЅР°РґРµР¶РЅС‹Р№ С…РІР°С‚ РІРѕ РІСЂРµРјСЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ Рё Р°РјРѕСЂС‚РёР·Р°С†РёСЋ РїСЂРё СЃРѕРїСЂРёРєРѕСЃРЅРѕРІРµРЅРёРё СЃ РїРѕР»РѕРј.','Р“Р°РЅС‚РµР»СЊ Demix 1 РєРі СЃ РЅРµРѕРїСЂРµРЅРѕРІС‹Рј РїРѕРєСЂС‹С‚РёРµРј','Demix1kgNeo.jpg','499','Demix',0,0.00,NULL,NULL,NULL,0,'2025-11-30 16:00:00'),(12,'Р“Р°РЅС‚РµР»СЊ СЌСЂРіРѕРЅРѕРјРёС‡РЅРѕР№ С„РѕСЂРјС‹ СЃРѕ СЃРєСЂСѓРіР»РµРЅРЅС‹РјРё РєСЂР°СЏРјРё. РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅР° РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕРіРѕ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ Рё С…СЂР°РЅРµРЅРёСЏ РІ РґРѕРјР°С€РЅРёС… СѓСЃР»РѕРІРёСЏС…. РќРµСЃРєРѕР»СЊР·СЏС‰РµРµ РЅРµРѕРїСЂРµРЅРѕРІРѕРµ РїРѕРєСЂС‹С‚РёРµ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РЅР°РґРµР¶РЅС‹Р№ С…РІР°С‚ РіР°РЅС‚РµР»РµР№ РІРѕ РІСЂРµРјСЏ Р·Р°РЅСЏС‚РёР№ Рё Р°РјРѕСЂС‚РёР·Р°С†РёСЋ РїСЂРё СЃРѕРїСЂРёРєРѕСЃРЅРѕРІРµРЅРёРё СЃ РїРѕР»РѕРј.','Р“Р°РЅС‚РµР»СЊ Demix, 5 РєРі','Demix5kg.jpg','1699','Demix',0,0.00,NULL,NULL,NULL,0,'2025-12-07 16:00:00'),(13,'Р“Р°РЅС‚РµР»СЊ Demix РїРѕРґС…РѕРґРёС‚ РґР»СЏ СЂР°Р·Р»РёС‡РЅС‹С… РІРёРґРѕРІ СѓРїСЂР°Р¶РЅРµРЅРёР№: РѕС‚ СЃРёР»РѕРІС‹С… С‚СЂРµРЅРёСЂРѕРІРѕРє Рё РєР°СЂРґРёРѕ РґРѕ СЂРµР°Р±РёР»РёС‚Р°С†РёРѕРЅРЅС‹С… РїСЂРѕРіСЂР°РјРј Рё С„СѓРЅРєС†РёРѕРЅР°Р»СЊРЅРѕРіРѕ С‚СЂРµРЅРёРЅРіР°. Р‘Р»Р°РіРѕРґР°СЂСЏ РїРѕРєСЂС‹С‚РёСЋ РёР· РјСЏРіРєРѕРіРѕ РЅРµРѕРїСЂРµРЅР° РіР°РЅС‚РµР»СЊ РїСЂРёСЏС‚РЅРѕ Р»РµР¶РёС‚ РІ СЂСѓРєРµ, РЅРµ СЃРєРѕР»СЊР·РёС‚ Рё РЅРµ РЅР°С‚РёСЂР°РµС‚ РєРѕР¶Сѓ РґР°Р¶Рµ РїСЂРё РёРЅС‚РµРЅСЃРёРІРЅС‹С… РЅР°РіСЂСѓР·РєР°С…. Р’РЅСѓС‚СЂРё вЂ” РїСЂРѕС‡РЅС‹Р№ С‡СѓРіСѓРЅРЅС‹Р№ СЃРµСЂРґРµС‡РЅРёРє, РєРѕС‚РѕСЂС‹Р№ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РґРѕР»РіРѕРІРµС‡РЅРѕСЃС‚СЊ. РњР°С‚РµСЂРёР°Р» РїРѕРєСЂС‹С‚РёСЏ Р»РµРіРєРѕ РѕС‡РёС‰Р°РµС‚СЃСЏ Рё РЅРµ С†Р°СЂР°РїР°РµС‚ РїРѕР». РљРѕРјРїР°РєС‚РЅР°СЏ С„РѕСЂРјР° РґРµР»Р°РµС‚ РіР°РЅС‚РµР»СЊ СѓРґРѕР±РЅРѕР№ РґР»СЏ С…СЂР°РЅРµРЅРёСЏ. Р’РµСЃ 4 РєРі.','Р“Р°РЅС‚РµР»СЊ Demix 4 РєРі, СЃ РЅРµРѕРїСЂРµРЅРѕРІС‹Рј РїРѕРєСЂС‹С‚РёРµРј ','Demix4kgNeo.jpg','1279','Demix',0,0.00,NULL,NULL,NULL,0,'2025-11-29 16:00:00'),(14,'Р“Р°РЅС‚РµР»СЊ Demix РїРѕРґС…РѕРґРёС‚ РґР»СЏ СЂР°Р·Р»РёС‡РЅС‹С… РІРёРґРѕРІ СѓРїСЂР°Р¶РЅРµРЅРёР№: РѕС‚ СЃРёР»РѕРІС‹С… С‚СЂРµРЅРёСЂРѕРІРѕРє Рё РєР°СЂРґРёРѕ РґРѕ СЂРµР°Р±РёР»РёС‚Р°С†РёРѕРЅРЅС‹С… РїСЂРѕРіСЂР°РјРј Рё С„СѓРЅРєС†РёРѕРЅР°Р»СЊРЅРѕРіРѕ С‚СЂРµРЅРёРЅРіР°. Р‘Р»Р°РіРѕРґР°СЂСЏ РїРѕРєСЂС‹С‚РёСЋ РёР· РјСЏРіРєРѕРіРѕ РЅРµРѕРїСЂРµРЅР° РіР°РЅС‚РµР»СЊ РїСЂРёСЏС‚РЅРѕ Р»РµР¶РёС‚ РІ СЂСѓРєРµ, РЅРµ СЃРєРѕР»СЊР·РёС‚ Рё РЅРµ РЅР°С‚РёСЂР°РµС‚ РєРѕР¶Сѓ РґР°Р¶Рµ РїСЂРё РёРЅС‚РµРЅСЃРёРІРЅС‹С… РЅР°РіСЂСѓР·РєР°С…. Р’РЅСѓС‚СЂРё вЂ” РїСЂРѕС‡РЅС‹Р№ С‡СѓРіСѓРЅРЅС‹Р№ СЃРµСЂРґРµС‡РЅРёРє, РєРѕС‚РѕСЂС‹Р№ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РґРѕР»РіРѕРІРµС‡РЅРѕСЃС‚СЊ. РњР°С‚РµСЂРёР°Р» РїРѕРєСЂС‹С‚РёСЏ Р»РµРіРєРѕ РѕС‡РёС‰Р°РµС‚СЃСЏ Рё РЅРµ С†Р°СЂР°РїР°РµС‚ РїРѕР». РљРѕРјРїР°РєС‚РЅР°СЏ С„РѕСЂРјР° РґРµР»Р°РµС‚ РіР°РЅС‚РµР»СЊ СѓРґРѕР±РЅРѕР№ РґР»СЏ С…СЂР°РЅРµРЅРёСЏ. Р’РµСЃ 2 РєРі.','Р“Р°РЅС‚РµР»СЊ Demix 2 РєРі, СЃ РЅРµРѕРїСЂРµРЅРѕРІС‹Рј РїРѕРєСЂС‹С‚РёРµРј','Demix2kgNeo.jpg','799','Demix',0,0.00,NULL,NULL,NULL,0,'2025-11-25 16:00:00'),(15,'Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ Torneo РІ РѕР±РѕР»РѕС‡РєРµ РёР· РџР’РҐ. Р‘Р»Р°РіРѕРґР°СЂСЏ РѕР±РѕР»РѕС‡РєРµ СЃРЅР°СЂСЏРґ РЅРµ РїРѕСЂС‚РёС‚ РЅР°РїРѕР»СЊРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ. Р СѓРєРѕСЏС‚СЊ РѕРєСЂР°С€РµРЅР° СЃРїРµС†РёР°Р»СЊРЅРѕР№ СЌРјР°Р»СЊСЋ, РєРѕС‚РѕСЂР°СЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РёРґРµР°Р»СЊРЅРѕРµ СЃС†РµРїР»РµРЅРёРµ СЃ Р»Р°РґРѕРЅСЊСЋ. Р“РёСЂСЏ РїРѕР·РІРѕР»СЏРµС‚ Р·Р°РЅРёРјР°С‚СЊСЃСЏ 1 РёР»Рё 2 СЂСѓРєР°РјРё Рё РѕС‚Р»РёС‡РЅРѕ РїРѕРґС…РѕРґРёС‚ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ РєСЂРѕСЃСЃС„РёС‚Р°.','Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ СЃ РїРѕРєСЂС‹С‚РёРµРј РёР· РџР’РҐ Torneo, 16 РєРі','Torneo16kg.jpg','5499','Torneo',0,10.00,4949.10,'2025-12-10 23:34:00','2025-12-17 23:34:00',1,'2025-11-30 16:00:00'),(16,'Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ Torneo РІ РѕР±РѕР»РѕС‡РєРµ РёР· РџР’РҐ. Р‘Р»Р°РіРѕРґР°СЂСЏ РѕР±РѕР»РѕС‡РєРµ СЃРЅР°СЂСЏРґ РЅРµ РїРѕСЂС‚РёС‚ РЅР°РїРѕР»СЊРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ. Р СѓРєРѕСЏС‚СЊ РѕРєСЂР°С€РµРЅР° СЃРїРµС†РёР°Р»СЊРЅРѕР№ СЌРјР°Р»СЊСЋ, РєРѕС‚РѕСЂР°СЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РёРґРµР°Р»СЊРЅРѕРµ СЃС†РµРїР»РµРЅРёРµ СЃ Р»Р°РґРѕРЅСЊСЋ. Р“РёСЂСЏ РїРѕР·РІРѕР»СЏРµС‚ Р·Р°РЅРёРјР°С‚СЊСЃСЏ 1 РёР»Рё 2 СЂСѓРєР°РјРё Рё РѕС‚Р»РёС‡РЅРѕ РїРѕРґС…РѕРґРёС‚ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ РєСЂРѕСЃСЃС„РёС‚Р°.','Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ СЃ РїРѕРєСЂС‹С‚РёРµРј РёР· РџР’РҐ Torneo, 6 РєРі','Torneo6kg.jpg','2599','Torneo',0,0.00,NULL,NULL,NULL,0,'2025-12-07 16:00:00'),(17,'Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ Torneo РІ РѕР±РѕР»РѕС‡РєРµ РёР· РџР’РҐ. Р‘Р»Р°РіРѕРґР°СЂСЏ РѕР±РѕР»РѕС‡РєРµ СЃРЅР°СЂСЏРґ РЅРµ РїРѕСЂС‚РёС‚ РЅР°РїРѕР»СЊРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ. Р СѓРєРѕСЏС‚СЊ РѕРєСЂР°С€РµРЅР° СЃРїРµС†РёР°Р»СЊРЅРѕР№ СЌРјР°Р»СЊСЋ, РєРѕС‚РѕСЂР°СЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РёРґРµР°Р»СЊРЅРѕРµ СЃС†РµРїР»РµРЅРёРµ СЃ Р»Р°РґРѕРЅСЊСЋ. Р“РёСЂСЏ РїРѕР·РІРѕР»СЏРµС‚ Р·Р°РЅРёРјР°С‚СЊСЃСЏ 1 РёР»Рё 2 СЂСѓРєР°РјРё Рё РѕС‚Р»РёС‡РЅРѕ РїРѕРґС…РѕРґРёС‚ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ РєСЂРѕСЃСЃС„РёС‚Р°.','Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ СЃ РїРѕРєСЂС‹С‚РёРµРј РёР· РџР’РҐ Torneo, 4 РєРі','Torneo4kg.jpg','1899','Torneo',0,0.00,NULL,NULL,NULL,0,'2025-11-24 16:00:00'),(18,'Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ Torneo РІ РѕР±РѕР»РѕС‡РєРµ РёР· РџР’РҐ. Р‘Р»Р°РіРѕРґР°СЂСЏ РѕР±РѕР»РѕС‡РєРµ СЃРЅР°СЂСЏРґ РЅРµ РїРѕСЂС‚РёС‚ РЅР°РїРѕР»СЊРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ. Р СѓРєРѕСЏС‚СЊ РѕРєСЂР°С€РµРЅР° СЃРїРµС†РёР°Р»СЊРЅРѕР№ СЌРјР°Р»СЊСЋ, РєРѕС‚РѕСЂР°СЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РёРґРµР°Р»СЊРЅРѕРµ СЃС†РµРїР»РµРЅРёРµ СЃ Р»Р°РґРѕРЅСЊСЋ. Р“РёСЂСЏ РїРѕР·РІРѕР»СЏРµС‚ Р·Р°РЅРёРјР°С‚СЊСЃСЏ 1 РёР»Рё 2 СЂСѓРєР°РјРё Рё РѕС‚Р»РёС‡РЅРѕ РїРѕРґС…РѕРґРёС‚ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ РєСЂРѕСЃСЃС„РёС‚Р°.','Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ СЃ РїРѕРєСЂС‹С‚РёРµРј РёР· РџР’РҐ Torneo, 24 РєРі','Torneo24kg.jpg','7899','Torneo',0,0.00,NULL,NULL,NULL,0,'2025-12-01 16:00:00'),(19,'Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ Torneo РІ РѕР±РѕР»РѕС‡РєРµ РёР· РџР’РҐ. Р‘Р»Р°РіРѕРґР°СЂСЏ РѕР±РѕР»РѕС‡РєРµ СЃРЅР°СЂСЏРґ РЅРµ РїРѕСЂС‚РёС‚ РЅР°РїРѕР»СЊРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ. Р СѓРєРѕСЏС‚СЊ РѕРєСЂР°С€РµРЅР° СЃРїРµС†РёР°Р»СЊРЅРѕР№ СЌРјР°Р»СЊСЋ, РєРѕС‚РѕСЂР°СЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РёРґРµР°Р»СЊРЅРѕРµ СЃС†РµРїР»РµРЅРёРµ СЃ Р»Р°РґРѕРЅСЊСЋ. Р“РёСЂСЏ РїРѕР·РІРѕР»СЏРµС‚ Р·Р°РЅРёРјР°С‚СЊСЃСЏ 1 РёР»Рё 2 СЂСѓРєР°РјРё Рё РѕС‚Р»РёС‡РЅРѕ РїРѕРґС…РѕРґРёС‚ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ РєСЂРѕСЃСЃС„РёС‚Р°.','Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ СЃ РїРѕРєСЂС‹С‚РёРµРј РёР· РџР’РҐ Torneo, 32 РєРі','Torneo32kg.jpg','8999','Torneo',0,0.00,NULL,NULL,NULL,0,'2025-11-30 16:00:00'),(20,'Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ Torneo РІ РѕР±РѕР»РѕС‡РєРµ РёР· РџР’РҐ. Р‘Р»Р°РіРѕРґР°СЂСЏ РѕР±РѕР»РѕС‡РєРµ СЃРЅР°СЂСЏРґ РЅРµ РїРѕСЂС‚РёС‚ РЅР°РїРѕР»СЊРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ. Р СѓРєРѕСЏС‚СЊ РѕРєСЂР°С€РµРЅР° СЃРїРµС†РёР°Р»СЊРЅРѕР№ СЌРјР°Р»СЊСЋ, РєРѕС‚РѕСЂР°СЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РёРґРµР°Р»СЊРЅРѕРµ СЃС†РµРїР»РµРЅРёРµ СЃ Р»Р°РґРѕРЅСЊСЋ. Р“РёСЂСЏ РїРѕР·РІРѕР»СЏРµС‚ Р·Р°РЅРёРјР°С‚СЊСЃСЏ РѕРґРЅРѕР№ РёР»Рё РґРІСѓРјСЏ СЂСѓРєР°РјРё Рё РѕС‚Р»РёС‡РЅРѕ РїРѕРґС…РѕРґРёС‚ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ РєСЂРѕСЃСЃС„РёС‚Р°.','Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ СЃ РїРѕРєСЂС‹С‚РёРµРј РёР· РџР’РҐ Torneo, 8 РєРі','Torneo8kg.jpg','3499','Torneo',0,0.00,NULL,NULL,NULL,0,'2025-12-05 16:00:00'),(21,'Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ Torneo РІ РѕР±РѕР»РѕС‡РєРµ РёР· РџР’РҐ. Р‘Р»Р°РіРѕРґР°СЂСЏ РѕР±РѕР»РѕС‡РєРµ СЃРЅР°СЂСЏРґ РЅРµ РїРѕСЂС‚РёС‚ РЅР°РїРѕР»СЊРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ. Р СѓРєРѕСЏС‚СЊ РѕРєСЂР°С€РµРЅР° СЃРїРµС†РёР°Р»СЊРЅРѕР№ СЌРјР°Р»СЊСЋ, РєРѕС‚РѕСЂР°СЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РёРґРµР°Р»СЊРЅРѕРµ СЃС†РµРїР»РµРЅРёРµ СЃ Р»Р°РґРѕРЅСЊСЋ. Р“РёСЂСЏ РїРѕР·РІРѕР»СЏРµС‚ Р·Р°РЅРёРјР°С‚СЊСЃСЏ РѕРґРЅРѕР№ РёР»Рё РґРІСѓРјСЏ СЂСѓРєР°РјРё Рё РѕС‚Р»РёС‡РЅРѕ РїРѕРґС…РѕРґРёС‚ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёР№ РєСЂРѕСЃСЃС„РёС‚Р°.','Р§СѓРіСѓРЅРЅР°СЏ РіРёСЂСЏ СЃ РїРѕРєСЂС‹С‚РёРµРј РёР· РџР’РҐ Torneo, 12 РєРі','Torneo12kg.jpg','4299','Torneo',0,0.00,NULL,NULL,NULL,0,'2025-12-03 16:00:00'),(22,'Р§СѓРіСѓРЅРЅС‹Р№ РґРёСЃРє KETTLER СЃ СЂРµР·РёРЅРѕРІС‹Рј РїРѕРєСЂС‹С‚РёРµРј вЂ” РёРґРµР°Р»СЊРЅС‹Р№ РёРЅСЃС‚СЂСѓРјРµРЅС‚ РґР»СЏ СЌС„С„РµРєС‚РёРІРЅС‹С… Рё РєРѕРјС„РѕСЂС‚РЅС‹С… С‚СЂРµРЅРёСЂРѕРІРѕРє СЃРѕ СЃРІРѕР±РѕРґРЅС‹РјРё РІРµСЃР°РјРё. РџСЂРѕСЂРµР·РёРЅРµРЅРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ РґРµР»Р°РµС‚ РґРёСЃРє СѓСЃС‚РѕР№С‡РёРІС‹Рј Рє СЂР¶Р°РІС‡РёРЅРµ, СЃРЅРёР¶Р°РµС‚ С€СѓРј РїСЂРё РїР°РґРµРЅРёРё Рё РїСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ РїРѕСЏРІР»РµРЅРёРµ С†Р°СЂР°РїРёРЅ РЅР° РїРѕР»Сѓ. Р‘Р»Р°РіРѕРґР°СЂСЏ РЅР°Р»РёС‡РёСЋ СЂСѓС‡РµРє РґРёСЃРє РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РєР°Рє РіР°РЅС‚РµР»СЊ. РљРѕР»СЊС†Рѕ РёР· РЅРµСЂР¶Р°РІРµСЋС‰РµР№ СЃС‚Р°Р»Рё РѕР±РµСЃРїРµС‡РёРІР°РµС‚ Р»РµРіРєСѓСЋ СѓСЃС‚Р°РЅРѕРІРєСѓ РЅР° РіСЂРёС„С‹ РґРёР°РјРµС‚СЂРѕРј 30 РјРј. РџРѕСЃР°РґРѕС‡РЅС‹Р№ РґРёР°РјРµС‚СЂ РґРёСЃРєР° 31 РјРј. Р’РµСЃ РґРёСЃРєР° 2.5 РєРі.','Р”РёСЃРє СЃС‚Р°Р»СЊРЅРѕР№ РѕР±СЂРµР·РёРЅРµРЅРЅС‹Р№ KETTLER, 2.5 РєРі','KETTLER2.5kg.jpg','1199','KETTLER',0,0.00,NULL,NULL,NULL,0,'2025-12-03 16:00:00'),(23,'Р§СѓРіСѓРЅРЅС‹Р№ РґРёСЃРє KETTLER СЃ СЂРµР·РёРЅРѕРІС‹Рј РїРѕРєСЂС‹С‚РёРµРј вЂ” РёРґРµР°Р»СЊРЅС‹Р№ РёРЅСЃС‚СЂСѓРјРµРЅС‚ РґР»СЏ СЌС„С„РµРєС‚РёРІРЅС‹С… Рё РєРѕРјС„РѕСЂС‚РЅС‹С… С‚СЂРµРЅРёСЂРѕРІРѕРє СЃРѕ СЃРІРѕР±РѕРґРЅС‹РјРё РІРµСЃР°РјРё. РџСЂРѕСЂРµР·РёРЅРµРЅРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ РґРµР»Р°РµС‚ РґРёСЃРє СѓСЃС‚РѕР№С‡РёРІС‹Рј Рє СЂР¶Р°РІС‡РёРЅРµ, СЃРЅРёР¶Р°РµС‚ С€СѓРј РїСЂРё РїР°РґРµРЅРёРё Рё РїСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ РїРѕСЏРІР»РµРЅРёРµ С†Р°СЂР°РїРёРЅ РЅР° РїРѕР»Сѓ. Р‘Р»Р°РіРѕРґР°СЂСЏ РЅР°Р»РёС‡РёСЋ СЂСѓС‡РµРє РґРёСЃРє РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РєР°Рє РіР°РЅС‚РµР»СЊ. РљРѕР»СЊС†Рѕ РёР· РЅРµСЂР¶Р°РІРµСЋС‰РµР№ СЃС‚Р°Р»Рё РѕР±РµСЃРїРµС‡РёРІР°РµС‚ Р»РµРіРєСѓСЋ СѓСЃС‚Р°РЅРѕРІРєСѓ РЅР° РіСЂРёС„С‹ РґРёР°РјРµС‚СЂРѕРј 30 РјРј. РџРѕСЃР°РґРѕС‡РЅС‹Р№ РґРёР°РјРµС‚СЂ РґРёСЃРєР° 31 РјРј. Р’РµСЃ РґРёСЃРєР° 5 РєРі.','Р”РёСЃРє СЃС‚Р°Р»СЊРЅРѕР№ РѕР±СЂРµР·РёРЅРµРЅРЅС‹Р№ KETTLER, 5 РєРі','KETTLER5kg.jpg','2299','KETTLER',0,0.00,NULL,NULL,NULL,0,'2025-11-28 16:00:00'),(24,'Р§СѓРіСѓРЅРЅС‹Р№ РґРёСЃРє KETTLER СЃ СЂРµР·РёРЅРѕРІС‹Рј РїРѕРєСЂС‹С‚РёРµРј вЂ” РёРґРµР°Р»СЊРЅС‹Р№ РёРЅСЃС‚СЂСѓРјРµРЅС‚ РґР»СЏ СЌС„С„РµРєС‚РёРІРЅС‹С… Рё РєРѕРјС„РѕСЂС‚РЅС‹С… С‚СЂРµРЅРёСЂРѕРІРѕРє СЃРѕ СЃРІРѕР±РѕРґРЅС‹РјРё РІРµСЃР°РјРё. РџСЂРѕСЂРµР·РёРЅРµРЅРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ РґРµР»Р°РµС‚ РґРёСЃРє СѓСЃС‚РѕР№С‡РёРІС‹Рј Рє СЂР¶Р°РІС‡РёРЅРµ, СЃРЅРёР¶Р°РµС‚ С€СѓРј РїСЂРё РїР°РґРµРЅРёРё Рё РїСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ РїРѕСЏРІР»РµРЅРёРµ С†Р°СЂР°РїРёРЅ РЅР° РїРѕР»Сѓ. Р‘Р»Р°РіРѕРґР°СЂСЏ РЅР°Р»РёС‡РёСЋ СЂСѓС‡РµРє РґРёСЃРє РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РєР°Рє РіР°РЅС‚РµР»СЊ. РљРѕР»СЊС†Рѕ РёР· РЅРµСЂР¶Р°РІРµСЋС‰РµР№ СЃС‚Р°Р»Рё РѕР±РµСЃРїРµС‡РёРІР°РµС‚ Р»РµРіРєСѓСЋ СѓСЃС‚Р°РЅРѕРІРєСѓ РЅР° РіСЂРёС„С‹ РґРёР°РјРµС‚СЂРѕРј 30 РјРј. РџРѕСЃР°РґРѕС‡РЅС‹Р№ РґРёР°РјРµС‚СЂ РґРёСЃРєР° 31 РјРј. Р’РµСЃ РґРёСЃРєР° 10 РєРі.','Р”РёСЃРє СЃС‚Р°Р»СЊРЅРѕР№ РѕР±СЂРµР·РёРЅРµРЅРЅС‹Р№ KETTLER, 10 РєРі','KETTLER10kg.jpg','3999','KETTLER',0,0.00,NULL,NULL,NULL,0,'2025-12-03 16:00:00'),(25,'Р§СѓРіСѓРЅРЅС‹Р№ РґРёСЃРє KETTLER СЃ СЂРµР·РёРЅРѕРІС‹Рј РїРѕРєСЂС‹С‚РёРµРј вЂ” РёРґРµР°Р»СЊРЅС‹Р№ РёРЅСЃС‚СЂСѓРјРµРЅС‚ РґР»СЏ СЌС„С„РµРєС‚РёРІРЅС‹С… Рё РєРѕРјС„РѕСЂС‚РЅС‹С… С‚СЂРµРЅРёСЂРѕРІРѕРє СЃРѕ СЃРІРѕР±РѕРґРЅС‹РјРё РІРµСЃР°РјРё. РџСЂРѕСЂРµР·РёРЅРµРЅРЅРѕРµ РїРѕРєСЂС‹С‚РёРµ РґРµР»Р°РµС‚ РґРёСЃРє СѓСЃС‚РѕР№С‡РёРІС‹Рј Рє СЂР¶Р°РІС‡РёРЅРµ, СЃРЅРёР¶Р°РµС‚ С€СѓРј РїСЂРё РїР°РґРµРЅРёРё Рё РїСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ РїРѕСЏРІР»РµРЅРёРµ С†Р°СЂР°РїРёРЅ РЅР° РїРѕР»Сѓ. Р‘Р»Р°РіРѕРґР°СЂСЏ РЅР°Р»РёС‡РёСЋ СЂСѓС‡РµРє РґРёСЃРє РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РєР°Рє РіР°РЅС‚РµР»СЊ. РљРѕР»СЊС†Рѕ РёР· РЅРµСЂР¶Р°РІРµСЋС‰РµР№ СЃС‚Р°Р»Рё РѕР±РµСЃРїРµС‡РёРІР°РµС‚ Р»РµРіРєСѓСЋ СѓСЃС‚Р°РЅРѕРІРєСѓ РЅР° РіСЂРёС„С‹ РґРёР°РјРµС‚СЂРѕРј 30 РјРј. РџРѕСЃР°РґРѕС‡РЅС‹Р№ РґРёР°РјРµС‚СЂ РґРёСЃРєР° 31 РјРј. Р’РµСЃ РґРёСЃРєР° 1.25 РєРі.','Р”РёСЃРє СЃС‚Р°Р»СЊРЅРѕР№ РѕР±СЂРµР·РёРЅРµРЅРЅС‹Р№ KETTLER 1.25 РєРі','1765203904220_KETTLER1.25kg.jpg','399','KETTLER',0,0.00,NULL,NULL,NULL,0,'2025-11-26 16:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,8,2,3,'РќРѕСЂРјР°Р»СЊРЅР°СЏ РіР°РЅС‚РµР»СЊ','2025-12-07 16:18:13'),(2,8,14,5,'РљСЂСѓС‚Р°СЏ РіР°РЅС‚РµР»СЊ','2025-12-07 17:05:24'),(3,8,15,5,'РћС‚Р»РёС‡РЅР°СЏ РіР°РЅС‚РµР»СЊ','2025-12-07 17:48:29'),(4,9,2,4,'РќРµРїР»РѕС…Р°СЏ РіР°РЅС‚РµР»СЊ','2025-12-08 14:42:39');
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
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_cart`
--

LOCK TABLES `shopping_cart` WRITE;
/*!40000 ALTER TABLE `shopping_cart` DISABLE KEYS */;
INSERT INTO `shopping_cart` VALUES (61,2,8,1),(62,2,9,1),(63,2,16,1);
/*!40000 ALTER TABLE `shopping_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'GameCenter'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11 14:42:42

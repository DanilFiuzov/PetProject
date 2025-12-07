-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: gamecenter
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesandproducts`
--

LOCK TABLES `categoriesandproducts` WRITE;
/*!40000 ALTER TABLE `categoriesandproducts` DISABLE KEYS */;
INSERT INTO `categoriesandproducts` VALUES (23,1,8),(24,4,8),(25,1,9),(26,4,9),(27,1,10),(28,4,10),(29,1,11),(30,4,11),(31,1,12),(32,4,12),(33,1,13),(34,4,13),(35,1,14),(36,4,14),(3,2,15),(4,4,15),(5,2,16),(6,4,16),(7,2,17),(8,4,17),(9,2,18),(10,4,18),(11,2,19),(12,4,19),(13,2,20),(14,4,20),(15,2,21),(16,4,21),(17,3,22),(18,4,22),(19,3,23),(20,4,23),(21,3,24),(22,4,24);
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
  PRIMARY KEY (`customerID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('User','danil228lol12@mail.ru',2,'/images/Avatars/Avatar5.jpg','$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im'),('PUPA','sbiktobirov@gmail.com',3,'/images/Avatars/Thumbnail_1.jpg','$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.'),('test','test@mail.ru',13,'/images/Avatars/Thumbnail_2.png','$2b$10$3adq0qU2ERtfS9UGam5dbO/E6AZtofnqR3BpHO4he1dKj86p/804.'),('van_dam_0','van_dam_0@mail.ru',14,'/images/Avatars/Avatar2.jpg','$2b$10$F8iOEtJpzQv/ekGLRMGAN..icED0M.VkAurj.Ox6AUsK24gwRIkyG');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (6,8,2),(7,19,2),(8,21,2),(9,24,2);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
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
  PRIMARY KEY (`productID`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (8,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях. Нескользящее неопреновое покрытие обеспечивает надежный хват гантелей во время занятий и амортизацию при соприкосновении с полом.','Гантель Demix, 2 кг','Demix2kg.jpg','799','Demix',4),(9,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 0.5 кг','Demix0.5kg.jpg','299','Demix',0),(10,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях. Нескользящее неопреновое покрытие обеспечивает надежный хват гантелей во время занятий и амортизацию при соприкосновении с полом.','Гантель Demix, 3 кг','Demix3kg.jpg','1299','Demix',0),(11,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix 1 кг с неопреновым покрытием','Demix1kgNeo.jpg','499','Demix',0),(12,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях. Нескользящее неопреновое покрытие обеспечивает надежный хват гантелей во время занятий и амортизацию при соприкосновении с полом.','Гантель Demix, 5 кг','Demix5kg.jpg','1699','Demix',0),(13,'Гантель Demix подходит для различных видов упражнений: от силовых тренировок и кардио до реабилитационных программ и функционального тренинга. Благодаря покрытию из мягкого неопрена гантель приятно лежит в руке, не скользит и не натирает кожу даже при интенсивных нагрузках. Внутри — прочный чугунный сердечник, который обеспечивает долговечность. Материал покрытия легко очищается и не царапает пол. Компактная форма делает гантель удобной для хранения. Вес 4 кг.','Гантель Demix 4 кг, с неопреновым покрытием ','Demix4kgNeo.jpg','1279','Demix',0),(14,'Гантель Demix подходит для различных видов упражнений: от силовых тренировок и кардио до реабилитационных программ и функционального тренинга. Благодаря покрытию из мягкого неопрена гантель приятно лежит в руке, не скользит и не натирает кожу даже при интенсивных нагрузках. Внутри — прочный чугунный сердечник, который обеспечивает долговечность. Материал покрытия легко очищается и не царапает пол. Компактная форма делает гантель удобной для хранения. Вес 2 кг.','Гантель Demix 2 кг, с неопреновым покрытием','Demix2kgNeo.jpg','799','Demix',0),(15,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 16 кг','Torneo16kg.jpg','5499','Torneo',0),(16,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 6 кг','Torneo6kg.jpg','2599','Torneo',0),(17,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 4 кг','Torneo4kg.jpg','1899','Torneo',0),(18,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 24 кг','Torneo24kg.jpg','7899','Torneo',0),(19,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 32 кг','Torneo32kg.jpg','8999','Torneo',0),(20,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 8 кг','Torneo8kg.jpg','3499','Torneo',0),(21,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 12 кг','Torneo12kg.jpg','4299','Torneo',0),(22,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 2.5 кг.','Диск стальной обрезиненный KETTLER, 2.5 кг','KETTLER2.5kg.jpg','1199','KETTLER',0),(23,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 5 кг.','Диск стальной обрезиненный KETTLER, 5 кг','KETTLER5kg.jpg','2299','KETTLER',0),(24,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 10 кг.','Диск стальной обрезиненный KETTLER, 10 кг','KETTLER10kg.jpg','3999','KETTLER',0);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,8,2,3,'Нормальная гантель','2025-12-07 16:18:13'),(2,8,14,5,'Крутая гантель','2025-12-07 17:05:24');
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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_cart`
--

LOCK TABLES `shopping_cart` WRITE;
/*!40000 ALTER TABLE `shopping_cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `shopping_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'gamecenter'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-08  1:45:24

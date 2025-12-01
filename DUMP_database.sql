DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `categorieName` varchar(100) NOT NULL,
  `categorieID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`categorieID`)
) 

INSERT INTO `categories` VALUES ('Dumbbells',1);

DROP TABLE IF EXISTS `categoriesandproducts`;
CREATE TABLE `categoriesandproducts` (
  `categoriesandproductsID` int NOT NULL AUTO_INCREMENT,
  `categorieID` int NOT NULL,
  `productID` int NOT NULL,
  PRIMARY KEY (`categoriesandproductsID`,`categorieID`,`productID`),
  KEY `categoriesandproducts_products_FK` (`productID`),
  KEY `categoriesandproducts_categories_FK` (`categorieID`),
  CONSTRAINT `categoriesandproducts_categories_FK` FOREIGN KEY (`categorieID`) REFERENCES `categories` (`categorieID`),
  CONSTRAINT `categoriesandproducts_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`)
)

INSERT INTO `categoriesandproducts` VALUES (1,1,8),(2,1,9);

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `customerName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerEmail` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerID` int NOT NULL AUTO_INCREMENT,
  `customerThumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '/images/Avatars/Thumbnail_1.jpg',
  `customerPassword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `customerRank` varchar(100) DEFAULT 'Дефолтный чел',
  PRIMARY KEY (`customerID`)
) 

INSERT INTO `customers` VALUES ('User','danil228lol12@mail.ru',2,'/images/Avatars/Thumbnail_2.png','$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im','Разработчик'),('PUPA','sbiktobirov@gmail.com',3,'/images/Avatars/Thumbnail_1.jpg','$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.','Дефолтный чел'),('test','test@mail.ru',13,'/images/Avatars/Thumbnail_2.png','$2b$10$3adq0qU2ERtfS9UGam5dbO/E6AZtofnqR3BpHO4he1dKj86p/804.','Разработчик');

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `favoritesID` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `customerID` int NOT NULL,
  PRIMARY KEY (`favoritesID`,`customerID`,`productID`),
  KEY `favorites_products_FK` (`productID`),
  KEY `favorites_customers_FK` (`customerID`),
  CONSTRAINT `favorites_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  CONSTRAINT `favorites_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`)
)

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `productID` int NOT NULL AUTO_INCREMENT,
  `productDescription` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `productTitle` varchar(100) NOT NULL,
  `productThumbnail` varchar(100) NOT NULL,
  `productPrice` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `productRating` int NOT NULL DEFAULT '5',
  PRIMARY KEY (`productID`)
) 

INSERT INTO `products` VALUES (8,'dumbbells 2kg','Dumbbells Xs','dumbbells2kg.jpg','4.99',5),(9,'dumbbells 5kg','dumbbells Sm','dumbbells5kg.jpg','9.99',4);

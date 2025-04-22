
CREATE TABLE `customers` (
  `customerName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerEmail` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerID` int NOT NULL AUTO_INCREMENT,
  `customerThumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '/images/Avatars/Thumbnail_1.jpg',
  `customerPassword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `customerRank` varchar(100) DEFAULT 'Дефолтный чел',
  PRIMARY KEY (`customerID`)
) 
INSERT INTO `customers` VALUES ('pupa','van_dam_0@mail.ru',1,'/images/ччч.jpg','$2b$10$6C94YY/Icufm9q1Pq.kMJe6jhQmOeXYS0uPNUgwbvR9mKFZgDrErO','Дефолтный чел'),('van_dam_0','danil228lol12@mail.ru',2,'/images/Avatars/Thumbnail_4.png','$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im','Разработчик'),('PUPA','sbiktobirov@gmail.com',3,'/images/Avatars/Thumbnail_1.jpg','$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.','Дефолтный чел');

CREATE TABLE `games` (
  `gameID` int NOT NULL AUTO_INCREMENT,
  `customerID` int NOT NULL,
  `gameTitle` varchar(255) NOT NULL,
  `gameDescription` text NOT NULL,
  `gameImage` varchar(255) NOT NULL,
  `cssFile` varchar(255) DEFAULT NULL,
  `jsFile` varchar(255) DEFAULT NULL,
  `routeFile` varchar(255) DEFAULT NULL,
  `viewFile` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`gameID`),
  KEY `customerID` (`customerID`),
  CONSTRAINT `games_ibfk_1` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `games` VALUES (49,2,'кораблики','кораблики','2/images/avatar.png','/2/styles/style2.css','2/scripts/script_duo_game.js,2/scripts/script_solo_game.js,2/scripts/script_web.js','/2/routes/route.js','2/views/Duo_game.ejs,2/views/index.ejs,2/views/Solo_game.ejs');

CREATE TABLE `winandloss` (
  `wins` int DEFAULT '0',
  `losses` int DEFAULT '0',
  `customerID` int NOT NULL,
  `gameID` int NOT NULL,
  `winlossID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`winlossID`),
  KEY `winandloss_customers_FK` (`customerID`),
  KEY `winandloss_games_FK` (`gameID`),
  CONSTRAINT `winandloss_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`),
  CONSTRAINT `winandloss_games_FK` FOREIGN KEY (`gameID`) REFERENCES `games` (`gameID`)
) 


CREATE TABLE `customers` (
  `customerName` varchar(50) DEFAULT NULL,
  `customerEmail` varchar(45) DEFAULT NULL,
  `customerID` int NOT NULL AUTO_INCREMENT,
  `customerThumbnail` varchar(255) DEFAULT '/images/Avatars/Thumbnail_1.jpg',
  `customerPassword` varchar(100) NOT NULL,
  `customerRank` varchar(100) DEFAULT 'Дефолтный чел',
  PRIMARY KEY (`customerID`)
) 

INSERT INTO `customers` VALUES ('Анальный сомелье','danil228lol12@mail.ru',2,'/images/Avatars/Thumbnail_2.png','$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im','Разработчик'),('PUPA','sbiktobirov@gmail.com',3,'/images/Avatars/Thumbnail_1.jpg','$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.','Дефолтный чел'),('1','1@mail.ru',8,'/images/Avatars/Thumbnail_1.jpg','$2b$10$aD.Ky173St9SDU3JgG2dZO54ow1J3Jl/DROYeu.5NvWDWcKR.9TLO','Дефолтный чел'),('1','2@mail.ru',9,'/images/Avatars/Thumbnail_1.jpg','$2b$10$99tPDhB6BprNvho.ZMCo9ufg0397zh0TpzeGQkbrCndyUmjVUycRW','Дефолтный чел'),('2','3@mail.ru',10,'/images/Avatars/Thumbnail_1.jpg','$2b$10$dwp/il5POyWjsJmkKO3tjO.C/vH8AcrhqgEd2aZZIHt9AYYO7Jq9C','Дефолтный чел'),('1','4@mail.ru',11,'/images/Avatars/Thumbnail_1.jpg','$2b$10$Zp4AfSn8h0WagBkps1GS1uUEJyHbDEURxYcgf08k6enqd0bhIwR4W','Дефолтный чел');

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
  CONSTRAINT `games_ibfk_1` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`) ON DELETE CASCADE ON UPDATE RESTRICT
)

INSERT INTO `games` VALUES (49,2,'кораблики','кораблики','2/images/avatar.png','/2/styles/style2.css','2/scripts/script_duo_game.js,2/scripts/script_solo_game.js,2/scripts/script_web.js','/2/routes/route.js','2/views/Duo_game.ejs,2/views/index.ejs,2/views/Solo_game.ejs'),(60,2,'1','1','2/images/Logo.png','2/styles/style2.css','2/scripts/script_duo_game.js,2/scripts/script_solo_game.js,2/scripts/script_web.js','/2/routes/route.js','2/views/Solo_game.ejs');

CREATE TABLE `winandloss` (
  `wins` int DEFAULT '0',
  `losses` int DEFAULT '0',
  `customerID` int NOT NULL,
  `gameID` int NOT NULL,
  `winlossID` int NOT NULL AUTO_INCREMENT,
  `draws` int DEFAULT '0',
  `score` int DEFAULT '0',
  PRIMARY KEY (`winlossID`),
  KEY `winandloss_customers_FK` (`customerID`),
  KEY `winandloss_games_FK` (`gameID`),
  CONSTRAINT `winandloss_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `winandloss_games_FK` FOREIGN KEY (`gameID`) REFERENCES `games` (`gameID`) ON DELETE CASCADE ON UPDATE RESTRICT
) 

INSERT INTO `winandloss` VALUES (0,0,2,49,1,0,0),(0,0,8,49,6,0,0),(0,0,9,49,7,0,0),(0,0,10,49,8,0,0),(0,0,11,49,9,0,0);

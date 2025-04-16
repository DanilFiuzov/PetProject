
CREATE TABLE `customers` (
  `customerName` varchar(50) DEFAULT NULL,
  `customerEmail` varchar(45) DEFAULT NULL,
  `customerID` int NOT NULL AUTO_INCREMENT,
  `customerThumbnail` varchar(255)  DEFAULT '/images/xxx.png',
  `customerPassword` varchar(100) NOT NULL,
  `customerRank` varchar(100) DEFAULT 'Дефолтный чел',
  PRIMARY KEY (`customerID`)
)

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
)


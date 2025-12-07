CREATE TABLE `categories` (
  `categorieName` varchar(100) NOT NULL,
  `categorieID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`categorieID`)
) 

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

CREATE TABLE `customers` (
  `customerName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerEmail` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `customerID` int NOT NULL AUTO_INCREMENT,
  `customerThumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '/images/Avatars/Avatar2.jpg',
  `customerPassword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`customerID`)
) 

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

CREATE TABLE `products` (
  `productID` int NOT NULL AUTO_INCREMENT,
  `productDescription` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `productTitle` varchar(100) NOT NULL,
  `productThumbnail` varchar(100) NOT NULL,
  `productPrice` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `productManufacturer` varchar(100) NOT NULL,
  PRIMARY KEY (`productID`)
) 

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
) 

INSERT INTO `shopping_cart` VALUES (45,2,8,1);
INSERT INTO `categories` VALUES ('Dumbbells',1);
INSERT INTO `categoriesandproducts` VALUES (1,1,8),(2,1,9);
INSERT INTO `customers` VALUES ('User','danil228lol12@mail.ru',2,'/images/Avatars/Avatar5.jpg','$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im'),('PUPA','sbiktobirov@gmail.com',3,'/images/Avatars/Thumbnail_1.jpg','$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.'),('test','test@mail.ru',13,'/images/Avatars/Thumbnail_2.png','$2b$10$3adq0qU2ERtfS9UGam5dbO/E6AZtofnqR3BpHO4he1dKj86p/804.');
INSERT INTO `favorites` VALUES (6,8,2),(7,19,2),(8,21,2),(9,24,2);
INSERT INTO `products` VALUES (8,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях. Нескользящее неопреновое покрытие обеспечивает надежный хват гантелей во время занятий и амортизацию при соприкосновении с полом.','Гантель Demix, 2 кг','Demix2kg.jpg','799','Demix'),(9,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix, 0.5 кг','Demix0.5kg.jpg','299','Demix'),(10,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях. Нескользящее неопреновое покрытие обеспечивает надежный хват гантелей во время занятий и амортизацию при соприкосновении с полом.','Гантель Demix, 3 кг','Demix3kg.jpg','1299','Demix'),(11,'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.','Гантель Demix 1 кг с неопреновым покрытием','Demix1kgNeo.jpg','499','Demix'),(12,'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях. Нескользящее неопреновое покрытие обеспечивает надежный хват гантелей во время занятий и амортизацию при соприкосновении с полом.','Гантель Demix, 5 кг','Demix5kg.jpg','1699','Demix'),(13,'Гантель Demix подходит для различных видов упражнений: от силовых тренировок и кардио до реабилитационных программ и функционального тренинга. Благодаря покрытию из мягкого неопрена гантель приятно лежит в руке, не скользит и не натирает кожу даже при интенсивных нагрузках. Внутри — прочный чугунный сердечник, который обеспечивает долговечность. Материал покрытия легко очищается и не царапает пол. Компактная форма делает гантель удобной для хранения. Вес 4 кг.','Гантель Demix 4 кг, с неопреновым покрытием ','Demix4kgNeo.jpg','1279','Demix'),(14,'Гантель Demix подходит для различных видов упражнений: от силовых тренировок и кардио до реабилитационных программ и функционального тренинга. Благодаря покрытию из мягкого неопрена гантель приятно лежит в руке, не скользит и не натирает кожу даже при интенсивных нагрузках. Внутри — прочный чугунный сердечник, который обеспечивает долговечность. Материал покрытия легко очищается и не царапает пол. Компактная форма делает гантель удобной для хранения. Вес 2 кг.','Гантель Demix 2 кг, с неопреновым покрытием','Demix2kgNeo.jpg','799','Demix'),(15,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 16 кг','Torneo16kg.jpg','5499','Torneo'),(16,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 6 кг','Torneo6kg.jpg','2599','Torneo'),(17,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 4 кг','Torneo4kg.jpg','1899','Torneo'),(18,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 24 кг','Torneo24kg.jpg','7899','Torneo'),(19,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 32 кг','Torneo32kg.jpg','8999','Torneo'),(20,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 8 кг','Torneo8kg.jpg','3499','Torneo'),(21,'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.','Чугунная гиря с покрытием из ПВХ Torneo, 12 кг','Torneo12kg.jpg','4299','Torneo'),(22,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 2.5 кг.','Диск стальной обрезиненный KETTLER, 2.5 кг','KETTLER2.5kg.jpg','1199','KETTLER'),(23,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 5 кг.','Диск стальной обрезиненный KETTLER, 5 кг','KETTLER5kg.jpg','2299','KETTLER'),(24,'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 10 кг.','Диск стальной обрезиненный KETTLER, 10 кг','KETTLER10kg.jpg','3999','KETTLER');

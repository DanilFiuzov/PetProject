-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Июн 06 2026 г., 04:43
-- Версия сервера: 10.11.14-MariaDB-0+deb12u2
-- Версия PHP: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `van_dam_0`
--

-- --------------------------------------------------------

--
-- Структура таблицы `categories`
--

CREATE TABLE `categories` (
  `categorieName` varchar(100) NOT NULL,
  `categorieDescription` text DEFAULT NULL,
  `categorieThumbnail` varchar(255) DEFAULT NULL,
  `categorieID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`categorieName`, `categorieDescription`, `categorieThumbnail`, `categorieID`) VALUES
('Гантели', 'Компактные снаряды для изолированной проработки мышц и силовых тренировок дома или в зале.', 'cat_1778336646830_Гантеля (1).png', 1),
('Гири', 'Чугунные снаряды с рукоятью для развития взрывной силы, выносливости и координации.', 'cat_1778336657270_гиря.png', 2),
('Блины', 'Сменные диски для штанги, позволяющие гибко регулировать нагрузку и прогрессировать.', 'cat_1778336598323_Диск (2).png', 3),
('Грифы', 'Прочные металлические стержни, основа для набора блинов и выполнения базовых упражнений.', 'cat_1778344028689_гриф.png', 6),
('Утяжелители', 'Манжеты, пояса и жилеты для повышения интенсивности тренировок с собственным весом.', 'cat_1778397663101_cat_1778342342152_Утяжелитель.png', 7);

-- --------------------------------------------------------

--
-- Структура таблицы `categoriesandproducts`
--

CREATE TABLE `categoriesandproducts` (
  `categoriesandproductsID` int(11) NOT NULL,
  `categorieID` int(11) NOT NULL,
  `productID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `categoriesandproducts`
--

INSERT INTO `categoriesandproducts` (`categoriesandproductsID`, `categorieID`, `productID`) VALUES
(5, 1, 3),
(8, 1, 6),
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
(32, 1, 5),
(47, 1, 4),
(51, 2, 18),
(54, 7, 19),
(55, 7, 20),
(56, 7, 21),
(63, 7, 22),
(64, 1, 2),
(65, 7, 23),
(68, 1, 7);

-- --------------------------------------------------------

--
-- Структура таблицы `customers`
--

CREATE TABLE `customers` (
  `customerName` varchar(50) DEFAULT NULL,
  `customerEmail` varchar(45) DEFAULT NULL,
  `customerID` int(11) NOT NULL,
  `customerThumbnail` varchar(255) DEFAULT '/images/Avatars/Avatar2.jpg',
  `customerPassword` varchar(100) NOT NULL,
  `customerRank` varchar(20) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `customers`
--

INSERT INTO `customers` (`customerName`, `customerEmail`, `customerID`, `customerThumbnail`, `customerPassword`, `customerRank`) VALUES
('User', 'danil228lol12@mail.ru', 2, '/images/Avatars/Avatar2.jpg', '$2b$10$MxZIE6UteU3wcmvjUspqU.7z2roSy2MwJuJONN92jQsjh0nYlX8im', 'admin'),
('PUPA', 'sbiktobirov@gmail.com', 3, '/images/Avatars/Thumbnail_1.jpg', '$2b$10$jd.ShLukC7NVDyftFeEcLOmhvvZ.h71bbV8Py54pLHKGmr/QL8qZ.', 'user'),
('test', 'test@mail.ru', 13, '/images/Avatars/Thumbnail_2.png', '$2b$10$3adq0qU2ERtfS9UGam5dbO/E6AZtofnqR3BpHO4he1dKj86p/804.', 'user'),
('van_dam_0', 'van_dam_0@mail.ru', 14, '/images/Avatars/Avatar2.jpg', '$2b$10$F8iOEtJpzQv/ekGLRMGAN..icED0M.VkAurj.Ox6AUsK24gwRIkyG', 'user'),
('User_Looser', 'van_dam_1@mail.ru', 15, '/images/Avatars/Avatar2.jpg', '$2b$10$g3uPF3Ju54TjwE9DwJ.mFOAtSblfBGvUhHEXjGoQjAMcJoKRWcuH6', 'user'),
('Perdole', '123@ia.ru', 16, '/images/Avatars/Avatar4.jpg', '$2b$10$x4KldyOiX4Zgl58rMIs/ZOmpOlpOhCZkcNh0/l65qT4LaowgZ8.J.', 'user'),
('123', '123@mail.ru', 17, '/images/Avatars/Avatar2.jpg', '$2b$10$C0/WN7p.u2FGMhpOY09/KO8FZiCWNbg4dUHnhDnIuFr3EPGWRNTja', 'user'),
('FastG', 'daniltermen228@mail.ru', 18, '/images/Avatars/Avatar3.jpg', '$2b$10$3o2OCPl3z9PsO3rVzuPCEezwL9u2UQC4M4gbp0naEAFWhKmgZI1U.', 'user'),
('Admin', 'admin@mail.ru', 19, '/images/Avatars/Avatar2.jpg', '$2b$10$aGaUGG26IrvUuEea5q2RVent0rJFzBdxpepN8z.rzhwFwWErLj1Xm', 'admin'),
('test2@mail.ru', 'test2@mail.ru', 20, '/images/Avatars/Avatar2.jpg', '$2b$10$A3INrZlzPvcTyYPNooVKCelqXRb3vejb6gPV0elkj9GEkwE9L1t4W', 'user');

-- --------------------------------------------------------

--
-- Структура таблицы `delivery_points`
--

CREATE TABLE `delivery_points` (
  `pointID` int(11) NOT NULL,
  `pointName` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `work_hours` varchar(100) DEFAULT 'Пн-Вс: 9:00-21:00',
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `delivery_points`
--

INSERT INTO `delivery_points` (`pointID`, `pointName`, `address`, `latitude`, `longitude`, `work_hours`, `phone`, `is_active`) VALUES
(1, 'Пункт выдачи №1', 'г. Москва, ул. Тверская, д. 1', 55.75580000, 37.61730000, 'Пн-Вс: 9:00-21:00', '+7 (495) 123-45-67', 1),
(2, 'Пункт выдачи №2', 'г. Москва, ул. Ленина, д. 15', 55.75220000, 37.61560000, 'Пн-Пт: 10:00-22:00, Сб-Вс: 10:00-20:00', '+7 (495) 234-56-78', 1),
(3, 'Пункт выдачи №3', 'г. Москва, пр. Мира, д. 50', 55.78310000, 37.61710000, 'Пн-Вс: 8:00-22:00', '+7 (495) 345-67-89', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `favorites`
--

CREATE TABLE `favorites` (
  `favoritesID` int(11) NOT NULL,
  `productID` int(11) NOT NULL,
  `customerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `favorites`
--

INSERT INTO `favorites` (`favoritesID`, `productID`, `customerID`) VALUES
(21, 23, 2),
(22, 21, 2),
(23, 23, 19);

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `orderID` int(11) NOT NULL,
  `customerID` int(11) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `deliveryType` enum('pickup','delivery') NOT NULL,
  `deliveryAddress` varchar(255) DEFAULT NULL,
  `deliveryPointID` int(11) DEFAULT NULL,
  `deliveryCost` decimal(10,2) DEFAULT 0.00,
  `paymentType` enum('cash','card','online') NOT NULL,
  `paymentStatus` enum('pending','paid','cancelled') DEFAULT 'pending',
  `orderStatusID` int(11) DEFAULT 1,
  `customerName` varchar(100) NOT NULL,
  `customerPhone` varchar(20) NOT NULL,
  `customerEmail` varchar(100) NOT NULL,
  `comment` text DEFAULT NULL,
  `qrCodeData` text DEFAULT NULL,
  `paymentLink` varchar(255) DEFAULT NULL,
  `orderDate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`orderID`, `customerID`, `totalAmount`, `deliveryType`, `deliveryAddress`, `deliveryPointID`, `deliveryCost`, `paymentType`, `paymentStatus`, `orderStatusID`, `customerName`, `customerPhone`, `customerEmail`, `comment`, `qrCodeData`, `paymentLink`, `orderDate`) VALUES
(1, 2, 1359.20, 'pickup', NULL, 1, 0.00, 'cash', 'pending', 1, 'User', '+7 (950) 129-15-76', 'danil228lol12@mail.ru', NULL, NULL, NULL, '2026-02-14 06:13:33'),
(2, 2, 1799.10, 'pickup', NULL, 2, 0.00, 'cash', 'pending', 1, 'User', '+7 (902) 577-14-35', 'danil228lol12@mail.ru', NULL, NULL, NULL, '2026-05-12 07:35:11'),
(3, 19, 1799.10, 'pickup', NULL, 1, 0.00, 'cash', 'pending', 1, 'Admin', '+7 (950) 089-50-51', 'admin@mail.ru', NULL, NULL, NULL, '2026-05-13 05:11:36');

-- --------------------------------------------------------

--
-- Структура таблицы `order_items`
--

CREATE TABLE `order_items` (
  `orderItemID` int(11) NOT NULL,
  `orderID` int(11) NOT NULL,
  `productID` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discountedPrice` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `order_items`
--

INSERT INTO `order_items` (`orderItemID`, `orderID`, `productID`, `quantity`, `price`, `discountedPrice`, `created_at`) VALUES
(1, 1, 7, 1, 1699.00, 1359.20, '2026-02-14 06:13:33'),
(2, 2, 23, 1, 1999.00, 1799.10, '2026-05-12 07:35:11'),
(3, 3, 23, 1, 1999.00, 1799.10, '2026-05-13 05:11:36');

-- --------------------------------------------------------

--
-- Структура таблицы `order_status`
--

CREATE TABLE `order_status` (
  `statusID` int(11) NOT NULL,
  `statusName` varchar(50) NOT NULL,
  `statusDescription` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `order_status`
--

INSERT INTO `order_status` (`statusID`, `statusName`, `statusDescription`) VALUES
(1, 'В обработке', 'Заказ принят и ожидает обработки'),
(2, 'Подтвержден', 'Заказ подтвержден менеджером'),
(3, 'Собран', 'Заказ собран и готов к выдаче/отправке'),
(4, 'В доставке', 'Заказ передан в службу доставки'),
(5, 'Доставлен', 'Заказ успешно доставлен'),
(6, 'Завершен', 'Заказ завершен и оплачен'),
(7, 'Отменен', 'Заказ отменен');

-- --------------------------------------------------------

--
-- Структура таблицы `products`
--

CREATE TABLE `products` (
  `productID` int(11) NOT NULL,
  `productDescription` varchar(500) NOT NULL,
  `productTitle` varchar(100) NOT NULL,
  `productThumbnail` varchar(100) NOT NULL,
  `productManufacturer` varchar(100) NOT NULL,
  `productRating` double NOT NULL DEFAULT 0,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `discount_start_date` datetime DEFAULT NULL,
  `discount_end_date` datetime DEFAULT NULL,
  `is_on_sale` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `productPrice` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `is_available` tinyint(1) GENERATED ALWAYS AS (`stock_quantity` > 0) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `products`
--

INSERT INTO `products` (`productID`, `productDescription`, `productTitle`, `productThumbnail`, `productManufacturer`, `productRating`, `discount_percentage`, `discount_price`, `discount_start_date`, `discount_end_date`, `is_on_sale`, `created_at`, `productPrice`, `stock_quantity`) VALUES
(2, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 2 кг', '1765446877808_Demix2kg.jpg', 'Demix', 0, 10.00, NULL, '2026-05-13 13:41:00', '2026-05-13 13:49:00', 0, '2025-12-11 01:54:37', 899.00, 15),
(3, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 0.5 кг', '1765446957700_Demix0.5kg.jpg', 'Demix', 4, 0.00, NULL, NULL, NULL, 0, '2025-12-11 01:55:57', 299.00, 10),
(4, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 5 кг', '1778305483571_Demix5kg.jpg', 'Demix', 0, 1.00, NULL, '2026-05-08 13:10:00', '2026-05-11 13:11:00', 0, '2025-12-11 01:57:00', 1899.00, 8),
(5, 'Гантель эргономичной формы со скругленными краями. Предназначена для безопасного использования и хранения в домашних условиях.', 'Гантель Demix, 3 кг', '1765447103453_Demix3kg.jpg', 'Demix', 0, 90.00, NULL, '2026-02-04 08:52:00', '2026-02-11 08:52:00', 0, '2025-12-11 01:58:23', 1499.00, 10),
(6, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 1 кг', '1765447586349_Demix1kgNeo.jpg', 'Demix', 0, 0.00, NULL, NULL, NULL, 0, '2025-12-11 02:06:26', 499.00, 10),
(7, 'Гантель эргономичной формы со скругленными краями. Нескользящее неопреновое покрытие обеспечивает надежный хват во время выполнения упражнений и амортизацию при соприкосновении с полом.', 'Гантель Demix, 4 кг', '1765447640443_Demix4kgNeo.jpg', 'Demix', 0, 0.00, NULL, NULL, NULL, 0, '2025-12-11 02:07:20', 1699.00, 9),
(8, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 2.5 кг.', 'Диск стальной обрезиненный KETTLER, 2.5 кг', '1768363395664_KETTLER2.5kg.jpg', 'KETTLER', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:03:15', 1199.00, 10),
(9, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 1.25 кг.', 'Диск стальной обрезиненный KETTLER 1.25 кг', '1768365015694_KETTLER1.25kg.jpg', 'KETTLER', 0, 99.00, NULL, '2026-01-14 12:29:00', '2026-01-21 12:29:00', 0, '2026-01-13 20:30:15', 599.00, 10),
(10, 'Прочный чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 50 мм, что делает его совместимым с олимпийскими грифами. Вес диска 10 кг.', 'Диск чугунный обрезиненный KETTLER, 51 мм, 10 кг', '1768365103083_KETTLER10kg.jpg', 'KETTLER', 0, 1.00, NULL, '2026-01-14 12:31:00', '2026-01-21 12:31:00', 0, '2026-01-13 20:31:43', 4599.00, 10),
(11, 'Чугунный диск KETTLER с резиновым покрытием — идеальный инструмент для эффективных и комфортных тренировок со свободными весами. Прорезиненное покрытие делает диск устойчивым к ржавчине, снижает шум при падении и предотвращает появление царапин на полу. Благодаря наличию ручек диск можно использовать как гантель. Кольцо из нержавеющей стали обеспечивает легкую установку на грифы диаметром 30 мм. Посадочный диаметр диска 31 мм. Вес диска 5 кг.', 'Диск стальной обрезиненный KETTLER, 5 кг', '1768365145977_KETTLER5kg.jpg', 'KETTLER', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:32:25', 2399.00, 10),
(12, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 6 кг', '1768365276715_Torneo6kg.jpg', 'Torneo', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:34:36', 2899.00, 10),
(13, '\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 8 кг', '1768365321482_Torneo8kg.jpg', 'Torneo', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:35:21', 3599.00, 10),
(14, 'Чугунная гиря Torneo весом 32 кг. Благодаря оболочке из ПВХ снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью: это обеспечивает улучшенное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 32 кг', '1768365363498_Torneo32kg.jpg', 'Torneo', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:36:03', 11999.00, 10),
(15, '\r\nЧугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 24 кг', '1768365426009_Torneo24kg.jpg', 'Torneo', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:37:06', 7999.00, 10),
(16, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься одной или двумя руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 12 кг', '1768365501689_Torneo12kg.jpg', 'Torneo', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:38:21', 4199.00, 10),
(17, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 16 кг', '1768365562855_Torneo16kg.jpg', 'Torneo', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:39:22', 5599.00, 10),
(18, 'Чугунная гиря Torneo в оболочке из ПВХ. Благодаря оболочке снаряд не портит напольное покрытие. Рукоять окрашена специальной эмалью, которая обеспечивает идеальное сцепление с ладонью. Гиря позволяет заниматься 1 или 2 руками и отлично подходит для выполнения упражнений кроссфита.', 'Чугунная гиря с покрытием из ПВХ Torneo, 4 кг', '1768365646888_Torneo4kg.jpg', 'Torneo', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:40:46', 1899.00, 3),
(19, 'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.', 'Утяжелители Demix, 2 х 0.25 кг', '1768366066417_Утяжелитель 0.25.png', 'Demix', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:47:46', 699.00, 10),
(20, 'Утяжеленный жилет весом 5 кг поможет повысить эффективность тренировок и развить выносливость. Благодаря анатомической форме гарантирован комфорт во время использования.', 'Жилет утяжеленный Demix, 5 кг', '1768366095987_Утяжелитель 5.png', 'Demix', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:48:15', 2449.00, 10),
(21, 'Набор из 2 утяжелителей от Demix. Универсальная конструкция подходит для рук и ног и позволяет увеличить нагрузку во время тренировок. Утяжелители также обеспечивают дополнительную фиксацию большого пальца руки. Модель закрепляется при помощи липучки.', 'Утяжелители Demix, 2 х 0.5 кг', '1768366193127_Утяжелитель 0.5.png', 'Demix', 0, 0.00, NULL, NULL, NULL, 0, '2026-01-13 20:49:53', 899.00, 10),
(22, 'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 1.5 кг.', 'Утяжелители Demix, 2 х 1.5 кг', '1768366235529_Утяжелитель 1.5.png', 'Demix', 0, 90.00, NULL, '2026-05-06 05:40:00', '2026-05-15 05:40:00', 0, '2026-01-13 20:50:35', 1499.00, 10),
(23, 'Сделайте свои тренировки более эффективными с набором утяжелителей от Demix. Благодаря универсальной конструкции подходит для рук и ног. Модель крепится при помощи липучки и позволяет фиксировать большой палец руки. В наборе 2 утяжелителя весом 2 кг.', 'Утяжелители Demix, 2 х 2 кг', '1778480182663_3.jpg', 'Demix', 3.5, 10.00, NULL, '2026-05-10 14:16:00', '2026-05-17 14:16:00', 0, '2026-01-13 20:51:17', 1999.00, 8);

-- --------------------------------------------------------

--
-- Структура таблицы `product_features`
--

CREATE TABLE `product_features` (
  `featureID` int(11) NOT NULL,
  `productID` int(11) NOT NULL,
  `feature_key` varchar(100) NOT NULL,
  `feature_value` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `product_features`
--

INSERT INTO `product_features` (`featureID`, `productID`, `feature_key`, `feature_value`, `created_at`) VALUES
(5, 3, 'Вес', '0.5кг', '2025-12-11 01:55:57'),
(6, 3, 'Материал', 'Чугун', '2025-12-11 01:55:57'),
(11, 6, 'Вес', '1кг', '2025-12-11 02:06:26'),
(12, 6, 'Материал', 'Чугун', '2025-12-11 02:06:26'),
(18, 8, 'Материал', 'Чугун', '2026-01-13 20:04:17'),
(19, 8, 'Вес', '2.5кг', '2026-01-13 20:04:17'),
(20, 9, 'Материал', 'Чугун', '2026-01-13 20:30:15'),
(21, 9, 'Вес', '1.25кг', '2026-01-13 20:30:15'),
(22, 10, 'Материал', 'Чугун', '2026-01-13 20:31:43'),
(23, 10, 'Вес', '10кг', '2026-01-13 20:31:43'),
(24, 11, 'Материал', 'Чугун', '2026-01-13 20:32:25'),
(25, 11, 'Вес', '5кг', '2026-01-13 20:32:25'),
(26, 12, 'Материал', 'Чугун', '2026-01-13 20:34:36'),
(27, 12, 'Вес', '6кг', '2026-01-13 20:34:36'),
(28, 13, 'Материал', 'Чугун', '2026-01-13 20:35:21'),
(29, 13, 'Вес', '8кг', '2026-01-13 20:35:21'),
(30, 14, 'Материал', 'Чугун', '2026-01-13 20:36:03'),
(31, 14, 'Вес', '32кг', '2026-01-13 20:36:03'),
(32, 15, 'Материал', 'Чугун', '2026-01-13 20:37:06'),
(33, 15, 'Вес', '24кг', '2026-01-13 20:37:06'),
(34, 16, 'Материал', 'Чугун', '2026-01-13 20:38:21'),
(35, 16, 'Вес', '12кг', '2026-01-13 20:38:21'),
(36, 17, 'Материал', 'Чугун', '2026-01-13 20:39:22'),
(37, 17, 'Вес', '16кг', '2026-01-13 20:39:22'),
(47, 5, 'Вес', '3кг', '2026-02-03 16:53:02'),
(48, 5, 'Материал', 'Чугун', '2026-02-03 16:53:02'),
(72, 4, 'Вес', '5кг', '2026-05-09 06:20:10'),
(73, 4, 'Материал', 'Чугун', '2026-05-09 06:20:10'),
(78, 18, 'Материал', 'Чугун', '2026-05-10 06:53:54'),
(79, 18, 'Вес', '4кг', '2026-05-10 06:53:54'),
(82, 19, 'Вес', '0.25кг', '2026-05-11 05:30:13'),
(83, 20, 'Вес', '5кг', '2026-05-11 05:30:31'),
(84, 21, 'Вес', '0.5кг', '2026-05-11 05:30:44'),
(91, 22, 'Вес', '1.5кг', '2026-05-13 05:39:53'),
(92, 2, 'Вес', '2кг', '2026-05-13 05:41:47'),
(93, 2, 'Материал', 'Чугун', '2026-05-13 05:41:47'),
(94, 23, 'Вес', '2кг', '2026-05-13 05:43:55'),
(97, 7, 'Вес', '4кг', '2026-06-06 04:27:45'),
(98, 7, 'Материал', 'Чугун', '2026-06-06 04:27:45');

-- --------------------------------------------------------

--
-- Структура таблицы `product_images`
--

CREATE TABLE `product_images` (
  `imageID` int(11) NOT NULL,
  `productID` int(11) NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `product_images`
--

INSERT INTO `product_images` (`imageID`, `productID`, `imageUrl`, `is_primary`, `sort_order`) VALUES
(1, 2, '1765446877808_Demix2kg.jpg', 1, 0),
(2, 3, '1765446957700_Demix0.5kg.jpg', 1, 0),
(4, 5, '1765447103453_Demix3kg.jpg', 1, 0),
(5, 6, '1765447586349_Demix1kgNeo.jpg', 1, 0),
(6, 7, '1765447640443_Demix4kgNeo.jpg', 1, 0),
(7, 8, '1768363395664_KETTLER2.5kg.jpg', 1, 0),
(8, 9, '1768365015694_KETTLER1.25kg.jpg', 1, 0),
(9, 10, '1768365103083_KETTLER10kg.jpg', 1, 0),
(10, 11, '1768365145977_KETTLER5kg.jpg', 1, 0),
(11, 12, '1768365276715_Torneo6kg.jpg', 1, 0),
(12, 13, '1768365321482_Torneo8kg.jpg', 1, 0),
(13, 14, '1768365363498_Torneo32kg.jpg', 1, 0),
(14, 15, '1768365426009_Torneo24kg.jpg', 1, 0),
(15, 16, '1768365501689_Torneo12kg.jpg', 1, 0),
(16, 17, '1768365562855_Torneo16kg.jpg', 1, 0),
(17, 18, '1768365646888_Torneo4kg.jpg', 1, 0),
(18, 19, '1768366066417_Утяжелитель 0.25.png', 1, 0),
(19, 20, '1768366095987_Утяжелитель 5.png', 1, 0),
(20, 21, '1768366193127_Утяжелитель 0.5.png', 1, 0),
(21, 22, '1768366235529_Утяжелитель 1.5.png', 1, 0),
(32, 4, '1778305483571_Demix5kg.jpg', 1, 0),
(33, 4, '1778305483571_KETTLER1.25kg.jpg', 0, 1),
(34, 4, '1778305483571_KETTLER2.5kg.jpg', 0, 2),
(41, 23, '1778480182663_3.jpg', 0, 0),
(42, 23, '1778480182663_1.jpg', 1, 1),
(43, 23, '1778480182663_2.jpg', 0, 2);

-- --------------------------------------------------------

--
-- Структура таблицы `reviews`
--

CREATE TABLE `reviews` (
  `reviewID` int(11) NOT NULL,
  `productID` int(11) NOT NULL,
  `customerID` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `reviews`
--

INSERT INTO `reviews` (`reviewID`, `productID`, `customerID`, `rating`, `comment`, `created_at`) VALUES
(1, 3, 16, 4, 'Prekol\'no 10 slov', '2026-01-13 18:42:58'),
(2, 23, 18, 5, 'Классная вещь, всем советую к покупке !!!!', '2026-05-12 07:27:58'),
(3, 23, 19, 2, 'Тестовый отзыв', '2026-05-13 05:01:05');

-- --------------------------------------------------------

--
-- Структура таблицы `shopping_cart`
--

CREATE TABLE `shopping_cart` (
  `shopping_cartID` int(11) NOT NULL,
  `customerID` int(11) NOT NULL,
  `productID` int(11) NOT NULL,
  `sc_count` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `shopping_cart`
--

INSERT INTO `shopping_cart` (`shopping_cartID`, `customerID`, `productID`, `sc_count`) VALUES
(5, 16, 7, 1),
(6, 16, 2, 1),
(29, 18, 23, 16),
(30, 19, 23, 1),
(31, 19, 2, 1),
(32, 20, 22, 1);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categorieID`);

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
-- Индексы таблицы `delivery_points`
--
ALTER TABLE `delivery_points`
  ADD PRIMARY KEY (`pointID`);

--
-- Индексы таблицы `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`favoritesID`,`customerID`,`productID`),
  ADD KEY `favorites_products_FK` (`productID`),
  ADD KEY `favorites_customers_FK` (`customerID`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderID`),
  ADD KEY `orders_customers_FK` (`customerID`),
  ADD KEY `orders_delivery_points_FK` (`deliveryPointID`),
  ADD KEY `orders_order_status_FK` (`orderStatusID`),
  ADD KEY `idx_customer_orders` (`customerID`,`orderDate`),
  ADD KEY `idx_order_status` (`orderStatusID`);

--
-- Индексы таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`orderItemID`),
  ADD KEY `order_items_orders_FK` (`orderID`),
  ADD KEY `order_items_products_FK` (`productID`),
  ADD KEY `idx_order_product` (`orderID`,`productID`);

--
-- Индексы таблицы `order_status`
--
ALTER TABLE `order_status`
  ADD PRIMARY KEY (`statusID`);

--
-- Индексы таблицы `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`productID`),
  ADD KEY `idx_productPrice` (`productPrice`);

--
-- Индексы таблицы `product_features`
--
ALTER TABLE `product_features`
  ADD PRIMARY KEY (`featureID`),
  ADD KEY `product_features_products_FK` (`productID`),
  ADD KEY `idx_product_features_key` (`feature_key`),
  ADD KEY `idx_product_features_productID` (`productID`);

--
-- Индексы таблицы `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`imageID`),
  ADD KEY `productID` (`productID`);

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
  MODIFY `categorieID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `categoriesandproducts`
--
ALTER TABLE `categoriesandproducts`
  MODIFY `categoriesandproductsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT для таблицы `customers`
--
ALTER TABLE `customers`
  MODIFY `customerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT для таблицы `delivery_points`
--
ALTER TABLE `delivery_points`
  MODIFY `pointID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoritesID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `orderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `order_items`
--
ALTER TABLE `order_items`
  MODIFY `orderItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `order_status`
--
ALTER TABLE `order_status`
  MODIFY `statusID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `products`
--
ALTER TABLE `products`
  MODIFY `productID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT для таблицы `product_features`
--
ALTER TABLE `product_features`
  MODIFY `featureID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT для таблицы `product_images`
--
ALTER TABLE `product_images`
  MODIFY `imageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT для таблицы `reviews`
--
ALTER TABLE `reviews`
  MODIFY `reviewID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `shopping_cart`
--
ALTER TABLE `shopping_cart`
  MODIFY `shopping_cartID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

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
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_customers_FK` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_delivery_points_FK` FOREIGN KEY (`deliveryPointID`) REFERENCES `delivery_points` (`pointID`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_order_status_FK` FOREIGN KEY (`orderStatusID`) REFERENCES `order_status` (`statusID`);

--
-- Ограничения внешнего ключа таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orders_FK` FOREIGN KEY (`orderID`) REFERENCES `orders` (`orderID`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`);

--
-- Ограничения внешнего ключа таблицы `product_features`
--
ALTER TABLE `product_features`
  ADD CONSTRAINT `product_features_products_FK` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Глобальный массив для хранения аватарок
let avatars = [];
// Функция для загрузки аватарок из файловой системы
const loadAvatars = () => {
    // Используйте __dirname для указания абсолютного пути к директории с аватарами
    const avatarsDir = path.join(__dirname, '../public/images/Avatars'); // Поднимаемся на уровень выше, чтобы достигнуть 'public'
    
    // Проверяем существование директории
    if (!fs.existsSync(avatarsDir)) {
        return;
    }

    fs.readdir(avatarsDir, (err, files) => {
        if (err) {
            return;
        }

        // Формируем массив аватарок
        avatars = files.map(file => ({
            url: `/images/Avatars/${file}`
        }));
    });
};
// Загружаем аватарки при запуске сервера
loadAvatars();

function extractFormFields(fields) {
    const result = {};
    
    for (const key in fields) {
        if (Array.isArray(fields[key])) {
            // Для чекбоксов берем последнее значение (checkbox имеет приоритет над hidden)
            if (key === 'is_on_sale') {
                result[key] = fields[key].includes('1') ? '1' : '0';
            } else if (fields[key].length === 1) {
                result[key] = fields[key][0];
            } else {
                result[key] = fields[key];
            }
        } else {
            result[key] = fields[key];
        }
    }
    
    // Особый случай для массивов
    if (fields['categories[]']) {
        result.categories = Array.isArray(fields['categories[]']) ? fields['categories[]'] : [fields['categories[]']];
    }
    
    if (fields['feature_keys[]'] && fields['feature_values[]']) {
        result.feature_keys = Array.isArray(fields['feature_keys[]']) ? fields['feature_keys[]'] : [fields['feature_keys[]']];
        result.feature_values = Array.isArray(fields['feature_values[]']) ? fields['feature_values[]'] : [fields['feature_values[]']];
    }
    
    return result;
}

// Главная страница с каруселью, категориями и популярными товарами
router.get('/', (req, res) => {
    // Получаем популярные товары (сортировка по рейтингу)
    const popularQuery = `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        GROUP BY p.productID
        ORDER BY p.productRating DESC
        LIMIT 8
    `;
    
    // Получаем товары со скидками для блока скидок
    const discountedQuery = `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        WHERE p.is_on_sale = 1 
        AND p.discount_percentage > 0
        AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())
        AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW())
        GROUP BY p.productID
        ORDER BY p.discount_percentage DESC
        LIMIT 6
    `;
    
    // Получаем все категории
    const categoriesQuery = 'SELECT * FROM categories ORDER BY categorieName';
    
    // Выполняем все запросы параллельно
    Promise.all([
        new Promise((resolve, reject) => {
            connection.connection.query(popularQuery, (err, results) => {
                if (err) {
                    console.error('Popular query error:', err);
                    resolve([]);
                } else {
                    const items = results.map(row => {
                        const priceInfo = connection.calculateDiscountedPrice(row);
                        const originalPrice = parseFloat(row.productPrice) || 0;
                        const discountedPrice = priceInfo.isDiscounted ? priceInfo.discountedPrice : originalPrice;
                        
                        return {
                            ...row,
                            categories: row.categories_list ? row.categories_list.split(', ') : [],
                            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
                            priceInfo: priceInfo,
                            discountedPrice: discountedPrice.toFixed(2),
                            originalPrice: originalPrice.toFixed(2),
                            discountPercentage: priceInfo.discountPercentage || 0,
                            isDiscounted: priceInfo.isDiscounted,
                            displayPrice: priceInfo.isDiscounted ? discountedPrice.toFixed(2) : originalPrice.toFixed(2)
                        };
                    });
                    resolve(items);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.connection.query(categoriesQuery, (err, results) => {
                if (err) {
                    console.error('Categories query error:', err);
                    resolve([]);
                } else {
                    resolve(results);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.connection.query(discountedQuery, (err, results) => {
                if (err) {
                    console.error('Discounted query error:', err);
                    resolve([]);
                } else {
                    const items = results.map(row => {
                        const priceInfo = connection.calculateDiscountedPrice(row);
                        const originalPrice = parseFloat(row.productPrice) || 0;
                        const discountedPrice = priceInfo.isDiscounted ? priceInfo.discountedPrice : originalPrice;
                        
                        return {
                            ...row,
                            categories: row.categories_list ? row.categories_list.split(', ') : [],
                            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
                            priceInfo: priceInfo,
                            discountedPrice: discountedPrice.toFixed(2),
                            originalPrice: originalPrice.toFixed(2),
                            discountPercentage: priceInfo.discountPercentage || 0,
                            isDiscounted: priceInfo.isDiscounted,
                            displayPrice: priceInfo.isDiscounted ? discountedPrice.toFixed(2) : originalPrice.toFixed(2)
                        };
                    });
                    resolve(items);
                }
            });
        })
    ])
    .then(([popularProducts, categories, discountedProducts]) => {
        // Берем 3 основные категории
        const mainCategories = categories.slice(0, 3);
        const otherCategoriesCount = Math.max(0, categories.length - 3);
        
        // Проверяем, вошел ли пользователь
        if (req.session.userId) {
            // Получаем избранные товары для текущего пользователя
            const getFavorites = new Promise((resolve, reject) => {
                connection.getFavoritesByCustomerID(req.session.userId, (err, favorites) => {
                    if (err) {
                        console.error('Favorites error:', err);
                        resolve([]);
                    } else {
                        resolve(favorites || []);
                    }
                });
            });
            
            // Получаем корзину
            const getCart = new Promise((resolve, reject) => {
                connection.getCartByCustomerID(req.session.userId, (err, cartItems) => {
                    if (err) {
                        console.error('Cart error:', err);
                        resolve([]);
                    } else {
                        resolve(cartItems || []);
                    }
                });
            });
            
            Promise.all([getFavorites, getCart])
                .then(([favorites, cartItems]) => {
                    // Обновляем сессию с избранными
                    req.session.favorites = favorites.map(item => item.productID);
                    
                    // Обновляем сессию с корзиной
                    req.session.cart = {};
                    cartItems.forEach(item => {
                        req.session.cart[item.productID] = { sc_count: item.sc_count };
                    });
                    
                    req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                        return total + (item.sc_count || 0);
                    }, 0);
                    
                    // Собираем все ID товаров для проверки избранного
                    const allProductIds = [
                        ...popularProducts.map(p => p.productID),
                        ...discountedProducts.map(p => p.productID)
                    ];
                    
                    // Создаем Set для быстрой проверки
                    const favoriteIdsSet = new Set(req.session.favorites);
                    
                    // Добавляем флаг isFavorite к каждому товару
                    const markFavorites = (products) => {
                        return products.map(product => ({
                            ...product,
                            isFavorite: favoriteIdsSet.has(product.productID)
                        }));
                    };
                    
                    // Отправляем данные для главной страницы
                    res.render('layout', {
                        body: 'home',
                        mainCategories: mainCategories,
                        otherCategoriesCount: otherCategoriesCount,
                        popularProducts: markFavorites(popularProducts),
                        discountedProducts: markFavorites(discountedProducts),
                        session: req.session
                    });
                })
                .catch(err => {
                    console.error('Promise error:', err);
                    // В случае ошибки показываем страницу без избранных
                    res.render('layout', {
                        body: 'home',
                        mainCategories: mainCategories,
                        otherCategoriesCount: otherCategoriesCount,
                        popularProducts: popularProducts,
                        discountedProducts: discountedProducts,
                        session: req.session
                    });
                });
        } else {
            // Если пользователь не вошел, устанавливаем пустые избранные
            req.session.favorites = [];
            req.session.cart = {};
            req.session.cartCount = 0;
            
            // Отправляем данные для главной страницы
            res.render('layout', {
                body: 'home',
                mainCategories: mainCategories,
                otherCategoriesCount: otherCategoriesCount,
                popularProducts: popularProducts,
                discountedProducts: discountedProducts,
                session: req.session
            });
            console.log(discountedProducts)
        }
    })
    .catch(err => {
        console.error('Main page error:', err);
        res.status(500).send('Ошибка при загрузке главной страницы');
    });
});

// Каталог товаров с расширенным поиском и фильтрацией
router.get('/products', (req, res) => {
    const searchQuery = req.query.search || '';
    const category = req.query.category || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 0;
    const onSale = req.query.onSale === 'true';
    const sort = req.query.sort || 'newest';
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    
    // Базовый запрос с GROUP_CONCAT для категорий
    let productsQuery = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list,
            GROUP_CONCAT(DISTINCT c.categorieID ORDER BY c.categorieID SEPARATOR ',') as categories_ids
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        WHERE 1=1
    `;
    
    let countQuery = `
        SELECT COUNT(DISTINCT p.productID) as total 
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        WHERE 1=1
    `;
    
    const queryParams = [];
    const countParams = [];
    
    // Поиск по названию, производителю, описанию ИЛИ категории
    if (searchQuery) {
        productsQuery += `
            AND (
                p.productTitle LIKE ? OR 
                p.productManufacturer LIKE ? OR 
                p.productDescription LIKE ? OR
                EXISTS (
                    SELECT 1 FROM categoriesandproducts cp2
                    JOIN categories c2 ON cp2.categorieID = c2.categorieID
                    WHERE cp2.productID = p.productID 
                    AND c2.categorieName LIKE ?
                )
            )
        `;
        countQuery += `
            AND (
                p.productTitle LIKE ? OR 
                p.productManufacturer LIKE ? OR 
                p.productDescription LIKE ? OR
                EXISTS (
                    SELECT 1 FROM categoriesandproducts cp2
                    JOIN categories c2 ON cp2.categorieID = c2.categorieID
                    WHERE cp2.productID = p.productID 
                    AND c2.categorieName LIKE ?
                )
            )
        `;
        const searchPattern = `%${searchQuery}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // Фильтр по категории
    if (category) {
        productsQuery += `
            AND EXISTS (
                SELECT 1 FROM categoriesandproducts cp2
                JOIN categories c2 ON cp2.categorieID = c2.categorieID
                WHERE cp2.productID = p.productID 
                AND c2.categorieID = ?
            )
        `;
        countQuery += `
            AND EXISTS (
                SELECT 1 FROM categoriesandproducts cp2
                JOIN categories c2 ON cp2.categorieID = c2.categorieID
                WHERE cp2.productID = p.productID 
                AND c2.categorieID = ?
            )
        `;
        queryParams.push(category);
        countParams.push(category);
    }
    
    // Фильтр по цене
    if (minPrice > 0) {
        productsQuery += ` AND p.productPrice >= ?`;
        countQuery += ` AND p.productPrice >= ?`;
        queryParams.push(minPrice);
        countParams.push(minPrice);
    }
    
    if (maxPrice > 0) {
        productsQuery += ` AND p.productPrice <= ?`;
        countQuery += ` AND p.productPrice <= ?`;
        queryParams.push(maxPrice);
        countParams.push(maxPrice);
    }
    
    // Фильтр акционных товаров
    if (onSale) {
        productsQuery += ` AND p.is_on_sale = 1 AND p.discount_percentage > 0`;
        countQuery += ` AND p.is_on_sale = 1 AND p.discount_percentage > 0`;
    }
    
    // Добавляем сортировку
    let orderBy = 'p.created_at DESC';
    switch(sort) {
        case 'newest':
            orderBy = 'p.created_at DESC, p.productID DESC';
            break;
        case 'price_asc':
            orderBy = 'CASE WHEN p.is_on_sale = 1 AND p.discount_percentage > 0 THEN p.productPrice * (1 - p.discount_percentage/100) ELSE p.productPrice END ASC';
            break;
        case 'price_desc':
            orderBy = 'CASE WHEN p.is_on_sale = 1 AND p.discount_percentage > 0 THEN p.productPrice * (1 - p.discount_percentage/100) ELSE p.productPrice END DESC';
            break;
        case 'rating':
            orderBy = 'p.productRating DESC, p.created_at DESC';
            break;
        case 'name_asc':
            orderBy = 'p.productTitle ASC';
            break;
        case 'name_desc':
            orderBy = 'p.productTitle DESC';
            break;
        case 'discount':
            orderBy = 'p.discount_percentage DESC, p.created_at DESC';
            break;
    }
    
    // Добавляем GROUP BY, сортировку и пагинацию
    productsQuery += ` GROUP BY p.productID ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Получаем список всех категорий для фильтра
    connection.connection.query('SELECT categorieID, categorieName FROM categories ORDER BY categorieName', (err, allCategories) => {
        if (err) {
            allCategories = [];
        }
        
        // Выполняем запрос на количество
        connection.connection.query(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при получении количества товаров');
            }
            
            const totalProducts = countResult[0].total;
            const totalPages = Math.ceil(totalProducts / limit);
            
            // Выполняем запрос на товары
            connection.connection.query(productsQuery, queryParams, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Ошибка при получении списка продуктов');
                }
                
                // Формируем массив продуктов с категориями и информацией о скидках
                const products = results.map(row => {
                    const priceInfo = connection.calculateDiscountedPrice(row);
                    const originalPrice = parseFloat(row.productPrice) || 0;
                    const discountedPrice = priceInfo.isDiscounted ? priceInfo.discountedPrice : originalPrice;
                    
                    return {
                        productID: row.productID,
                        productTitle: row.productTitle,
                        productThumbnail: row.productThumbnail,
                        productPrice: originalPrice,
                        productDescription: row.productDescription,
                        productManufacturer: row.productManufacturer,
                        productRating: row.productRating || 0,
                        created_at: row.created_at,
                        categories: row.categories_list ? row.categories_list.split(', ') : [],
                        categories_ids: row.categories_ids ? row.categories_ids.split(',') : [],
                        category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
                        priceInfo: priceInfo,
                        displayPrice: priceInfo.isDiscounted ? 
                            (isNaN(discountedPrice) ? originalPrice.toFixed(2) : discountedPrice.toFixed(2)) : 
                            originalPrice.toFixed(2),
                        originalPrice: originalPrice.toFixed(2),
                        discountPercentage: priceInfo.discountPercentage || 0,
                        isDiscounted: priceInfo.isDiscounted,
                        is_on_sale: row.is_on_sale,
                        discount_percentage: row.discount_percentage || 0,
                        discount_start_date: row.discount_start_date,
                        discount_end_date: row.discount_end_date
                    };
                });
                
                const productIDs = products.map(p => p.productID);
                
                // Для авторизованных пользователей загружаем избранные товары
                if (req.session.userId && productIDs.length > 0) {
                    const placeholders = productIDs.map(() => '?').join(',');
                    const favoritesQuery = `
                        SELECT productID FROM favorites 
                        WHERE customerID = ? AND productID IN (${placeholders})
                    `;
                    const favoritesParams = [req.session.userId, ...productIDs];
                    
                    connection.connection.query(favoritesQuery, favoritesParams, (favoritesErr, favoritesResults) => {
                        if (favoritesErr) {
                            favoritesResults = [];
                        }
                        
                        const favoriteIdsSet = new Set(favoritesResults.map(f => f.productID));
                        
                        connection.getCartByCustomerID(req.session.userId, (cartErr, cartItems) => {
                            if (cartErr) {
                                cartItems = [];
                            }
                            
                            req.session.cart = {};
                            cartItems.forEach(item => {
                                req.session.cart[item.productID] = { sc_count: item.sc_count };
                            });
                            
                            req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                                return total + (item.sc_count || 0);
                            }, 0);
                            
                            req.session.favorites = Array.from(favoriteIdsSet);
                            
                            res.render('layout', {
                                body: 'products',
                                products: products,
                                allCategories: allCategories,
                                session: req.session,
                                searchQuery: searchQuery,
                                category: category,
                                minPrice: minPrice,
                                maxPrice: maxPrice,
                                onSale: onSale,
                                sort: sort,
                                currentPage: page,
                                totalPages: totalPages,
                                totalProducts: totalProducts,
                                limit: limit
                            });
                        });
                    });
                } else {
                    res.render('layout', {
                        body: 'products',
                        products: products,
                        allCategories: allCategories,
                        session: req.session,
                        searchQuery: searchQuery,
                        category: category,
                        minPrice: minPrice,
                        maxPrice: maxPrice,
                        onSale: onSale,
                        sort: sort,
                        currentPage: page,
                        totalPages: totalPages,
                        totalProducts: totalProducts,
                        limit: limit
                    });
                }
            });
        });
    });
});

// Вход (GET)
router.get('/login', (req, res) => {
    res.render('layout', {body: 'login'});
});

// Вход (GET)
router.get('/register', (req, res) => {
    res.render('layout', {body: 'register'});
});

// Регистрация (POST)
router.post('/register', (req, res) => {
    const { username, password, email, confirmpassword } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    // Проверяем, что username, password и email не пустые
    if (!username || !password || !email || !confirmpassword) {
        return res.render('layout', { error: 'Заполните все поля!', body: 'register' });
    };
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!emailRegex.test(email)){
        return res.render('layout', { error: 'Неверный email!', body: 'register' });
    };
    if(password.length < 0){
        return res.render('layout', { error: 'Пароль не может быть меньше 8 символов!', body: 'register' });
    };
    if(username.length > 16){
        return res.render('layout', { error: 'Псевдоним не может быть больше 16 символов!', body: 'register' });
    };
    if(password !== confirmpassword){
        return res.render('layout', { error: "Пароли не совпадают!", body: 'register' });
    };
    connection.findUserByUsername(email, (err, results) => {
        if(Object.keys(results).length > 0){
            return res.render('layout', { error: 'Такой пользователь уже есть!', body: 'register'});
        }
        else{
            connection.createUser(username, hashedPassword, email, (err, results) => {
            if (err) {
                return res.render('layout', { error: 'Ошибка во время регистрации!', body: 'register' });
            }
            res.redirect('/');
            }); 
        }
    })   
});

// Вход (POST)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('layout', { error: 'Заполните все поля!', body: 'login' });
    }

    connection.findUserByUsername(email, (err, results) => {
        if (err) {
            return res.render('layout', { error: 'Ошибка во время авторизации.', body: 'login' });
        }

        if (results.length > 0) {
            const user = results[0];
            const isMatch = bcrypt.compareSync(password, user.customerPassword);
            if (isMatch) {
                // Сохраняем данные пользователя в сессию
                req.session.userId = user.customerID;
                req.session.userThumbnail = user.customerThumbnail;
                req.session.userEmail = user.customerEmail;
                req.session.userName = user.customerName;
                req.session.userRank = user.customerRank || 'user';

                // Загружаем избранные товары
                connection.getFavoritesByCustomerID(user.customerID, (err, favorites) => {
                    if (err) {
                    } else {
                        req.session.favorites = favorites.map(item => item.productID); // Сохраняем в сессии
                    }
                });

                // Загружаем корзину
                connection.getCartByCustomerID(user.customerID, (err, cartItems) => {
                    if (err) {
                    } else {
                        req.session.cart = {}; // Сбрасываем текущую корзину
                        cartItems.forEach(item => {
                            req.session.cart[item.productID] = { sc_count: item.sc_count }; // Сохраняем productID и количество в сессии
                        });
                    }
                    res.redirect('/'); // Перенаправляем на главную страницу
                });
            } else {
                return res.render('layout', { error: 'Неверный пароль!', body: 'login' });
            }
        } else {
            return res.render('layout', { error: 'Такого пользователя не существует.', body: 'login' });
        }
    });
});

// Добавление товара в корзину
router.post('/cart/add', (req, res) => {
    const { productID } = req.body; // Извлекаем productID из тела запроса
    const customerID = req.session.userId; // Извлекаем идентификатор пользователя из сессии

    // Проверка, авторизован ли пользователь
    if (!customerID) {
        return res.status(401).json({ success: false, message: 'Необходим вход в систему' });
    }

    // Инициализация корзины, если её ещё нет
    req.session.cart = req.session.cart || {};

    // Проверка существования товара в корзине и обновление
    if (req.session.cart[productID]) {
        req.session.cart[productID].sc_count += 1; // Увеличиваем количество товара в сессии

        // Обновляем на сервере
        connection.updateCartItem(customerID, productID, 'increase', (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Ошибка при обновлении товара в корзине' });
            }

            // Обновляем общее количество товаров в корзине
            req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                return total + (item.sc_count || 0); // Суммируем количество товаров
            }, 0);
            return res.json({ success: true, cartCount: req.session.cartCount }); // Отправляем ответ
        });
    } else {
        // Если товар добавляется впервые
        req.session.cart[productID] = { sc_count: 1 }; // Добавляем товар с количеством 1

        // Добавляем товар в базу данных
        connection.addToCart(customerID, productID, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Ошибка при добавлении товара в корзину' });
            }

            // Обновляем общее количество товаров в корзине
            req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                return total + (item.sc_count || 0); // Суммируем количество товаров
            }, 0);
            return res.json({ success: true, cartCount: req.session.cartCount }); // Отправляем ответ
        });
    }
});

// Изменение количества товара в корзине
router.post('/cart/update', (req, res) => {
    const { productID, action } = req.body; // action может принимать значения 'increase' или 'decrease'
    const customerID = req.session.userId;

    if (!customerID) {
        return res.redirect('/login'); // Перенаправление на страницу входа
    }

    if (action === 'increase') {
        // Увеличиваем количество
        connection.updateCartItem(customerID, productID, 'increase', (err) => {
            if (err) {
                return res.status(500).send('Ошибка при увеличении количества товара в корзине');
            }
        });
    } else if (action === 'decrease') {
        // Уменьшаем количество
        connection.updateCartItem(customerID, productID, 'decrease', (err) => {
            if (err) {
                return res.status(500).send('Ошибка при уменьшении количества товара в корзине');
            }
        });
    }

    res.redirect('/cart/' + customerID); // Перенаправление обратно на страницу корзины
});

// Удаление товара из корзины
router.post('/cart/remove', (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    if (!customerID) {
        return res.redirect('/login'); // Перенаправление на страницу входа
    }

    connection.removeFromCart(customerID, productID, (err) => {
        if (err) {
            return res.status(500).send('Ошибка при удалении товара из корзины');
        }
    });

    res.redirect('/cart/' + customerID); // Перенаправление обратно на страницу корзины
});

// Корзина пользователя
router.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!req.session.userId || req.session.userId != userId) {
        return res.redirect('/login');
    }

    connection.getCartWithProducts(userId, (err, products) => {
        if (err) {
            console.error('Ошибка получения корзины:', err);
            products = [];
        }
        
        res.render('layout', { 
            body: 'cart', 
            products: products, 
            session: req.session 
        });
    });
});

// Добавление товара в избранное
router.post('/favorites/add', (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    if (!customerID || !productID) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    // Сначала проверяем, не добавлен ли уже товар в избранное
    const checkQuery = 'SELECT * FROM favorites WHERE customerID = ? AND productID = ?';
    connection.connection.query(checkQuery, [customerID, productID], (checkErr, checkResults) => {
        if (checkErr) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        // Если товар уже в избранном, просто возвращаем успех
        if (checkResults.length > 0) {
            // Обновляем сессию
            if (!req.session.favorites) {
                req.session.favorites = [];
            }
            const productIdNum = parseInt(productID);
            if (!req.session.favorites.includes(productIdNum)) {
                req.session.favorites.push(productIdNum);
            }
            return res.json({ success: true, alreadyFavorited: true });
        }
        
        // Добавляем товар в избранное
        connection.addToFavorites(productID, customerID, (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error adding to favorites' });
            }

            // Обновляем массив избранных товаров в сессии
            if (!req.session.favorites) {
                req.session.favorites = [];
            }
            const productIdNum = parseInt(productID);
            if (!req.session.favorites.includes(productIdNum)) {
                req.session.favorites.push(productIdNum);
            }

            res.json({ success: true });
        });
    });
});

// Удаление товара из избранного
router.post('/favorites/remove', (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    if (!customerID || !productID) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    connection.removeFromFavorites(productID, customerID, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error removing from favorites' });
        }

        // Обновляем массив избранных товаров в сессии
        if (req.session.favorites) {
            const productIdNum = parseInt(productID);
            req.session.favorites = req.session.favorites.filter(id => id !== productIdNum);
        }

        res.json({ success: true });
    });
});

// Очистка всех избранных
router.post('/favorites/clear-all', (req, res) => {
    const customerID = req.session.userId;

    if (!customerID) {
        return res.status(401).json({ success: false, message: 'Необходим вход в систему' });
    }

    const query = 'DELETE FROM favorites WHERE customerID = ?';
    
    connection.connection.query(query, [customerID], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при очистке избранного' });
        }

        // Очищаем сессию
        if (req.session.favorites) {
            req.session.favorites = [];
        }

        res.json({ success: true, message: 'Все товары удалены из избранного' });
    });
});

// Маршрут для получения страницы избранного
router.get('/favorites', (req, res) => {
    const customerID = req.session.userId;
    if (!customerID) {
        return res.redirect('/login');
    }
    
    // Сначала получаем избранные товары из БД
    const favoritesQuery = `
        SELECT productID FROM favorites 
        WHERE customerID = ?
        ORDER BY favoritesID DESC
    `;
    
    connection.connection.query(favoritesQuery, [customerID], (err, favoriteResults) => {
        if (err) {
            console.error('Ошибка получения избранных товаров:', err);
            favoriteResults = [];
        }
        
        // Обновляем сессию актуальными данными из БД
        const favoriteIds = favoriteResults.map(f => f.productID);
        req.session.favorites = favoriteIds;
        
        // Теперь получаем детали товаров
        if (favoriteIds.length > 0) {
            const placeholders = favoriteIds.map(() => '?').join(',');
            const productsQuery = `
                SELECT p.* 
                FROM products p
                WHERE p.productID IN (${placeholders})
                ORDER BY p.productID DESC
            `;
            
            connection.connection.query(productsQuery, favoriteIds, (productsErr, products) => {
                if (productsErr) {
                    console.error('Ошибка получения товаров:', productsErr);
                    products = [];
                }
                
                // Рассчитываем скидки для каждого товара
                const processedProducts = products.map(product => {
                    const priceInfo = connection.calculateDiscountedPrice(product);
                    return {
                        ...product,
                        productPrice: parseFloat(product.productPrice) || 0,
                        priceInfo: priceInfo,
                        discountedPrice: (priceInfo.discountedPrice || parseFloat(product.productPrice) || 0).toFixed(2),
                        originalPrice: (priceInfo.originalPrice || parseFloat(product.productPrice) || 0).toFixed(2),
                        discountPercentage: priceInfo.discountPercentage || 0,
                        isDiscounted: priceInfo.isDiscounted || false
                    };
                });
                
                // Получаем категории для избранных товаров
                connection.getCategoriesForProducts(favoriteIds, (catErr, categoriesMap) => {
                    if (catErr) {
                        categoriesMap = {};
                    }
                    
                    // Добавляем категории к каждому товару
                    const productsWithCategories = processedProducts.map(product => ({
                        ...product,
                        categories: categoriesMap[product.productID] || [],
                        category: categoriesMap[product.productID] && categoriesMap[product.productID].length > 0 
                            ? categoriesMap[product.productID][0] 
                            : 'Uncategorized'
                    }));
                    
                    // Рендерим страницу
                    res.render('layout', { 
                        products: productsWithCategories, 
                        body: 'favorites',
                        session: req.session 
                    });
                });
            });
        } else {
            // Нет избранных товаров
            res.render('layout', { 
                products: [], 
                body: 'favorites',
                session: req.session 
            });
        }
    });
});

//Выход и выбор
router.post('/logoutandchange', (req, res) => {
    const logoutandchange = req.body.logoutandchange; // Получаем значение, нажатой кнопки
    const name_value = req.body.acc_label_name;
    const session_id = req.session.userId;
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }

    switch (logoutandchange) {
        case 'logout':
            res.redirect('/logout')
            break;
        case 'update':
            connection.UpdateName(name_value,session_id,(err,result) => {
                if(err){
                    res.render('layout', {global_error:"Error", body:'acc_page'})
                }
                else{
                    if(name_value.length > 16){
                        return res.render('layout',{body:'acc_page',global_error: "The nickname cannot be less than 16 characters!"})
                    }
                    else{
                        req.session.userName = name_value
                        res.redirect('/acc_page')
                    }
                }
            })
            break;
        default:
            return res.render("layout",{body:'acc_page', global_error: 'Error'})
    }
});

//Выход
router.get('/logout',(req, res) =>{
    if(req.session.userId){
        req.session.destroy(err => {
            if (err) {
                return res.render('layout', { body:games, global_error: "Ошибка при выходе"}); // Ошибка при выходе
            }
            res.redirect('/'); // Успешный выход
        });
    }
})

// Страница аккаунта пользователя
router.get('/acc_page', (req, res) => {
    const customerID = req.session.userId;
    
    if (!customerID) {
        return res.redirect('/login');
    }
    
    // Получаем данные пользователя
    const getUserData = new Promise((resolve, reject) => {
        connection.connection.query('SELECT * FROM customers WHERE customerID = ?', [customerID], (err, results) => {
            if (err || results.length === 0) {
                console.error('Ошибка получения данных пользователя:', err);
                reject(err || new Error('Пользователь не найден'));
            } else {
                resolve(results[0]);
            }
        });
    });
    
    // Получаем избранные товары
    const getFavorites = new Promise((resolve, reject) => {
        connection.getFavoritesByCustomerID(customerID, (err, favorites) => {
            if (err) {
                console.error('Favorites error:', err);
                resolve([]);
            } else {
                resolve(favorites || []);
            }
        });
    });
    
    // Получаем корзину
    const getCart = new Promise((resolve, reject) => {
        connection.getCartByCustomerID(customerID, (err, cartItems) => {
            if (err) {
                console.error('Cart error:', err);
                resolve([]);
            } else {
                resolve(cartItems || []);
            }
        });
    });
    
    // Выполняем все запросы
    Promise.all([getUserData, getFavorites, getCart])
        .then(([user, favorites, cartItems]) => {
            // Обновляем данные в сессии
            req.session.userId = user.customerID;
            req.session.userThumbnail = user.customerThumbnail;
            req.session.userEmail = user.customerEmail;
            req.session.userName = user.customerName;
            req.session.userRank = user.customerRank || 'user';
            
            // Сохраняем избранные в сессии
            req.session.favorites = favorites.map(item => item.productID);
            
            // Сохраняем корзину в сессии
            req.session.cart = {};
            cartItems.forEach(item => {
                req.session.cart[item.productID] = { sc_count: item.sc_count };
            });
            
            // Подсчитываем количество товаров в корзине
            req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                return total + (item.sc_count || 0);
            }, 0);
            
            // Рендерим страницу аккаунта
            res.render('layout', {
                body: 'acc_page',
                session: req.session,
                user: user, // передаем объект пользователя
                favoritesCount: req.session.favorites.length,
                cartCount: req.session.cartCount
            });
        })
        .catch(err => {
            console.error('Account page error:', err);
            res.redirect('/login');
        });
});

//Выбор аватарки
router.get('/select_thumbnail',(req,res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    res.render('layout',{ body: 'select_avatar', avatars: avatars})
})

//Замена аватарки
router.post('/upload', async (req, res) => {
    const session_id = req.session.userId;  
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    const avatarId = req.body.avatar; // Получаем ID выбранного аватара
    const avatar = avatars[avatarId].url;

    connection.UpdateAvatar(avatar,session_id ,(err,result) => {
        if(err){
            return res.render('layout', { error: 'Error', body: 'acc_page'});
        }
        else{
            req.session.userThumbnail = avatar
            res.redirect('/acc_page')
        }
    })
});

// Получение отзывов для продукта
router.get('/api/reviews/:productID', (req, res) => {
    const { productID } = req.params;
    
    connection.getProductReviews(productID, (err, reviews) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        connection.getReviewStats(productID, (errStats, stats) => {
            if (errStats) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ reviews, stats });
        });
    });
});

// Проверка, оставлял ли пользователь отзыв
router.get('/api/reviews/:productID/check', (req, res) => {
    const { productID } = req.params;
    const customerID = req.session.userId; // userId в сессии = customerID в БД
    
    if (!customerID) {
        return res.json({ hasReviewed: false });
    }
    
    connection.hasUserReviewed(productID, customerID, (err, hasReviewed) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ hasReviewed });
    });
});

// Добавление нового отзыва
router.post('/api/reviews', (req, res) => {
    const { productID, rating, comment } = req.body;
    const customerID = req.session.userId; // userId в сессии = customerID в БД
    
    if (!customerID) {
        return res.status(401).json({ error: 'Not authorized' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid rating' });
    }
    
    if (!comment || comment.trim().length < 10) {
        return res.status(400).json({ error: 'Comment must be at least 10 characters' });
    }
    
    connection.addReview(productID, customerID, rating, comment.trim(), (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'You have already reviewed this product' });
            }
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Обновленный маршрут для страницы товара
router.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    
    connection.getProductByID(productId, (err, product) => {
        if (err || !product) {
            return res.status(404).send('Товар не найден');
        }
        
        // Получаем информацию о скидке
        const priceInfo = connection.calculateDiscountedPrice(product);
        
        // Преобразуем цены
        if (typeof product.productPrice === 'string') {
            product.productPrice = parseFloat(product.productPrice);
        }
        
        // Получаем категории товара
        const categoryQuery = `
            SELECT c.categorieName 
            FROM categories c
            JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
            WHERE cp.productID = ?
        `;
        
        connection.connection.query(categoryQuery, [productId], (categoryErr, categoryResults) => {
            if (categoryErr) {
                return res.status(500).send('Ошибка получения категорий товара');
            }
            
            const categories = categoryResults.map(cat => cat.categorieName);
            
            // Получаем характеристики товара
            connection.getProductFeatures(productId, (featuresErr, features) => {
                if (featuresErr) {
                    features = [];
                }
                
                // Получаем отзывы
                connection.getProductReviews(productId, (reviewsErr, reviews) => {
                    if (reviewsErr) {
                        reviews = [];
                    }
                    
                    // Получаем статистику отзывов
                    connection.getReviewStats(productId, (statsErr, stats) => {
                        const statsMap = {
                            5: { count: 0, percentage: 0 },
                            4: { count: 0, percentage: 0 },
                            3: { count: 0, percentage: 0 },
                            2: { count: 0, percentage: 0 },
                            1: { count: 0, percentage: 0 }
                        };
                        
                        if (!statsErr && stats && stats.length > 0) {
                            stats.forEach(stat => {
                                if (stat.rating >= 1 && stat.rating <= 5) {
                                    statsMap[stat.rating] = {
                                        count: stat.count || 0,
                                        percentage: stat.percentage || 0
                                    };
                                }
                            });
                        }
                        
                        // Рассчитываем общий рейтинг, если его нет
                        const overallRating = product.productRating || 
                            (reviews.length > 0 ? 
                                reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 
                                0);
                        
                        // Проверяем, оставлял ли пользователь отзыв
                        if (req.session.userId) {
                            connection.hasUserReviewed(productId, req.session.userId, (checkErr, result) => {
                                if (checkErr) {
                                    result = false;
                                }
                                
                                // Рендерим страницу с данными
                                res.render('layout', {
                                    product: {
                                        ...product,
                                        categories: categories,
                                        productRating: overallRating,
                                        priceInfo: priceInfo,
                                        discountedPrice: priceInfo.discountedPrice.toFixed(2),
                                        originalPrice: priceInfo.originalPrice.toFixed(2),
                                        discountPercentage: priceInfo.discountPercentage,
                                        isDiscounted: priceInfo.isDiscounted
                                    },
                                    features: features || [],
                                    reviews: reviews || [],
                                    reviewStats: statsMap,
                                    hasReviewed: !!result,
                                    overallRating: overallRating,
                                    session: req.session,
                                    body: 'product'
                                });
                            });
                        } else {
                            // Пользователь не авторизован
                            res.render('layout', {
                                product: {
                                    ...product,
                                    categories: categories,
                                    productRating: overallRating,
                                    priceInfo: priceInfo,
                                    discountedPrice: priceInfo.discountedPrice.toFixed(2),
                                    originalPrice: priceInfo.originalPrice.toFixed(2),
                                    discountPercentage: priceInfo.discountPercentage,
                                    isDiscounted: priceInfo.isDiscounted
                                },
                                features: features || [],
                                reviews: reviews || [],
                                reviewStats: statsMap,
                                hasReviewed: false,
                                overallRating: overallRating,
                                session: req.session,
                                body: 'product'
                            });
                        }
                    });
                });
            });
        });
    });
});

// Проверка администратора (middleware)
const checkAdmin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    connection.getUserRank(req.session.userId, (err, results) => {
        if (err) {
            return res.status(500).send('Ошибка проверки прав доступа');
        }
        
        if (results.length > 0 && results[0].customerRank === 'admin') {
            next();
        } else {
            res.status(403).render('layout', { 
                body: 'error',
                error: 'Доступ запрещен. Требуются права администратора.'
            });
        }
    });
};

// Страница добавления товара (GET)
router.get('/admin/add-product', checkAdmin, (req, res) => {
    // Получаем список категорий для формы
    const query = 'SELECT categorieID, categorieName FROM categories ORDER BY categorieName';
    connection.connection.query(query, (err, categories) => {
        if (err) {
            categories = [];
        }
        
        res.render('layout', {
            body: 'add_product',
            session: req.session,
            categories: categories
        });
    });
});

// Добавление товара (POST)
router.post('/admin/add-product', checkAdmin, (req, res) => {
    const formidable = require('formidable');
    const form = new formidable.IncomingForm();
    const uploadDir = path.join(__dirname, '../public/images/products');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.maxFileSize = 5 * 1024 * 1024;
    
    // В POST /admin/add-product исправьте этот участок кода:

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parsing error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка загрузки файла' 
            });
        }
        
        // 1. Обработка файла изображения
        let productThumbnail = '';
        let hasImageError = false;
        
        try {
            if (files.productImage) {
                let productImageFile;
                
                // Определяем структуру файла
                if (Array.isArray(files.productImage)) {
                    productImageFile = files.productImage[0];
                } else if (files.productImage.originalFilename) {
                    productImageFile = files.productImage;
                } else {
                    productImageFile = files.productImage;
                }
                
                // Проверяем, что файл существует и имеет размер
                if (productImageFile && productImageFile.size > 0 && productImageFile.filepath) {
                    const oldPath = productImageFile.filepath;
                    const newFileName = `${Date.now()}_${productImageFile.originalFilename || 'product.jpg'}`;
                    const newPath = path.join(uploadDir, newFileName);
                    
                    if (fs.existsSync(oldPath)) {
                        fs.renameSync(oldPath, newPath);
                        productThumbnail = newFileName;
                    } else {
                        console.error('Source file does not exist:', oldPath);
                        hasImageError = true;
                    }
                } else {
                    console.error('Invalid file object:', {
                        size: productImageFile?.size,
                        filepath: productImageFile?.filepath
                    });
                    hasImageError = true;
                }
            } else {
                console.error('No productImage in files object');
                hasImageError = true;
            }
        } catch (fileError) {
            console.error('File processing error:', fileError);
            hasImageError = true;
        }
        
        if (hasImageError || !productThumbnail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ошибка при обработке изображения. Убедитесь, что файл загружен и имеет допустимый формат (JPG, PNG).' 
            });
        }
        
        // 2. Обработка поля is_on_sale - ДОБАВЬТЕ ЭТУ ЧАСТЬ!
        let isOnSale = '0';
        if (fields.is_on_sale) {
            if (Array.isArray(fields.is_on_sale)) {
                isOnSale = fields.is_on_sale.includes('1') ? '1' : '0';
            } else {
                isOnSale = fields.is_on_sale === '1' ? '1' : '0';
            }
        }
        
        // 3. Проверка обязательных полей
        if (!fields.productTitle || !fields.productManufacturer || 
            !fields.productDescription || !fields.productPrice) {
            return res.status(400).json({ 
                success: false, 
                message: 'Заполните все обязательные поля' 
            });
        }
        
        // 4. Подготовка данных товара
        const productData = {
            productTitle: Array.isArray(fields.productTitle) ? fields.productTitle[0] : fields.productTitle,
            productManufacturer: Array.isArray(fields.productManufacturer) ? fields.productManufacturer[0] : fields.productManufacturer,
            productDescription: Array.isArray(fields.productDescription) ? fields.productDescription[0] : fields.productDescription,
            productPrice: parseFloat(Array.isArray(fields.productPrice) ? fields.productPrice[0] : fields.productPrice),
            productThumbnail: productThumbnail,
            is_on_sale: isOnSale // Теперь переменная определена!
        };
        
        // 5. Данные скидки только если включена
        if (isOnSale === '1') {
            if (fields.discount_percentage) {
                productData.discount_percentage = parseFloat(
                    Array.isArray(fields.discount_percentage) ? fields.discount_percentage[0] : fields.discount_percentage
                );
            }
            
            if (fields.discount_start_date) {
                productData.discount_start_date = Array.isArray(fields.discount_start_date) ? 
                    fields.discount_start_date[0] : fields.discount_start_date;
            }
            
            if (fields.discount_end_date) {
                productData.discount_end_date = Array.isArray(fields.discount_end_date) ? 
                    fields.discount_end_date[0] : fields.discount_end_date;
            }
        }
        
        // 6. Обработка категорий
        let categories = [];
        if (fields['categories[]']) {
            categories = Array.isArray(fields['categories[]']) ? fields['categories[]'] : [fields['categories[]']];
        }
        
        // 7. Обработка характеристик
        const features = [];
        if (fields['feature_keys[]'] && fields['feature_values[]']) {
            const keys = Array.isArray(fields['feature_keys[]']) ? fields['feature_keys[]'] : [fields['feature_keys[]']];
            const values = Array.isArray(fields['feature_values[]']) ? fields['feature_values[]'] : [fields['feature_values[]']];
            
            keys.forEach((key, index) => {
                if (key && key.trim() && values[index] && values[index].trim()) {
                    features.push({
                        key: key.trim(),
                        value: values[index].trim()
                    });
                }
            });
        }
        
        // 8. Добавление товара в БД
        connection.addProductWithFeatures(productData, categories, features, (err, productID) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Ошибка базы данных: ' + err.message 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Товар успешно добавлен', 
                productID: productID 
            });
        });
    });
});

// Страница редактирования товара (GET)
router.get('/admin/edit-product/:id', checkAdmin, (req, res) => {
    const productId = req.params.id;
    
    // Получаем информацию о товаре
    connection.getProductByID(productId, (err, product) => {
        if (err || !product) {
            return res.status(404).send('Товар не найден');
        }
        
        // Получаем категории товара
        const categoryQuery = `
            SELECT c.categorieName
            FROM categories c
            JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
            WHERE cp.productID = ?
        `;

        connection.connection.query(categoryQuery, [productId], (categoryErr, categoryResults) => {
            if (categoryErr) {
                return res.status(500).send('Ошибка получения категорий');
            }
            
            const currentCategories = categoryResults.map(cat => cat.categorieName);
            
            // Получаем характеристики товара - ИСПРАВЬТЕ ЭТОТ ВЫЗОВ!
            connection.getProductFeatures(productId, (featuresErr, features) => {
                if (featuresErr) {
                    features = [];
                }
                
                // Рендерим страницу с данными
                res.render('layout', {
                    body: 'edit_product',
                    product: product,
                    currentCategories: currentCategories,
                    features: features || [], // Гарантируем, что features будет массивом
                    session: req.session
                });
            });
        });
    });
});

// Обновление товара (POST)
router.post('/admin/update-product', checkAdmin, (req, res) => {
    const formidable = require('formidable');
    const form = new formidable.IncomingForm();
    const uploadDir = path.join(__dirname, '../public/images/products');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.allowEmptyFiles = true;
    form.minFileSize = 0;
    form.maxFileSize = 10 * 1024 * 1024;
    
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parsing error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка при обработке формы' 
            });
        }
        
        
        // 1. Получаем productID
        const productID = Array.isArray(fields.productID) ? fields.productID[0] : fields.productID;
        
        if (!productID) {
            return res.status(400).json({ 
                success: false, 
                message: 'Не указан ID товара' 
            });
        }
        
        // 2. Обработка поля is_on_sale
        // Логируем полученные данные для отладки
        console.log('fields.is_on_sale:', fields.is_on_sale);
        console.log('Type:', Array.isArray(fields.is_on_sale) ? 'Array' : typeof fields.is_on_sale);
        
        // Обработка is_on_sale
        let isOnSale = '0';
        if (fields.is_on_sale) {
            if (Array.isArray(fields.is_on_sale)) {
                console.log('Array values:', fields.is_on_sale);
                isOnSale = fields.is_on_sale.includes('1') ? '1' : '0';
            } else {
                isOnSale = fields.is_on_sale === '1' ? '1' : '0';
            }
        }
        
        console.log('Final is_on_sale value:', isOnSale);

        // 3. Проверка обязательных полей
        if (!fields.productTitle || !fields.productManufacturer || 
            !fields.productDescription || !fields.productPrice) {
            return res.status(400).json({ 
                success: false, 
                message: 'Заполните все обязательные поля' 
            });
        }
        
        // 4. Обработка изображения
        let productThumbnail = null;
        const keepCurrentImage = fields.keepCurrentImage === 'on' || fields.keepCurrentImage === 'true';
        
        if (!keepCurrentImage && files.productImage) {
            try {
                let productImageFile;
                
                // Определяем структуру файла
                if (Array.isArray(files.productImage)) {
                    productImageFile = files.productImage[0];
                } else if (files.productImage.originalFilename) {
                    productImageFile = files.productImage;
                } else {
                    productImageFile = files.productImage;
                }
                
                // Проверяем, что файл существует и имеет размер
                if (productImageFile && productImageFile.size > 0 && productImageFile.filepath) {
                    const oldPath = productImageFile.filepath;
                    const newFileName = `${Date.now()}_${productImageFile.originalFilename || 'product.jpg'}`;
                    const newPath = path.join(uploadDir, newFileName);
                    
                    if (fs.existsSync(oldPath)) {
                        fs.renameSync(oldPath, newPath);
                        productThumbnail = newFileName;
                    } else {
                        console.error('Source file does not exist:', oldPath);
                    }
                } else {
                    console.log('File is empty or invalid, keeping current image');
                }
            } catch (fileError) {
                console.error('File processing error:', fileError);
                // Если ошибка при обработке файла, оставляем текущее изображение
            }
        }
        
        // 5. Подготовка данных товара
        const productData = {
            productTitle: Array.isArray(fields.productTitle) ? fields.productTitle[0] : fields.productTitle,
            productManufacturer: Array.isArray(fields.productManufacturer) ? fields.productManufacturer[0] : fields.productManufacturer,
            productDescription: Array.isArray(fields.productDescription) ? fields.productDescription[0] : fields.productDescription,
            productPrice: parseFloat(Array.isArray(fields.productPrice) ? fields.productPrice[0] : fields.productPrice),
            is_on_sale: isOnSale
        };
        
        // Добавляем новое изображение если есть
        if (productThumbnail) {
            productData.productThumbnail = productThumbnail;
        }
        
        // 6. Данные скидки только если включена
        if (isOnSale === '1') {
            if (fields.discount_percentage) {
                productData.discount_percentage = parseFloat(
                    Array.isArray(fields.discount_percentage) ? fields.discount_percentage[0] : fields.discount_percentage
                );
            }
            
            if (fields.discount_start_date) {
                productData.discount_start_date = Array.isArray(fields.discount_start_date) ? 
                    fields.discount_start_date[0] : fields.discount_start_date;
            }
            
            if (fields.discount_end_date) {
                productData.discount_end_date = Array.isArray(fields.discount_end_date) ? 
                    fields.discount_end_date[0] : fields.discount_end_date;
            }
        } else {
            // Если скидка отключена, очищаем поля скидки
            productData.discount_percentage = 0;
            productData.discount_start_date = null;
            productData.discount_end_date = null;
        }
        
        
        // 7. Обработка категорий
        let categories = [];
        if (fields['categories[]']) {
            categories = Array.isArray(fields['categories[]']) ? fields['categories[]'] : [fields['categories[]']];
        } else if (fields.categories) {
            categories = Array.isArray(fields.categories) ? fields.categories : [fields.categories];
        }
        
        // 8. Обработка характеристик
        const features = [];
        const keys = Array.isArray(fields['feature_keys[]']) ? fields['feature_keys[]'] : 
                    (fields['feature_keys[]'] ? [fields['feature_keys[]']] : []);
        const values = Array.isArray(fields['feature_values[]']) ? fields['feature_values[]'] : 
                      (fields['feature_values[]'] ? [fields['feature_values[]']] : []);
        
        keys.forEach((key, index) => {
            if (key && key.trim() && values[index] && values[index].trim()) {
                features.push({
                    key: key.trim(),
                    value: values[index].trim()
                });
            }
        });
        
        // 9. Обновляем товар в базе данных
        connection.updateProduct(productID, productData, categories, features, (err, updatedProductID) => {
            if (err) {
                console.error('Update product error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Ошибка при обновлении товара в базе данных: ' + err.message 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Товар успешно обновлен', 
                productID: updatedProductID 
            });
        });
    });
});

// Удаление товара (DELETE)
router.delete('/admin/delete-product/:id', checkAdmin, (req, res) => {
    const productID = req.params.id;
    
    connection.deleteProduct(productID, (err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка при удалении товара' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Товар успешно удален' 
        });
    });
});

// Список товаров для администратора (страница управления)
router.get('/admin/products', checkAdmin, (req, res) => {
    const searchQuery = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Получаем общее количество товаров
    const countQuery = 'SELECT COUNT(*) as total FROM products';
    connection.connection.query(countQuery, (err, countResult) => {
        if (err) {
            return res.status(500).send('Ошибка при получении количества товаров');
        }
        
        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);
        
        // Получаем товары с пагинацией
        let productsQuery = 'SELECT * FROM products ORDER BY productID LIMIT ? OFFSET ?';
        let queryParams = [limit, offset];
        
        if (searchQuery) {
            productsQuery = `
                SELECT * FROM products 
                WHERE productTitle LIKE ? OR productManufacturer LIKE ? OR productDescription LIKE ?
                ORDER BY productID LIMIT ? OFFSET ?
            `;
            const searchPattern = `%${searchQuery}%`;
            queryParams = [searchPattern, searchPattern, searchPattern, limit, offset];
        }
        
        connection.connection.query(productsQuery, queryParams, (err, products) => {
            if (err) {
                return res.status(500).send('Ошибка при получении списка товаров');
            }
            
            // Для каждого товара получаем категории и характеристики
            const productsWithDetails = [];
            let processed = 0;
            
            if (products.length === 0) {
                return res.render('layout', {
                    body: 'admin_products',
                    products: [],
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalProducts: totalProducts,
                        hasPrev: page > 1,
                        hasNext: page < totalPages,
                        searchQuery: searchQuery
                    },
                    session: req.session
                });
            }
            
            products.forEach((product, index) => {
                // Получаем категории товара
                const categoryQuery = `
                    SELECT c.categorieName 
                    FROM categories c
                    JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
                    WHERE cp.productID = ?
                `;
                
                connection.connection.query(categoryQuery, [product.productID], (categoryErr, categories) => {
                    const categoryNames = categories.map(cat => cat.categorieName);
                    
                    // Получаем количество характеристик
                    const featuresQuery = 'SELECT COUNT(*) as count FROM product_features WHERE productID = ?';
                    connection.connection.query(featuresQuery, [product.productID], (featuresErr, featuresResult) => {
                        productsWithDetails[index] = {
                            ...product,
                            categories: categoryNames,
                            featuresCount: featuresResult[0].count || 0
                        };
                        
                        processed++;
                        
                        if (processed === products.length) {
                            res.render('layout', {
                                body: 'admin_products',
                                products: productsWithDetails,
                                pagination: {
                                    currentPage: page,
                                    totalPages: totalPages,
                                    totalProducts: totalProducts,
                                    hasPrev: page > 1,
                                    hasNext: page < totalPages,
                                    searchQuery: searchQuery
                                },
                                session: req.session
                            });
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;
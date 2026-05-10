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
    const avatarsDir = path.join(__dirname, '../public/images/Avatars');
    if (!fs.existsSync(avatarsDir)) return;
    
    fs.readdir(avatarsDir, (err, files) => {
        if (err) return;
        avatars = files.map(file => ({ url: `/images/Avatars/${file}` }));
    });
};

loadAvatars();

// Middleware для проверки авторизации
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

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

// Вспомогательная функция для форматирования результатов поиска
function formatSuggestions(results) {
    return results.map(product => {
        const now = new Date();
        const startDate = product.discount_start_date ? new Date(product.discount_start_date) : null;
        const endDate = product.discount_end_date ? new Date(product.discount_end_date) : null;
        
        const isDiscountActive = product.is_on_sale && 
            product.discount_percentage > 0 && 
            (!startDate || now >= startDate) && 
            (!endDate || now <= endDate);
        
        let displayPrice = parseFloat(product.productPrice) || 0;
        let originalPrice = parseFloat(product.productPrice) || 0;
        
        if (isDiscountActive) {
            const discountValue = (displayPrice * parseFloat(product.discount_percentage || 0) / 100);
            displayPrice = displayPrice - discountValue;
        }
        
        return {
            id: product.productID,
            title: product.productTitle,
            thumbnail: product.productThumbnail,
            manufacturer: product.productManufacturer, 
            rating: product.productRating !== null && product.productRating !== undefined ? product.productRating : 0,       
            price: displayPrice.toFixed(2),
            originalPrice: originalPrice.toFixed(2),
            isDiscounted: isDiscountActive,
            discountPercentage: isDiscountActive ? parseFloat(product.discount_percentage || 0).toFixed(0) : 0
        };
    });
}

// Главная страница
router.get('/', (req, res) => {
    Promise.all([
        new Promise((resolve) => {
            connection.getPopularProducts(8, (err, results) => {
                if (err) {
                    console.error('Popular query error:', err);
                    resolve([]);
                } else {
                    resolve(results);
                }
            });
        }),
        new Promise((resolve) => {
            connection.getAllCategoriesFull((err, categories) => {
                if (err) {
                    console.error('Categories query error:', err);
                    resolve([]);
                } else {
                    resolve(categories);
                }
            });
        }),
        new Promise((resolve) => {
            connection.getDiscountedProducts(6, (err, results) => {
                if (err) {
                    console.error('Discounted query error:', err);
                    resolve([]);
                } else {
                    resolve(results);
                }
            });
        })
    ])
    .then(([popularProducts, categories, discountedProducts]) => {
        const mainCategories = categories.slice(0, 3);
        const otherCategoriesCount = Math.max(0, categories.length - 3);
        
        // Собираем все ID товаров для получения иконок категорий
        const allProductIds = [
            ...popularProducts.map(p => p.productID),
            ...discountedProducts.map(p => p.productID)
        ];
        
        connection.getCategoryIconsForProducts(allProductIds, (err, iconsMap) => {
            if (err) iconsMap = {};
            
            // Заменяем categories на объекты с иконками
            const popularWithIcons = popularProducts.map(p => ({
                ...p,
                categories: iconsMap[p.productID] || []
            }));
            const discountedWithIcons = discountedProducts.map(p => ({
                ...p,
                categories: iconsMap[p.productID] || []
            }));
            
            if (req.session.userId) {
                const getFavorites = new Promise((resolve) => {
                    connection.getFavoritesByCustomerID(req.session.userId, (err, favorites) => {
                        if (err) {
                            console.error('Favorites error:', err);
                            resolve([]);
                        } else {
                            resolve(favorites || []);
                        }
                    });
                });
                
                const getCart = new Promise((resolve) => {
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
                        req.session.favorites = favorites.map(item => item.productID);
                        req.session.cart = {};
                        cartItems.forEach(item => {
                            req.session.cart[item.productID] = { sc_count: item.sc_count };
                        });
                        
                        req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                            return total + (item.sc_count || 0);
                        }, 0);
                        
                        const favoriteIdsSet = new Set(req.session.favorites);
                        
                        const markFavorites = (products) => {
                            return products.map(product => ({
                                ...product,
                                isFavorite: favoriteIdsSet.has(product.productID)
                            }));
                        };
                        
                        res.render('layout', {
                            body: 'home',
                            mainCategories: mainCategories,
                            otherCategoriesCount: otherCategoriesCount,
                            popularProducts: markFavorites(popularWithIcons),
                            discountedProducts: markFavorites(discountedWithIcons),
                            session: req.session
                        });
                    })
                    .catch(err => {
                        console.error('Promise error:', err);
                        res.render('layout', {
                            body: 'home',
                            mainCategories: mainCategories,
                            otherCategoriesCount: otherCategoriesCount,
                            popularProducts: popularWithIcons,
                            discountedProducts: discountedWithIcons,
                            session: req.session
                        });
                    });
            } else {
                req.session.favorites = [];
                req.session.cart = {};
                req.session.cartCount = 0;
                
                res.render('layout', {
                    body: 'home',
                    mainCategories: mainCategories,
                    otherCategoriesCount: otherCategoriesCount,
                    popularProducts: popularWithIcons,
                    discountedProducts: discountedWithIcons,
                    session: req.session
                });
            }
        });
    })
    .catch(err => {
        console.error('Main page error:', err);
        res.status(500).send('Ошибка при загрузке главной страницы');
    });
});

// Каталог товаров
router.get('/products', (req, res) => {
    connection.getPriceBounds((err, boundsResult) => {
        if (err) console.error('Ошибка получения границ цен:', err);

        const dbMin = boundsResult?.[0]?.min_price || 0;
        const dbMax = boundsResult?.[0]?.max_price || 100000;
        
        const sliderMin = Math.max(0, Math.floor(dbMin / 100) * 100);
        const sliderMax = Math.ceil(dbMax * 1.1 / 100) * 100;
        
        let minPrice = sliderMin;
        let maxPrice = sliderMax;
        
        if (req.query.minPrice) {
            const parsed = parseFloat(req.query.minPrice);
            if (!isNaN(parsed)) minPrice = Math.max(sliderMin, Math.min(sliderMax, parsed));
        }
        
        if (req.query.maxPrice) {
            const parsed = parseFloat(req.query.maxPrice);
            if (!isNaN(parsed)) maxPrice = Math.max(sliderMin, Math.min(sliderMax, parsed));
        }
        
        const searchQuery = req.query.search || '';
        const category = req.query.category || '';
        const onSale = req.query.onSale === 'true';
        const inStock = req.query.inStock === 'true';
        const sort = req.query.sort || 'newest';
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        
        const categoryIds = category.toString().split(',').filter(id => id.trim() !== '');
        
        const filters = {
            searchQuery,
            categoryIds,
            minPrice: minPrice > sliderMin ? minPrice : null,
            maxPrice: maxPrice < sliderMax ? maxPrice : null,
            onSale,
            inStock,
            sort,
            limit,
            offset
        };
        
        connection.getProductCount(filters, (err, countResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при получении количества товаров');
            }
            
            const totalProducts = countResult[0].total;
            const totalPages = Math.ceil(totalProducts / limit);
            
            connection.getCatalogProducts(req.session.userId, filters, (err, catalogData) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Ошибка при получении списка продуктов');
                }
                
                req.session.favorites = catalogData.favorites || [];
                req.session.cart = catalogData.cart || {};
                req.session.cartCount = catalogData.cartCount || 0;
                
                // Получаем иконки категорий для всех товаров
                const productIDs = catalogData.products.map(p => p.productID);
                connection.getCategoryIconsForProducts(productIDs, (iconErr, iconsMap) => {
                    if (iconErr) iconsMap = {};
                    
                    catalogData.products = catalogData.products.map(p => ({
                        ...p,
                        categories: iconsMap[p.productID] || []
                    }));
                    
                    connection.connection.query('SELECT categorieID, categorieName FROM categories ORDER BY categorieName', (err, allCategories) => {
                        if (err) allCategories = [];
                        
                        res.render('layout', { 
                            body: 'products',
                            products: catalogData.products,
                            allCategories: allCategories,
                            session: req.session,
                            searchQuery: searchQuery,
                            category: category,
                            minPrice: minPrice,
                            maxPrice: maxPrice,
                            sliderMin: sliderMin,
                            sliderMax: sliderMax,
                            onSale: onSale,
                            inStock: inStock,
                            sort: sort,
                            currentPage: page,
                            totalPages: totalPages,
                            totalProducts: totalProducts,
                            limit: limit
                        });
                    });
                });
            });
        });
    });
});
// Страница всех категорий с количеством товаров
router.get('/categories', (req, res) => {
    const query = `
        SELECT c.*, COUNT(cp.productID) AS productCount
        FROM categories c
        LEFT JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
        GROUP BY c.categorieID
        ORDER BY c.categorieName
    `;
    connection.connection.query(query, (err, categories) => {
        if (err) {
            console.error('Categories page error:', err);
            categories = [];
        }
        res.render('layout', {
            body: 'categories',
            categories: categories,
            session: req.session
        });
    });
});

// API для автодополнения поиска
router.get('/api/search-suggestions', (req, res) => {
    const query = req.query.query || '';
    const isPopular = req.query.popular === 'true';
    
    if (isPopular && !query) {
        connection.getPopularSearchSuggestions(5, (err, results) => {
            if (err) {
                console.error('Popular suggestions error:', err);
                return res.json([]);
            }
            const suggestions = formatSuggestions(results);
            res.json(suggestions);
        });
        return;
    }
    
    if (query.length < 2) return res.json([]);
    
    connection.searchProducts(query, 8, (err, results) => {
        if (err) {
            console.error('Search suggestions error:', err);
            return res.json([]);
        }
        const suggestions = formatSuggestions(results);
        res.json(suggestions);
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
                req.session.userId = user.customerID;
                req.session.userThumbnail = user.customerThumbnail;
                req.session.userEmail = user.customerEmail;
                req.session.userName = user.customerName;
                req.session.userRank = user.customerRank || 'user';

                connection.getFavoritesByCustomerID(user.customerID, (err, favorites) => {
                    if (err) {
                    } else {
                        req.session.favorites = favorites.map(item => item.productID);
                    }
                });

                connection.getCartByCustomerID(user.customerID, (err, cartItems) => {
                    if (err) {
                    } else {
                        req.session.cart = {};
                        cartItems.forEach(item => {
                            req.session.cart[item.productID] = { sc_count: item.sc_count };
                        });
                    }
                    res.redirect('/');
                });
            } else {
                return res.render('layout', { error: 'Неверный пароль!', body: 'login' });
            }
        } else {
            return res.render('layout', { error: 'Такого пользователя не существует.', body: 'login' });
        }
    });
});

// Очистка всей корзины
router.post('/cart/clear', isAuthenticated, (req, res) => {
    const customerID = req.session.userId;

    const query = 'DELETE FROM shopping_cart WHERE customerID = ?';
    connection.connection.query(query, [customerID], (err) => {
        if (err) {
            console.error('Ошибка очистки корзины:', err);
            return res.status(500).send('Ошибка при очистке корзины');
        }
        
        req.session.cart = {};
        req.session.cartCount = 0;
        
        res.redirect('/cart/' + customerID);
    });
});

// Добавление товара в корзину
router.post('/cart/add', isAuthenticated, (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    // Проверка существования и наличия товара
    connection.getProductByID(productID, (err, product) => {
        if (err || !product) {
            return res.json({ success: false, message: 'Товар не найден' });
        }

        if (product.stock_quantity <= 0) {
            return res.json({ success: false, message: 'Товара нет в наличии' });
        }

        req.session.cart = req.session.cart || {};
        const currentQty = req.session.cart[productID]?.sc_count || 0;

        // Проверка лимита при добавлении
        if (currentQty + 1 > product.stock_quantity) {
            return res.json({ success: false, message: 'Достигнуто максимальное доступное количество' });
        }

        if (currentQty > 0) {
            // Товар уже есть, увеличиваем
            connection.updateCartItem(customerID, productID, 'increase', (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Ошибка при обновлении товара в корзине' });
                }
                req.session.cart[productID].sc_count += 1;
                req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => total + (item.sc_count || 0), 0);
                return res.json({ success: true, cartCount: req.session.cartCount });
            });
        } else {
            // Добавление нового товара
            connection.addToCart(customerID, productID, (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Ошибка при добавлении товара в корзину' });
                }
                req.session.cart[productID] = { sc_count: 1 };
                req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => total + (item.sc_count || 0), 0);
                return res.json({ success: true, cartCount: req.session.cartCount });
            });
        }
    });
});

// Изменение количества товара в корзине
router.post('/cart/update', isAuthenticated, (req, res) => {
    const { productID, action } = req.body;
    const customerID = req.session.userId;

    // Получаем текущее количество в корзине
    const query = 'SELECT sc_count FROM shopping_cart WHERE customerID = ? AND productID = ?';
    connection.connection.query(query, [customerID, productID], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('Товар не найден в корзине');
        }
        const currentQuantity = results[0].sc_count;

        connection.getProductByID(productID, (err, product) => {
            if (err || !product) {
                return res.status(404).send('Товар не найден');
            }
            const stock = product.stock_quantity;

            if (action === 'increase') {
                if (currentQuantity + 1 > stock) {
                    return res.status(400).send('Недостаточно товара на складе');
                }
                connection.updateCartItem(customerID, productID, 'increase', (err) => {
                    if (err) return res.status(500).send('Ошибка при увеличении количества');
                    res.redirect('/cart/' + customerID);
                });
            } else if (action === 'decrease') {
                connection.updateCartItem(customerID, productID, 'decrease', (err) => {
                    if (err) return res.status(500).send('Ошибка при уменьшении количества');
                    res.redirect('/cart/' + customerID);
                });
            } else {
                res.status(400).send('Неверное действие');
            }
        });
    });
});

// Удаление товара из корзины
router.post('/cart/remove', isAuthenticated, (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    connection.removeFromCart(customerID, productID, (err) => {
        if (err) {
            return res.status(500).send('Ошибка при удалении товара из корзины');
        }
    });

    res.redirect('/cart/' + customerID);
});

// Корзина пользователя
router.get('/cart/:userId', isAuthenticated, (req, res) => {
    const userId = req.params.userId;

    if (req.session.userId != userId) {
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
router.post('/favorites/add', isAuthenticated, (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    if (!productID) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const checkQuery = 'SELECT * FROM favorites WHERE customerID = ? AND productID = ?';
    connection.connection.query(checkQuery, [customerID, productID], (checkErr, checkResults) => {
        if (checkErr) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (checkResults.length > 0) {
            // Уже в избранном
            if (!req.session.favorites) {
                req.session.favorites = [];
            }
            const productIdNum = parseInt(productID);
            if (!req.session.favorites.includes(productIdNum)) {
                req.session.favorites.push(productIdNum);
            }
            return res.json({ success: true, alreadyFavorited: true });
        }
        
        connection.addToFavorites(productID, customerID, (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error adding to favorites' });
            }

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
router.post('/favorites/remove', isAuthenticated, (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    if (!productID) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    connection.removeFromFavorites(productID, customerID, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error removing from favorites' });
        }

        if (req.session.favorites) {
            const productIdNum = parseInt(productID);
            req.session.favorites = req.session.favorites.filter(id => id !== productIdNum);
        }

        res.json({ success: true });
    });
});

// Очистка всех избранных
router.post('/favorites/clear-all', isAuthenticated, (req, res) => {
    const customerID = req.session.userId;

    const query = 'DELETE FROM favorites WHERE customerID = ?';
    connection.connection.query(query, [customerID], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при очистке избранного' });
        }
        req.session.favorites = [];
        res.json({ success: true, message: 'Все товары удалены из избранного' });
    });
});

// Маршрут для получения страницы избранного
router.get('/favorites', isAuthenticated, (req, res) => {
    const customerID = req.session.userId;
    
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
        
        const favoriteIds = favoriteResults.map(f => f.productID);
        req.session.favorites = favoriteIds;
        
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
                
                // Заменяем getCategoriesForProducts на getCategoryIconsForProducts
                connection.getCategoryIconsForProducts(favoriteIds, (iconErr, iconsMap) => {
                    if (iconErr) iconsMap = {};
                    
                    const productsWithCategories = processedProducts.map(product => ({
                        ...product,
                        categories: iconsMap[product.productID] || []
                    }));
                    
                    res.render('layout', { 
                        products: productsWithCategories, 
                        body: 'favorites',
                        session: req.session 
                    });
                });
            });
        } else {
            res.render('layout', { 
                products: [], 
                body: 'favorites',
                session: req.session 
            });
        }
    });
});

//Выход и выбор
router.post('/logoutandchange', isAuthenticated, (req, res) => {
    const logoutandchange = req.body.logoutandchange;
    const name_value = req.body.acc_label_name;
    const session_id = req.session.userId;

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
                return res.render('layout', { body:games, global_error: "Ошибка при выходе"});
            }
            res.redirect('/');
        });
    }
})

// Страница аккаунта пользователя
router.get('/acc_page', isAuthenticated, (req, res) => {
    const customerID = req.session.userId;
    
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
    
    const getOrders = new Promise((resolve, reject) => {
        connection.getOrdersByCustomer(customerID, (err, orders) => {
            if (err) {
                console.error('Orders error:', err);
                resolve([]);
            } else {
                resolve(orders || []);
            }
        });
    });
    
    Promise.all([getUserData, getFavorites, getCart, getOrders])
        .then(([user, favorites, cartItems, orders]) => {
            req.session.userId = user.customerID;
            req.session.userThumbnail = user.customerThumbnail;
            req.session.userEmail = user.customerEmail;
            req.session.userName = user.customerName;
            req.session.userRank = user.customerRank || 'user';
            
            req.session.favorites = favorites.map(item => item.productID);
            
            req.session.cart = {};
            cartItems.forEach(item => {
                req.session.cart[item.productID] = { sc_count: item.sc_count };
            });
            
            req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                return total + (item.sc_count || 0);
            }, 0);
            
            res.render('layout', {
                body: 'acc_page',
                session: req.session,
                user: user,
                favoritesCount: req.session.favorites.length,
                cartCount: req.session.cartCount,
                orders: orders
            });
        })
        .catch(err => {
            console.error('Account page error:', err);
            res.redirect('/login');
        });
});

//Выбор аватарки
router.get('/select_thumbnail', isAuthenticated, (req,res) => {
    res.render('layout',{ body: 'select_avatar', avatars: avatars})
})

//Замена аватарки
router.post('/upload', isAuthenticated, async (req, res) => {
    const session_id = req.session.userId;
    const avatarId = req.body.avatar;
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
    const customerID = req.session.userId;
    
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
router.post('/api/reviews', isAuthenticated, (req, res) => {
    const { productID, rating, comment } = req.body;
    const customerID = req.session.userId;
    
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

// Страница товара
router.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    
    connection.getProductByID(productId, (err, product) => {
        if (err || !product) {
            return res.status(404).send('Товар не найден');
        }
        
        const priceInfo = connection.calculateDiscountedPrice(product);
        
        if (typeof product.productPrice === 'string') {
            product.productPrice = parseFloat(product.productPrice);
        }
        
        // Запрос категорий с иконками
        const categoryQuery = `
            SELECT c.categorieName, c.categorieThumbnail
            FROM categories c
            JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
            WHERE cp.productID = ?
        `;
        
        connection.connection.query(categoryQuery, [productId], (categoryErr, categoryResults) => {
            if (categoryErr) {
                return res.status(500).send('Ошибка получения категорий товара');
            }
            
            const categories = categoryResults.map(cat => ({
                name: cat.categorieName,
                icon: cat.categorieThumbnail ? `/images/categories/${cat.categorieThumbnail}` : null
            }));
            
            connection.getProductFeatures(productId, (featuresErr, features) => {
                if (featuresErr) {
                    features = [];
                }
                
                connection.getProductReviews(productId, (reviewsErr, reviews) => {
                    if (reviewsErr) {
                        reviews = [];
                    }
                    
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
                        
                        const overallRating = product.productRating || 
                            (reviews.length > 0 ? 
                                reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 
                                0);
                        
                        if (req.session.userId) {
                            connection.hasUserReviewed(productId, req.session.userId, (checkErr, result) => {
                                if (checkErr) {
                                    result = false;
                                }
                                
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

// ===== Административные маршруты =====

// Страница добавления товара
router.get('/admin/add-product', checkAdmin, (req, res) => {
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
    const { IncomingForm } = require('formidable');
    const uploadDir = path.join(__dirname, '../public/images/products');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        multiples: true
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parsing error:', err);
            return res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
        }

        let uploadedImages = [];
        let hasImageError = false;

        try {
            if (files.productImage) {
                const imageFiles = Array.isArray(files.productImage) ? files.productImage : [files.productImage];

                imageFiles.forEach((file, index) => {
                    if (file.size === 0) return;

                    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
                    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
                    const ext = path.extname(file.originalFilename).toLowerCase();

                    if (!allowedExt.includes(ext) || !allowedMime.includes(file.mimetype)) {
                        if (file.filepath && fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                        hasImageError = true;
                        return;
                    }

                    const newFileName = `${Date.now()}_${file.originalFilename || 'product.jpg'}`;
                    const newPath = path.join(uploadDir, newFileName);

                    if (fs.existsSync(file.filepath)) {
                        fs.renameSync(file.filepath, newPath);
                        uploadedImages.push({
                            imageUrl: newFileName,
                            is_primary: index === 0,
                            sort_order: index
                        });
                    } else {
                        hasImageError = true;
                    }
                });

                if (uploadedImages.length === 0) hasImageError = true;
            } else {
                hasImageError = true;
            }
        } catch (fileError) {
            console.error('File processing error:', fileError);
            hasImageError = true;
        }

        if (hasImageError) {
            return res.status(400).json({ success: false, message: 'Ошибка при обработке изображений. Убедитесь, что загружены корректные файлы.' });
        }

        // Нормализация полей
        const isOnSaleRaw = Array.isArray(fields.is_on_sale) ? fields.is_on_sale[0] : fields.is_on_sale;
        let isOnSale = isOnSaleRaw === '1' ? '1' : '0';

        const parseDiscountPercent = () => {
            if (!fields.discount_percentage && fields.discount_percentage !== '0') return 0;
            const raw = Array.isArray(fields.discount_percentage) ? fields.discount_percentage[0] : fields.discount_percentage;
            return parseFloat(raw) || 0;
        };

        const parseDateField = (fieldName) => {
            const raw = Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName];
            if (!raw || raw.trim() === '') return null;
            let datetime = raw.trim();
            datetime = datetime.replace('T', ' ');
            if (datetime.length === 16) datetime += ':00';
            return datetime;
        };

        if (!fields.productTitle || !fields.productManufacturer || !fields.productDescription || !fields.productPrice) {
            return res.status(400).json({ success: false, message: 'Заполните все обязательные поля' });
        }

        const primaryImage = uploadedImages[0];
        const productData = {
            productTitle: Array.isArray(fields.productTitle) ? fields.productTitle[0] : fields.productTitle,
            productManufacturer: Array.isArray(fields.productManufacturer) ? fields.productManufacturer[0] : fields.productManufacturer,
            productDescription: Array.isArray(fields.productDescription) ? fields.productDescription[0] : fields.productDescription,
            productPrice: parseFloat(Array.isArray(fields.productPrice) ? fields.productPrice[0] : fields.productPrice),
            productThumbnail: primaryImage.imageUrl,
            is_on_sale: isOnSale,
            stock_quantity: parseInt(Array.isArray(fields.stock_quantity) ? fields.stock_quantity[0] : fields.stock_quantity) || 0,
            discount_percentage: isOnSale === '1' ? parseDiscountPercent() : 0,
            discount_start_date: isOnSale === '1' ? parseDateField('discount_start_date') : null,
            discount_end_date: isOnSale === '1' ? parseDateField('discount_end_date') : null
        };

        let categories = [];
        if (fields['categories[]']) {
            categories = Array.isArray(fields['categories[]']) ? fields['categories[]'] : [fields['categories[]']];
        }

        const features = [];
        if (fields['feature_keys[]'] && fields['feature_values[]']) {
            const keys = Array.isArray(fields['feature_keys[]']) ? fields['feature_keys[]'] : [fields['feature_keys[]']];
            const values = Array.isArray(fields['feature_values[]']) ? fields['feature_values[]'] : [fields['feature_values[]']];
            keys.forEach((key, index) => {
                if (key && key.trim() && values[index] && values[index].trim()) {
                    features.push({ key: key.trim(), value: values[index].trim() });
                }
            });
        }

        connection.addProductWithFeatures(productData, categories, features, (err, productID) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Ошибка базы данных: ' + err.message });
            }

            // Сохраняем все изображения в product_images
            connection.saveProductImages(productID, uploadedImages, (imgErr) => {
                if (imgErr) console.error('Ошибка сохранения изображений:', imgErr);
                res.json({ success: true, message: 'Товар успешно добавлен', productID: productID });
            });
        });
    });
});

// Страница редактирования товара
router.get('/admin/edit-product/:id', checkAdmin, (req, res) => {
    const productId = req.params.id;
    
    connection.getProductByID(productId, (err, product) => {
        if (err || !product) {
            return res.status(404).send('Товар не найден');
        }
        
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
            
            connection.getProductFeatures(productId, (featuresErr, features) => {
                if (featuresErr) {
                    features = [];
                }
                
                const allCategoriesQuery = 'SELECT categorieID, categorieName FROM categories ORDER BY categorieName';
                connection.connection.query(allCategoriesQuery, (allCategoriesErr, allCategories) => {
                    if (allCategoriesErr) {
                        allCategories = [];
                    }
                    
                    res.render('layout', {
                        body: 'edit_product',
                        product: product,
                        currentCategories: currentCategories,
                        features: features || [],
                        categories: allCategories,
                        session: req.session
                    });
                });
            });
        });
    });
});

// Обновление товара
router.post('/admin/update-product', checkAdmin, (req, res) => {
    const uploadDir = path.join(__dirname, '../public/images/products');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const { IncomingForm } = require('formidable');
    const form = new IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
        allowEmptyFiles: true,
        minFileSize: 0,
        maxFileSize: 10 * 1024 * 1024,
        multiples: true
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parsing error:', err);
            return res.status(500).json({ success: false, message: 'Ошибка при обработке формы: ' + err.message });
        }

        const productID = Array.isArray(fields.productID) ? fields.productID[0] : fields.productID;
        if (!productID) {
            return res.status(400).json({ success: false, message: 'Не указан ID товара' });
        }

        const isOnSaleRaw = Array.isArray(fields.is_on_sale) ? fields.is_on_sale[0] : fields.is_on_sale;
        let isOnSale = isOnSaleRaw === '1' ? '1' : '0';

        const parseDiscountPercent = () => {
            if (!fields.discount_percentage && fields.discount_percentage !== '0') return 0;
            const raw = Array.isArray(fields.discount_percentage) ? fields.discount_percentage[0] : fields.discount_percentage;
            return parseFloat(raw) || 0;
        };

        const parseDateField = (fieldName) => {
            const raw = Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName];
            if (!raw || raw.trim() === '') return null;
            let datetime = raw.trim();
            datetime = datetime.replace('T', ' ');
            if (datetime.length === 16) datetime += ':00';
            return datetime;
        };

        if (!fields.productTitle || !fields.productManufacturer || !fields.productDescription || !fields.productPrice) {
            return res.status(400).json({ success: false, message: 'Заполните все обязательные поля' });
        }

        let uploadedImages = [];
        const keepCurrentImage = fields.keepCurrentImage === 'on' || fields.keepCurrentImage === 'true';

        if (!keepCurrentImage && files.productImage) {
            try {
                const imageFiles = Array.isArray(files.productImage) ? files.productImage : [files.productImage];
                imageFiles.forEach((file, index) => {
                    if (file.size === 0) return;
                    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
                    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
                    const ext = path.extname(file.originalFilename).toLowerCase();
                    if (!allowedExt.includes(ext) || !allowedMime.includes(file.mimetype)) {
                        if (file.filepath && fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                        return;
                    }
                    const newFileName = `${Date.now()}_${file.originalFilename || 'product.jpg'}`;
                    const newPath = path.join(uploadDir, newFileName);
                    if (fs.existsSync(file.filepath)) {
                        fs.renameSync(file.filepath, newPath);
                        uploadedImages.push({ imageUrl: newFileName, is_primary: index === 0, sort_order: index });
                    }
                });
            } catch (fileError) {
                console.error('File processing error:', fileError);
            }
        }

        const productData = {
            productTitle: Array.isArray(fields.productTitle) ? fields.productTitle[0] : fields.productTitle,
            productManufacturer: Array.isArray(fields.productManufacturer) ? fields.productManufacturer[0] : fields.productManufacturer,
            productDescription: Array.isArray(fields.productDescription) ? fields.productDescription[0] : fields.productDescription,
            productPrice: parseFloat(Array.isArray(fields.productPrice) ? fields.productPrice[0] : fields.productPrice),
            is_on_sale: isOnSale,
            stock_quantity: parseInt(Array.isArray(fields.stock_quantity) ? fields.stock_quantity[0] : fields.stock_quantity) || 0,
            discount_percentage: isOnSale === '1' ? parseDiscountPercent() : 0,
            discount_start_date: isOnSale === '1' ? parseDateField('discount_start_date') : null,
            discount_end_date: isOnSale === '1' ? parseDateField('discount_end_date') : null
        };

        // Если загружены новые изображения, основное изображение меняем
        if (uploadedImages.length > 0) {
            productData.productThumbnail = uploadedImages[0].imageUrl;
        } else {
            productData.productThumbnail = null; // COALESCE в запросе сохранит старое
        }

        let categories = [];
        if (fields['categories[]']) {
            categories = Array.isArray(fields['categories[]']) ? fields['categories[]'] : [fields['categories[]']];
        } else if (fields.categories) {
            categories = Array.isArray(fields.categories) ? fields.categories : [fields.categories];
        }

        const features = [];
        const keys = Array.isArray(fields['feature_keys[]']) ? fields['feature_keys[]'] : (fields['feature_keys[]'] ? [fields['feature_keys[]']] : []);
        const values = Array.isArray(fields['feature_values[]']) ? fields['feature_values[]'] : (fields['feature_values[]'] ? [fields['feature_values[]']] : []);
        keys.forEach((key, index) => {
            if (key && key.trim() && values[index] && values[index].trim()) {
                features.push({ key: key.trim(), value: values[index].trim() });
            }
        });

        connection.updateProduct(productID, productData, categories, features, (err) => {
            if (err) {
                console.error('Update product error:', err);
                return res.status(500).json({ success: false, message: 'Ошибка при обновлении товара в базе данных: ' + err.message });
            }

            // Обработка изображений
            if (!keepCurrentImage && uploadedImages.length > 0) {
                // Удаляем старые изображения из БД и файлы
                connection.getProductImages(productID, (imgErr, oldImages) => {
                    if (!imgErr && oldImages) {
                        oldImages.forEach(img => {
                            const oldPath = path.join(uploadDir, img.imageUrl);
                            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                        });
                    }
                    connection.deleteProductImages(productID, (delErr) => {
                        if (delErr) console.error('Ошибка удаления старых изображений:', delErr);
                        connection.saveProductImages(productID, uploadedImages, (saveErr) => {
                            if (saveErr) console.error('Ошибка сохранения новых изображений:', saveErr);
                        });
                    });
                });
            }

            res.json({ success: true, message: 'Товар успешно обновлен', productID: productID });
        });
    });
});

// Удаление товара
router.delete('/admin/delete-product/:id', checkAdmin, (req, res) => {
    const productID = req.params.id;
    connection.deleteProduct(productID, (err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка при удалении товара' 
            });
        }
        res.json({ success: true, message: 'Товар успешно удален' });
    });
});

// Список товаров для администратора
router.get('/admin/products', checkAdmin, (req, res) => {
    const searchQuery = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) as total FROM products';
    connection.connection.query(countQuery, (err, countResult) => {
        if (err) {
            return res.status(500).send('Ошибка при получении количества товаров');
        }
        
        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);
        
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
            
            // Загружаем полный список категорий (для фильтров, если нужно)
            connection.getAllCategoriesFull((catErr, categories) => {
                if (catErr) categories = [];
                
                if (products.length === 0) {
                    return res.render('layout', {
                        body: 'admin_products',
                        products: [],
                        categories: categories,
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
                
                const productsWithDetails = [];
                let processed = 0;
                
                products.forEach((product, index) => {
                    const categoryQuery = `
                        SELECT c.categorieName 
                        FROM categories c
                        JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
                        WHERE cp.productID = ?
                    `;
    
                    connection.connection.query(categoryQuery, [product.productID], (categoryErr, productCats) => {
                        // Пока сохраняем только имена (позже добавим иконки)
                        const categoryNames = productCats.map(cat => cat.categorieName);
                        
                        const featuresQuery = 'SELECT COUNT(*) as count FROM product_features WHERE productID = ?';
                        connection.connection.query(featuresQuery, [product.productID], (featuresErr, featuresResult) => {
                            productsWithDetails[index] = {
                                ...product,
                                categories: categoryNames, // временно массив строк
                                featuresCount: featuresResult[0].count || 0
                            };
                            
                            processed++;
                            if (processed === products.length) {
                                // Теперь получаем иконки для всех товаров
                                const productIds = productsWithDetails.map(p => p.productID);
                                connection.getCategoryIconsForProducts(productIds, (iconErr, iconsMap) => {
                                    if (iconErr) iconsMap = {};
                                    
                                    const enriched = productsWithDetails.map(p => ({
                                        ...p,
                                        categories: iconsMap[p.productID] || []
                                    }));
                                    
                                    res.render('layout', {
                                        body: 'admin_products',
                                        products: enriched,
                                        categories: categories,
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
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});
// Оформление заказа
router.get('/checkout', isAuthenticated, (req, res) => {
    connection.getCartWithProducts(req.session.userId, (err, products) => {
        if (err) {
            console.error('Ошибка получения корзины:', err);
            products = [];
        }

        if (products.length === 0) {
            return res.redirect('/cart/' + req.session.userId);
        }

        connection.getDeliveryPoints((err, deliveryPoints) => {
            if (err) {
                console.error('Ошибка получения пунктов выдачи:', err);
                deliveryPoints = [];
            }

            let totalPrice = 0;
            products.forEach(product => {
                const itemPrice = product.isDiscounted ? parseFloat(product.discountedPrice) : parseFloat(product.productPrice);
                totalPrice += itemPrice * product.sc_count;
            });

            res.render('layout', {
                body: 'checkout',
                products: products,
                deliveryPoints: deliveryPoints,
                totalPrice: totalPrice,
                session: req.session
            });
        });
    });
});

// Обработка оформления заказа
router.post('/checkout/process', isAuthenticated, (req, res) => {
    const {
        deliveryType,
        deliveryPointID,
        deliveryAddress,
        paymentType,
        customerName,
        customerPhone,
        customerEmail,
        comment
    } = req.body;

    if (!deliveryType || !paymentType || !customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({ success: false, message: 'Заполните все обязательные поля' });
    }

    if (deliveryType === 'pickup' && !deliveryPointID) {
        return res.status(400).json({ success: false, message: 'Выберите пункт выдачи' });
    }

    if (deliveryType === 'delivery' && (!deliveryAddress || deliveryAddress.trim() === '')) {
        return res.status(400).json({ success: false, message: 'Укажите адрес доставки' });
    }

    connection.getCartWithProducts(req.session.userId, (err, products) => {
        if (err || products.length === 0) {
            return res.status(400).json({ success: false, message: 'Корзина пуста' });
        }

        // Проверка наличия товаров
        for (const product of products) {
            if (product.stock_quantity <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Товар "${product.productTitle}" отсутствует на складе` 
                });
            }
            if (product.sc_count > product.stock_quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Недостаточно товара "${product.productTitle}" на складе (доступно ${product.stock_quantity}, запрошено ${product.sc_count})` 
                });
            }
        }

        let totalAmount = 0;
        const orderItems = products.map(product => {
            const itemPrice = product.isDiscounted ? parseFloat(product.discountedPrice) : parseFloat(product.productPrice);
            const itemTotal = itemPrice * product.sc_count;
            totalAmount += itemTotal;
            
            return {
                productID: product.productID,
                quantity: product.sc_count,
                price: parseFloat(product.productPrice),
                discountedPrice: product.isDiscounted ? parseFloat(product.discountedPrice) : null
            };
        });

        const deliveryCost = 0;
        let finalPaymentType = paymentType;
        if (deliveryType === 'delivery' && paymentType !== 'online') {
            finalPaymentType = 'online';
        }

        const orderData = {
            customerID: req.session.userId,
            totalAmount: totalAmount + deliveryCost,
            deliveryType: deliveryType,
            deliveryAddress: deliveryAddress || null,
            deliveryPointID: deliveryPointID || null,
            deliveryCost: deliveryCost,
            paymentType: finalPaymentType,
            paymentStatus: 'pending',
            orderStatusID: 1,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim(),
            comment: comment ? comment.trim() : null
        };

        connection.createOrder(orderData, orderItems, (err, orderID) => {
            if (err) {
                console.error('Ошибка создания заказа:', err);
                return res.status(500).json({ success: false, message: 'Ошибка при создании заказа' });
            }

            const clearCartQuery = 'DELETE FROM shopping_cart WHERE customerID = ?';
            connection.connection.query(clearCartQuery, [req.session.userId], (cartErr) => {
                if (cartErr) {
                    console.error('Ошибка очистки корзины:', cartErr);
                }
                
                req.session.cart = {};
                req.session.cartCount = 0;

                if (finalPaymentType === 'online') {
                    connection.generateSBPQRCode(orderID, orderData.totalAmount, (qrErr, qrData) => {
                        if (qrErr) console.error('Ошибка генерации QR:', qrErr);
                        res.json({
                            success: true,
                            orderID: orderID,
                            paymentType: 'online',
                            qrData: qrData,
                            redirectUrl: `/checkout/success/${orderID}`
                        });
                    });
                } else {
                    connection.generatePaymentData(orderID, orderData.totalAmount, (payErr, payData) => {
                        if (payErr) console.error('Ошибка генерации данных оплаты:', payErr);
                        res.json({
                            success: true,
                            orderID: orderID,
                            paymentType: finalPaymentType,
                            paymentData: payData,
                            redirectUrl: `/checkout/success/${orderID}`
                        });
                    });
                }
            });
        });
    });
});

// Страница успешного оформления заказа
router.get('/checkout/success/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;

    Promise.all([
        new Promise((resolve) => {
            connection.getOrderById(orderID, (err, order) => {
                if (err || !order) {
                    console.error('Ошибка получения заказа:', err);
                    resolve(null);
                } else {
                    resolve(order);
                }
            });
        }),
        new Promise((resolve) => {
            connection.getOrderItems(orderID, (err, items) => {
                if (err) {
                    console.error('Ошибка получения товаров заказа:', err);
                    resolve([]);
                } else {
                    resolve(items);
                }
            });
        })
    ]).then(([order, items]) => {
        if (!order) return res.status(404).send('Заказ не найден');
        if (order.customerID !== req.session.userId) return res.status(403).send('Доступ запрещен');

        res.render('layout', {
            body: 'checkout_success',
            order: order,
            items: items,
            session: req.session
        });
    }).catch(err => {
        console.error('Ошибка загрузки страницы успеха:', err);
        res.status(500).send('Ошибка при загрузке страницы');
    });
});

// История заказов
router.get('/my-orders', isAuthenticated, (req, res) => {
    connection.getOrdersByCustomer(req.session.userId, (err, orders) => {
        if (err) {
            console.error('Ошибка получения заказов:', err);
            orders = [];
        }
        res.render('layout', {
            body: 'my_orders',
            orders: orders,
            session: req.session
        });
    });
});

// Детали заказа
router.get('/order/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;

    Promise.all([
        new Promise((resolve) => {
            connection.getOrderById(orderID, (err, order) => {
                if (err || !order) {
                    console.error('Ошибка получения заказа:', err);
                    resolve(null);
                } else {
                    resolve(order);
                }
            });
        }),
        new Promise((resolve) => {
            connection.getOrderItems(orderID, (err, items) => {
                if (err) {
                    console.error('Ошибка получения товаров заказа:', err);
                    resolve([]);
                } else {
                    resolve(items);
                }
            });
        })
    ]).then(([order, items]) => {
        if (!order) return res.status(404).send('Заказ не найден');
        if (order.customerID !== req.session.userId) return res.status(403).send('Доступ запрещен');

        res.render('layout', {
            body: 'order_detail',
            order: order,
            items: items,
            session: req.session
        });
    }).catch(err => {
        console.error('Ошибка загрузки деталей заказа:', err);
        res.status(500).send('Ошибка при загрузке страницы');
    });
});

// Оплата СБП
router.get('/payment/sbp/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;
    connection.getOrderById(orderID, (err, order) => {
        if (err || !order) return res.status(404).send('Заказ не найден');
        if (order.customerID !== req.session.userId) return res.status(403).send('Доступ запрещен');
        if (order.paymentType !== 'online') return res.status(400).send('Неверный тип оплаты');

        connection.updatePaymentStatus(orderID, 'paid', (updateErr) => {
            if (updateErr) console.error('Ошибка обновления статуса оплаты:', updateErr);
            res.render('layout', {
                body: 'payment_sbp',
                order: order,
                session: req.session
            });
        });
    });
});

// Подтверждение оплаты наличными/картой
router.get('/payment/confirm/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;
    connection.getOrderById(orderID, (err, order) => {
        if (err || !order) return res.status(404).send('Заказ не найден');
        if (order.customerID !== req.session.userId) return res.status(403).send('Доступ запрещен');

        res.render('layout', {
            body: 'payment_confirm',
            order: order,
            session: req.session
        });
    });
});

// Список категорий
router.get('/admin/categories', checkAdmin, (req, res) => {
    connection.getAllCategoriesFull((err, categories) => {
        if (err) {
            console.error(err);
            categories = [];
        }
        res.render('layout', {
            body: 'admin_categories',
            categories: categories,
            session: req.session
        });
    });
});

// Страница добавления категории
router.get('/admin/categories/add', checkAdmin, (req, res) => {
    res.render('layout', {
        body: 'add_category',
        session: req.session
    });
});

// Обработка добавления категории
router.post('/admin/categories/add', checkAdmin, (req, res) => {
    const { IncomingForm } = require('formidable');
    const uploadDir = path.join(__dirname, '../public/images/categories');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
        multiples: false
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parsing error:', err);
            return res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
        }

        const name = Array.isArray(fields.categorieName) ? fields.categorieName[0] : fields.categorieName;
        const description = Array.isArray(fields.categorieDescription) ? fields.categorieDescription[0] : fields.categorieDescription;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Название категории обязательно' });
        }

        let thumbnail = null;
        if (files.categorieThumbnail) {
            const file = Array.isArray(files.categorieThumbnail) ? files.categorieThumbnail[0] : files.categorieThumbnail;
            if (file.size > 0) {
                const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
                const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
                const ext = path.extname(file.originalFilename).toLowerCase();
                if (!allowedExt.includes(ext) || !allowedMime.includes(file.mimetype)) {
                    if (file.filepath && fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                    return res.status(400).json({ success: false, message: 'Недопустимый формат изображения. Разрешены JPG, PNG, WebP.' });
                }
                const newFileName = `cat_${Date.now()}_${file.originalFilename || 'category.jpg'}`;
                const newPath = path.join(uploadDir, newFileName);
                fs.renameSync(file.filepath, newPath);
                thumbnail = newFileName;
            }
        }

        connection.addCategory(name, description, thumbnail, (err, categoryID) => {
            if (err) {
                console.error('Category add error:', err);
                return res.status(500).json({ success: false, message: 'Ошибка при добавлении категории' });
            }
            res.json({ success: true, message: 'Категория добавлена', categoryID: categoryID });
        });
    });
});

// Страница редактирования категории
router.get('/admin/categories/edit/:id', checkAdmin, (req, res) => {
    const categoryID = req.params.id;
    connection.getCategoryById(categoryID, (err, category) => {
        if (err || !category) {
            return res.status(404).send('Категория не найдена');
        }
        res.render('layout', {
            body: 'edit_category',
            category: category,
            session: req.session
        });
    });
});

// Обработка редактирования категории
router.post('/admin/categories/edit/:id', checkAdmin, (req, res) => {
    const categoryID = req.params.id;
    const uploadDir = path.join(__dirname, '../public/images/categories');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Сначала получаем текущую категорию
    connection.getCategoryById(categoryID, (err, oldCategory) => {
        if (err || !oldCategory) {
            return res.status(404).json({ success: false, message: 'Категория не найдена' });
        }

        const { IncomingForm } = require('formidable');
        const form = new IncomingForm({
            uploadDir: uploadDir,
            keepExtensions: true,
            allowEmptyFiles: true,
            minFileSize: 0,
            maxFileSize: 5 * 1024 * 1024,
            multiples: false
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Form parsing error:', err);
                return res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
            }

            const name = Array.isArray(fields.categorieName) ? fields.categorieName[0] : fields.categorieName;
            const description = Array.isArray(fields.categorieDescription) ? fields.categorieDescription[0] : fields.categorieDescription;

            if (!name) {
                return res.status(400).json({ success: false, message: 'Название категории обязательно' });
            }

            let thumbnail = undefined;
            const keepCurrent = fields.keepCurrentThumbnail === 'on' || fields.keepCurrentThumbnail === 'true';
            if (!keepCurrent && files.categorieThumbnail) {
                const file = Array.isArray(files.categorieThumbnail) ? files.categorieThumbnail[0] : files.categorieThumbnail;
                if (file.size > 0) {
                    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
                    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
                    const ext = path.extname(file.originalFilename).toLowerCase();
                    if (!allowedExt.includes(ext) || !allowedMime.includes(file.mimetype)) {
                        if (file.filepath && fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                        return res.status(400).json({ success: false, message: 'Недопустимый формат изображения. Разрешены JPG, PNG, WebP.' });
                    }
                    const newFileName = `cat_${Date.now()}_${file.originalFilename || 'category.jpg'}`;
                    const newPath = path.join(uploadDir, newFileName);
                    fs.renameSync(file.filepath, newPath);
                    thumbnail = newFileName;

                    // Удаляем старый файл, если он существует
                    if (oldCategory.categorieThumbnail) {
                        const oldPath = path.join(uploadDir, oldCategory.categorieThumbnail);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    }
                }
            }

            connection.updateCategory(categoryID, name, description, thumbnail, (err) => {
                if (err) {
                    console.error('Category update error:', err);
                    return res.status(500).json({ success: false, message: 'Ошибка при обновлении категории' });
                }
                res.json({ success: true, message: 'Категория обновлена' });
            });
        });
    });
});

// Удаление категории
router.delete('/admin/categories/delete/:id', checkAdmin, (req, res) => {
    const categoryID = req.params.id;
    connection.deleteCategory(categoryID, (err) => {
        if (err) {
            console.error('Category delete error:', err);
            return res.status(500).json({ success: false, message: 'Ошибка при удалении категории' });
        }
        res.json({ success: true, message: 'Категория удалена' });
    });
});

module.exports = router;
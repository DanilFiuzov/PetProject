const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// ---------- Вспомогательные функции ----------
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    next();
};

const checkAdmin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    connection.getUserRank(req.session.userId, (err, results) => {
        if (err || !results.length || results[0].customerRank !== 'admin') {
            return res.status(403).render('layout', { body: 'error', error: 'Доступ запрещён' });
        }
        next();
    });
};

// Форматирование подсказок поиска (без изменений)
function formatSuggestions(results) {
    return results.map(product => {
        const now = new Date();
        const startDate = product.discount_start_date ? new Date(product.discount_start_date) : null;
        const endDate = product.discount_end_date ? new Date(product.discount_end_date) : null;
        const isDiscountActive = product.is_on_sale && product.discount_percentage > 0 &&
            (!startDate || now >= startDate) && (!endDate || now <= endDate);
        let displayPrice = parseFloat(product.productPrice) || 0;
        let originalPrice = parseFloat(product.productPrice) || 0;
        if (isDiscountActive) {
            displayPrice -= displayPrice * parseFloat(product.discount_percentage) / 100;
        }
        return {
            id: product.productID,
            title: product.productTitle,
            thumbnail: product.productThumbnail,
            manufacturer: product.productManufacturer,
            rating: product.productRating || 0,
            price: displayPrice.toFixed(2),
            originalPrice: originalPrice.toFixed(2),
            isDiscounted: isDiscountActive,
            discountPercentage: isDiscountActive ? parseFloat(product.discount_percentage).toFixed(0) : 0
        };
    });
}

// ---------- РОУТЫ ----------

// Главная
router.get('/', async (req, res) => {
    try {
        const [popularProducts, categories, discountedProducts] = await Promise.all([
            new Promise(resolve => connection.getPopularProducts(8, (err, data) => resolve(err ? [] : data))),
            new Promise(resolve => connection.getAllCategoriesFull((err, data) => resolve(err ? [] : data))),
            new Promise(resolve => connection.getDiscountedProducts(6, (err, data) => resolve(err ? [] : data)))
        ]);

        const mainCategories = categories.slice(0, 3);
        const otherCategoriesCount = Math.max(0, categories.length - 3);

        // Получаем иконки категорий для товаров
        const allProductIds = [...popularProducts.map(p => p.productID), ...discountedProducts.map(p => p.productID)];
        const iconsMap = await new Promise(resolve => connection.getCategoryIconsForProducts(allProductIds, (err, map) => resolve(err ? {} : map)));

        const popularWithIcons = popularProducts.map(p => ({ ...p, categories: iconsMap[p.productID] || [] }));
        const discountedWithIcons = discountedProducts.map(p => ({ ...p, categories: iconsMap[p.productID] || [] }));

        // Отмечаем избранное
        const favSet = new Set(res.locals.userFavorites);
        const markFavorites = (products) => products.map(p => ({ ...p, isFavorite: favSet.has(p.productID) }));

        res.render('layout', {
            body: 'home',
            mainCategories,
            otherCategoriesCount,
            popularProducts: markFavorites(popularWithIcons),
            discountedProducts: markFavorites(discountedWithIcons)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка загрузки главной страницы');
    }
});

// Каталог товаров
router.get('/products', (req, res) => {
    connection.getPriceBounds((err, boundsResult) => {
        const dbMin = boundsResult?.[0]?.min_price || 0;
        const dbMax = boundsResult?.[0]?.max_price || 100000;
        const sliderMin = Math.max(0, Math.floor(dbMin / 100) * 100);
        const sliderMax = Math.ceil(dbMax * 1.1 / 100) * 100;
        let minPrice = parseFloat(req.query.minPrice) || sliderMin;
        let maxPrice = parseFloat(req.query.maxPrice) || sliderMax;
        minPrice = Math.min(Math.max(minPrice, sliderMin), sliderMax);
        maxPrice = Math.min(Math.max(maxPrice, sliderMin), sliderMax);

        const searchQuery = req.query.search || '';
        const category = req.query.category || '';
        const onSale = req.query.onSale === 'true';
        const inStock = req.query.inStock === 'true';
        const sort = req.query.sort || 'newest';
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        const categoryIds = category.split(',').filter(id => id);

        const filters = { searchQuery, categoryIds, minPrice, maxPrice, onSale, inStock, sort, limit, offset };

        connection.getProductCount(filters, (err, countResult) => {
            if (err) return res.status(500).send('Ошибка подсчёта товаров');
            const totalProducts = countResult[0].total;
            const totalPages = Math.ceil(totalProducts / limit);

            connection.getCatalogProducts(req.session.userId, filters, (err, catalogData) => {
                if (err) return res.status(500).send('Ошибка получения товаров');
                const productIDs = catalogData.products.map(p => p.productID);
                connection.getCategoryIconsForProducts(productIDs, (iconErr, iconsMap) => {
                    catalogData.products = catalogData.products.map(p => ({
                        ...p,
                        categories: iconsMap[p.productID] || []
                    }));
                    connection.connection.query('SELECT categorieID, categorieName FROM categories ORDER BY categorieName', (err, allCategories) => {
                        res.render('layout', {
                            body: 'products',
                            products: catalogData.products,
                            allCategories: allCategories || [],
                            searchQuery, category, minPrice, maxPrice, sliderMin, sliderMax,
                            onSale, inStock, sort, currentPage: page, totalPages, totalProducts, limit
                        });
                    });
                });
            });
        });
    });
});

// Старая страница категорий — редирект на каталог
router.get('/categories', (req, res) => res.redirect('/products'));

// API поиска (без изменений)
router.get('/api/search-suggestions', (req, res) => {
    const query = req.query.query || '';
    const isPopular = req.query.popular === 'true';
    if (isPopular && !query) {
        connection.getPopularSearchSuggestions(5, (err, results) => {
            res.json(err ? [] : formatSuggestions(results));
        });
        return;
    }
    if (query.length < 2) return res.json([]);
    connection.searchProducts(query, 8, (err, results) => {
        res.json(err ? [] : formatSuggestions(results));
    });
});

// Аутентификация (без изменений)
router.get('/login', (req, res) => res.render('layout', { body: 'login' }));
router.get('/register', (req, res) => res.render('layout', { body: 'register' }));

router.post('/register', (req, res) => {
    const { username, password, email, confirmpassword } = req.body;
    if (!username || !password || !email || !confirmpassword) {
        return res.render('layout', { error: 'Заполните все поля!', body: 'register' });
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) return res.render('layout', { error: 'Неверный email!', body: 'register' });
    if (username.length > 16) return res.render('layout', { error: 'Псевдоним не может быть больше 16 символов!', body: 'register' });
    if (password !== confirmpassword) return res.render('layout', { error: 'Пароли не совпадают!', body: 'register' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    connection.findUserByUsername(email, (err, results) => {
        if (results?.length) return res.render('layout', { error: 'Такой пользователь уже есть!', body: 'register' });
        connection.createUser(username, hashedPassword, email, (err) => {
            if (err) return res.render('layout', { error: 'Ошибка регистрации!', body: 'register' });
            res.redirect('/');
        });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.render('layout', { error: 'Заполните все поля!', body: 'login' });
    connection.findUserByUsername(email, (err, results) => {
        if (err || !results.length) return res.render('layout', { error: 'Неверный email или пароль', body: 'login' });
        const user = results[0];
        if (!bcrypt.compareSync(password, user.customerPassword)) {
            return res.render('layout', { error: 'Неверный пароль!', body: 'login' });
        }
        req.session.userId = user.customerID;
        req.session.userThumbnail = user.customerThumbnail;
        req.session.userEmail = user.customerEmail;
        req.session.userName = user.customerName;
        req.session.userRank = user.customerRank || 'user';
        res.redirect('/');
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => res.redirect('/'));
});

// Профиль пользователя
router.get('/acc_page', isAuthenticated, (req, res) => {
    connection.connection.query('SELECT * FROM customers WHERE customerID = ?', [req.session.userId], (err, users) => {
        if (err || !users.length) return res.redirect('/login');
        const user = users[0];
        // Заказы получаем отдельно
        connection.getOrdersByCustomer(req.session.userId, (err, orders) => {
            res.render('layout', {
                body: 'acc_page',
                user,
                orders: err ? [] : orders,
                favoritesCount: res.locals.userFavoritesCount,
                cartCount: res.locals.userCartCount
            });
        });
    });
});

// Аватары
let avatars = [];
const loadAvatars = () => {
    const avatarsDir = path.join(__dirname, '../public/images/Avatars');
    if (fs.existsSync(avatarsDir)) {
        avatars = fs.readdirSync(avatarsDir).map(file => ({ url: `/images/Avatars/${file}` }));
    }
};
loadAvatars();

router.get('/select_thumbnail', isAuthenticated, (req, res) => {
    res.render('layout', { body: 'select_avatar', avatars });
});
router.post('/upload', isAuthenticated, (req, res) => {
    const avatar = avatars[req.body.avatar]?.url;
    if (!avatar) return res.status(400).send('Неверный аватар');
    connection.UpdateAvatar(avatar, req.session.userId, (err) => {
        if (err) return res.render('layout', { error: 'Ошибка', body: 'acc_page' });
        req.session.userThumbnail = avatar;
        res.redirect('/acc_page');
    });
});

// Корзина
router.get('/cart/:userId', isAuthenticated, (req, res) => {
    if (req.session.userId != req.params.userId) return res.redirect('/login');
    connection.getCartWithProducts(req.session.userId, (err, products) => {
        res.render('layout', { body: 'cart', products: err ? [] : products });
    });
});

router.post('/cart/add', isAuthenticated, (req, res) => {
    const { productID } = req.body;
    connection.getProductByID(productID, (err, product) => {
        if (err || !product || product.stock_quantity <= 0) {
            return res.json({ success: false, message: 'Товар недоступен' });
        }
        const currentQty = req.session.cart[productID]?.sc_count || 0;
        if (currentQty + 1 > product.stock_quantity) {
            return res.json({ success: false, message: 'Превышен лимит' });
        }
        if (currentQty > 0) {
            connection.updateCartItem(req.session.userId, productID, 'increase', (err) => {
                if (err) return res.status(500).json({ success: false });
                req.session.cart[productID].sc_count++;
                req.session.cartCount++;
                res.json({ success: true, cartCount: req.session.cartCount });
            });
        } else {
            connection.addToCart(req.session.userId, productID, (err) => {
                if (err) return res.status(500).json({ success: false });
                req.session.cart[productID] = { sc_count: 1 };
                req.session.cartCount++;
                res.json({ success: true, cartCount: req.session.cartCount });
            });
        }
    });
});

router.post('/cart/update', isAuthenticated, (req, res) => {
    const { productID, action } = req.body;
    connection.getCartByCustomerID(req.session.userId, (err, items) => {
        const item = items.find(i => i.productID == productID);
        if (!item) return res.status(404).send('Товар не найден');
        connection.getProductByID(productID, (err, product) => {
            if (action === 'increase' && item.sc_count + 1 > product.stock_quantity) {
                return res.status(400).send('Недостаточно товара');
            }
            connection.updateCartItem(req.session.userId, productID, action, (err) => {
                if (err) return res.status(500).send('Ошибка');
                res.redirect('/cart/' + req.session.userId);
            });
        });
    });
});

router.post('/cart/remove', isAuthenticated, (req, res) => {
    connection.removeFromCart(req.session.userId, req.body.productID, (err) => {
        res.redirect('/cart/' + req.session.userId);
    });
});

router.post('/cart/clear', isAuthenticated, (req, res) => {
    connection.connection.query('DELETE FROM shopping_cart WHERE customerID = ?', [req.session.userId], (err) => {
        req.session.cart = {};
        req.session.cartCount = 0;
        res.redirect('/cart/' + req.session.userId);
    });
});

// Избранное
router.get('/favorites', isAuthenticated, (req, res) => {
    const favoriteIds = res.locals.userFavorites;
    if (!favoriteIds.length) return res.render('layout', { body: 'favorites', products: [] });
    connection.connection.query(`SELECT * FROM products WHERE productID IN (${favoriteIds.map(() => '?').join(',')})`, favoriteIds, (err, products) => {
        const processed = products.map(p => ({ ...p, priceInfo: connection.calculateDiscountedPrice(p) }));
        connection.getCategoryIconsForProducts(favoriteIds, (iconErr, iconsMap) => {
            const productsWithIcons = processed.map(p => ({ ...p, categories: iconsMap[p.productID] || [] }));
            res.render('layout', { body: 'favorites', products: productsWithIcons });
        });
    });
});

router.post('/favorites/add', isAuthenticated, (req, res) => {
    connection.addToFavorites(req.body.productID, req.session.userId, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

router.post('/favorites/remove', isAuthenticated, (req, res) => {
    connection.removeFromFavorites(req.body.productID, req.session.userId, (err) => {
        res.json({ success: !err });
    });
});

router.post('/favorites/clear-all', isAuthenticated, (req, res) => {
    connection.connection.query('DELETE FROM favorites WHERE customerID = ?', [req.session.userId], (err) => {
        res.json({ success: !err });
    });
});

// Товар
router.get('/product/:id', (req, res) => {
    connection.getProductByID(req.params.id, (err, product) => {
        if (err || !product) return res.status(404).send('Товар не найден');
        const priceInfo = connection.calculateDiscountedPrice(product);
        const categoryQuery = `SELECT c.categorieName, c.categorieThumbnail FROM categories c JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID WHERE cp.productID = ?`;
        connection.connection.query(categoryQuery, [req.params.id], (catErr, categories) => {
            connection.getProductFeatures(req.params.id, (featErr, features) => {
                connection.getProductReviews(req.params.id, (revErr, reviews) => {
                    connection.getReviewStats(req.params.id, (statsErr, stats) => {
                        const statsMap = { 5:0,4:0,3:0,2:0,1:0 };
                        stats?.forEach(s => { if (s.rating >= 1 && s.rating <= 5) statsMap[s.rating] = { count: s.count, percentage: s.percentage }; });
                        const overallRating = product.productRating || (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
                        const hasReviewed = req.session.userId ? await new Promise(resolve => connection.hasUserReviewed(req.params.id, req.session.userId, (e, r) => resolve(r))) : false;
                        res.render('layout', {
                            body: 'product',
                            product: { ...product, categories: categories.map(c => ({ name: c.categorieName, icon: c.categorieThumbnail ? `/images/categories/${c.categorieThumbnail}` : null })), productRating: overallRating, priceInfo },
                            features: features || [],
                            reviews: reviews || [],
                            reviewStats: statsMap,
                            hasReviewed,
                            overallRating
                        });
                    });
                });
            });
        });
    });
});

// Отзывы (API)
router.get('/api/reviews/:productID', (req, res) => {
    connection.getProductReviews(req.params.productID, (err, reviews) => {
        connection.getReviewStats(req.params.productID, (errStats, stats) => {
            res.json({ reviews: err ? [] : reviews, stats: errStats ? [] : stats });
        });
    });
});
router.get('/api/reviews/:productID/check', (req, res) => {
    if (!req.session.userId) return res.json({ hasReviewed: false });
    connection.hasUserReviewed(req.params.productID, req.session.userId, (err, hasReviewed) => {
        res.json({ hasReviewed: !!hasReviewed });
    });
});
router.post('/api/reviews', isAuthenticated, (req, res) => {
    const { productID, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5 || !comment || comment.trim().length < 10) {
        return res.status(400).json({ error: 'Неверные данные' });
    }
    connection.addReview(productID, req.session.userId, rating, comment.trim(), (err) => {
        if (err?.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Вы уже оставили отзыв' });
        if (err) return res.status(500).json({ error: 'Ошибка' });
        res.json({ success: true });
    });
});

// Админка (товары)
router.get('/admin/add-product', checkAdmin, (req, res) => {
    connection.connection.query('SELECT categorieID, categorieName FROM categories ORDER BY categorieName', (err, categories) => {
        res.render('layout', { body: 'add_product', categories: err ? [] : categories });
    });
});
router.post('/admin/add-product', checkAdmin, (req, res) => { /* ... (без изменений, но можно упростить) ... */ });
router.get('/admin/edit-product/:id', checkAdmin, (req, res) => { /* ... */ });
router.post('/admin/update-product', checkAdmin, (req, res) => { /* ... */ });
router.delete('/admin/delete-product/:id', checkAdmin, (req, res) => { /* ... */ });
router.get('/admin/products', checkAdmin, (req, res) => { /* ... */ });

// Админка (категории)
router.get('/admin/categories', checkAdmin, (req, res) => {
    connection.getAllCategoriesFull((err, categories) => {
        res.render('layout', { body: 'admin_categories', categories: err ? [] : categories });
    });
});
router.get('/admin/categories/add', checkAdmin, (req, res) => res.render('layout', { body: 'add_category' }));
router.post('/admin/categories/add', checkAdmin, (req, res) => { /* ... */ });
router.get('/admin/categories/edit/:id', checkAdmin, (req, res) => { /* ... */ });
router.post('/admin/categories/edit/:id', checkAdmin, (req, res) => { /* ... */ });
router.delete('/admin/categories/delete/:id', checkAdmin, (req, res) => { /* ... */ });

// Оформление заказа
router.get('/checkout', isAuthenticated, (req, res) => {
    connection.getCartWithProducts(req.session.userId, (err, products) => {
        if (err || !products.length) return res.redirect('/cart/' + req.session.userId);
        connection.getDeliveryPoints((err, points) => {
            const totalPrice = products.reduce((sum, p) => sum + (p.isDiscounted ? parseFloat(p.discountedPrice) : parseFloat(p.productPrice)) * p.sc_count, 0);
            res.render('layout', { body: 'checkout', products, deliveryPoints: points || [], totalPrice });
        });
    });
});
router.post('/checkout/process', isAuthenticated, (req, res) => { /* ... (сложный, оставлен как есть) ... */ });
router.get('/checkout/success/:orderID', isAuthenticated, (req, res) => { /* ... */ });
router.get('/my-orders', isAuthenticated, (req, res) => {
    connection.getOrdersByCustomer(req.session.userId, (err, orders) => {
        res.render('layout', { body: 'my_orders', orders: err ? [] : orders });
    });
});
router.get('/order/:orderID', isAuthenticated, (req, res) => { /* ... */ });
router.get('/payment/sbp/:orderID', isAuthenticated, (req, res) => { /* ... */ });
router.get('/payment/confirm/:orderID', isAuthenticated, (req, res) => { /* ... */ });

// Прочее
router.post('/logoutandchange', isAuthenticated, (req, res) => {
    if (req.body.logoutandchange === 'logout') return res.redirect('/logout');
    if (req.body.logoutandchange === 'update') {
        const newName = req.body.acc_label_name;
        if (newName.length > 16) return res.render('layout', { body: 'acc_page', global_error: 'Максимум 16 символов' });
        connection.UpdateName(newName, req.session.userId, (err) => {
            if (err) return res.render('layout', { body: 'acc_page', global_error: 'Ошибка' });
            req.session.userName = newName;
            res.redirect('/acc_page');
        });
    } else res.redirect('/acc_page');
});

module.exports = router;
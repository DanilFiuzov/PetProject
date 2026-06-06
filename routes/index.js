const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
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

// Аватары
let avatars = [];
const loadAvatars = () => {
    const avatarsDir = path.join(__dirname, '../public/images/Avatars');
    if (fs.existsSync(avatarsDir)) {
        avatars = fs.readdirSync(avatarsDir).map(file => ({ url: `/images/Avatars/${file}` }));
    }
};
loadAvatars();

// ========== ОСНОВНЫЕ МАРШРУТЫ ==========
router.get('/', async (req, res) => {
    try {
        const [popularProducts, categories, discountedProducts] = await Promise.all([
            new Promise(resolve => connection.getPopularProducts(8, (err, data) => resolve(err ? [] : data))),
            new Promise(resolve => connection.getAllCategoriesFull((err, data) => resolve(err ? [] : data))),
            new Promise(resolve => connection.getDiscountedProducts(6, (err, data) => resolve(err ? [] : data)))
        ]);
        const mainCategories = categories.slice(0, 3);
        const otherCategoriesCount = Math.max(0, categories.length - 3);
        const allProductIds = [...popularProducts.map(p => p.productID), ...discountedProducts.map(p => p.productID)];
        const iconsMap = await new Promise(resolve => connection.getCategoryIconsForProducts(allProductIds, (err, map) => resolve(err ? {} : map)));
        const popularWithIcons = popularProducts.map(p => ({ ...p, categories: iconsMap[p.productID] || [] }));
        const discountedWithIcons = discountedProducts.map(p => ({ ...p, categories: iconsMap[p.productID] || [] }));
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

router.get('/categories', (req, res) => res.redirect('/products'));

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

// ========== АУТЕНТИФИКАЦИЯ ==========
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

// ========== ПРОФИЛЬ ==========
router.get('/acc_page', isAuthenticated, (req, res) => {
    connection.connection.query('SELECT * FROM customers WHERE customerID = ?', [req.session.userId], (err, users) => {
        if (err || !users.length) return res.redirect('/login');
        const user = users[0];
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

// ========== КОРЗИНА ==========
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

// ========== ИЗБРАННОЕ ==========
router.get('/favorites', isAuthenticated, (req, res) => {
    const favoriteIds = res.locals.userFavorites;
    if (!favoriteIds.length) return res.render('layout', { body: 'favorites', products: [] });
    connection.connection.query(`SELECT * FROM products WHERE productID IN (${favoriteIds.map(() => '?').join(',')})`, favoriteIds, (err, products) => {
        if (err) return res.render('layout', { body: 'favorites', products: [] });
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

// ========== ТОВАР И ОТЗЫВЫ ==========
router.get('/product/:id', async (req, res) => {
    const productId = req.params.id;
    connection.getProductByID(productId, (err, product) => {
        if (err || !product) return res.status(404).send('Товар не найден');
        const priceInfo = connection.calculateDiscountedPrice(product);
        const categoryQuery = `SELECT c.categorieName, c.categorieThumbnail FROM categories c JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID WHERE cp.productID = ?`;
        connection.connection.query(categoryQuery, [productId], (catErr, categories) => {
            connection.getProductFeatures(productId, (featErr, features) => {
                connection.getProductReviews(productId, (revErr, reviews) => {
                    connection.getReviewStats(productId, (statsErr, stats) => {
                        const statsMap = { 5:0,4:0,3:0,2:0,1:0 };
                        stats?.forEach(s => { if (s.rating >= 1 && s.rating <= 5) statsMap[s.rating] = { count: s.count, percentage: s.percentage }; });
                        const overallRating = product.productRating || (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
                        if (req.session.userId) {
                            connection.hasUserReviewed(productId, req.session.userId, (checkErr, hasReviewed) => {
                                res.render('layout', {
                                    body: 'product',
                                    product: { ...product, categories: categories.map(c => ({ name: c.categorieName, icon: c.categorieThumbnail ? `/images/categories/${c.categorieThumbnail}` : null })), productRating: overallRating, priceInfo },
                                    features: features || [],
                                    reviews: reviews || [],
                                    reviewStats: statsMap,
                                    hasReviewed: !!hasReviewed,
                                    overallRating
                                });
                            });
                        } else {
                            res.render('layout', {
                                body: 'product',
                                product: { ...product, categories: categories.map(c => ({ name: c.categorieName, icon: c.categorieThumbnail ? `/images/categories/${c.categorieThumbnail}` : null })), productRating: overallRating, priceInfo },
                                features: features || [],
                                reviews: reviews || [],
                                reviewStats: statsMap,
                                hasReviewed: false,
                                overallRating
                            });
                        }
                    });
                });
            });
        });
    });
});

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

// ========== АДМИНКА: ТОВАРЫ ==========
router.get('/admin/add-product', checkAdmin, (req, res) => {
    connection.connection.query('SELECT categorieID, categorieName FROM categories ORDER BY categorieName', (err, categories) => {
        res.render('layout', { body: 'add_product', categories: err ? [] : categories });
    });
});

router.post('/admin/add-product', checkAdmin, (req, res) => {
    const uploadDir = path.join(__dirname, '../public/images/products');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const form = new IncomingForm({ uploadDir, keepExtensions: true, maxFileSize: 10 * 1024 * 1024, multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
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
                        uploadedImages.push({ imageUrl: newFileName, is_primary: index === 0, sort_order: index });
                    } else hasImageError = true;
                });
                if (uploadedImages.length === 0) hasImageError = true;
            } else hasImageError = true;
        } catch (fileError) { hasImageError = true; }
        if (hasImageError) return res.status(400).json({ success: false, message: 'Ошибка обработки изображений' });
        const primaryIndex = parseInt(Array.isArray(fields.primaryImage) ? fields.primaryImage[0] : fields.primaryImage) || 0;
        uploadedImages.forEach((img, idx) => { img.is_primary = (idx === primaryIndex) ? 1 : 0; });
        const isOnSaleRaw = Array.isArray(fields.is_on_sale) ? fields.is_on_sale[0] : fields.is_on_sale;
        let isOnSale = isOnSaleRaw === '1' ? '1' : '0';
        const parseDiscountPercent = () => { if (!fields.discount_percentage && fields.discount_percentage !== '0') return 0; const raw = Array.isArray(fields.discount_percentage) ? fields.discount_percentage[0] : fields.discount_percentage; return parseFloat(raw) || 0; };
        const parseDateField = (fieldName) => { const raw = Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName]; if (!raw || raw.trim() === '') return null; let datetime = raw.trim(); datetime = datetime.replace('T', ' '); if (datetime.length === 16) datetime += ':00'; return datetime; };
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
        if (fields['categories[]']) categories = Array.isArray(fields['categories[]']) ? fields['categories[]'] : [fields['categories[]']];
        const features = [];
        if (fields['feature_keys[]'] && fields['feature_values[]']) {
            const keys = Array.isArray(fields['feature_keys[]']) ? fields['feature_keys[]'] : [fields['feature_keys[]']];
            const values = Array.isArray(fields['feature_values[]']) ? fields['feature_values[]'] : [fields['feature_values[]']];
            keys.forEach((key, index) => { if (key && key.trim() && values[index] && values[index].trim()) features.push({ key: key.trim(), value: values[index].trim() }); });
        }
        connection.addProductWithFeatures(productData, categories, features, (err, productID) => {
            if (err) return res.status(500).json({ success: false, message: 'Ошибка базы данных: ' + err.message });
            connection.saveProductImages(productID, uploadedImages, (imgErr) => { if (imgErr) console.error('Ошибка сохранения изображений:', imgErr); });
            res.json({ success: true, message: 'Товар добавлен', productID });
        });
    });
});

router.get('/admin/edit-product/:id', checkAdmin, (req, res) => {
    const productId = req.params.id;
    connection.getProductByID(productId, (err, product) => {
        if (err || !product) return res.status(404).send('Товар не найден');
        connection.connection.query(`SELECT c.categorieName FROM categories c JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID WHERE cp.productID = ?`, [productId], (catErr, categoryResults) => {
            const currentCategories = categoryResults.map(cat => cat.categorieName);
            connection.getProductFeatures(productId, (featErr, features) => {
                connection.connection.query('SELECT categorieID, categorieName FROM categories ORDER BY categorieName', (allErr, allCategories) => {
                    res.render('layout', { body: 'edit_product', product, currentCategories, features: features || [], categories: allCategories || [] });
                });
            });
        });
    });
});

router.post('/admin/update-product', checkAdmin, (req, res) => {
    const uploadDir = path.join(__dirname, '../public/images/products');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const form = new IncomingForm({ uploadDir, keepExtensions: true, allowEmptyFiles: true, minFileSize: 0, maxFileSize: 10 * 1024 * 1024, multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ success: false, message: 'Ошибка обработки формы' });
        const productID = Array.isArray(fields.productID) ? fields.productID[0] : fields.productID;
        if (!productID) return res.status(400).json({ success: false, message: 'Не указан ID товара' });
        const isOnSaleRaw = Array.isArray(fields.is_on_sale) ? fields.is_on_sale[0] : fields.is_on_sale;
        let isOnSale = isOnSaleRaw === '1' ? '1' : '0';
        const parseDiscountPercent = () => { if (!fields.discount_percentage && fields.discount_percentage !== '0') return 0; const raw = Array.isArray(fields.discount_percentage) ? fields.discount_percentage[0] : fields.discount_percentage; return parseFloat(raw) || 0; };
        const parseDateField = (fieldName) => { const raw = Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName]; if (!raw || raw.trim() === '') return null; let datetime = raw.trim(); datetime = datetime.replace('T', ' '); if (datetime.length === 16) datetime += ':00'; return datetime; };
        if (!fields.productTitle || !fields.productManufacturer || !fields.productDescription || !fields.productPrice) {
            return res.status(400).json({ success: false, message: 'Заполните обязательные поля' });
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
            } catch (fileError) { console.error(fileError); }
        }
        if (uploadedImages.length > 0) {
            const primaryIndex = parseInt(Array.isArray(fields.primaryImage) ? fields.primaryImage[0] : fields.primaryImage) || 0;
            uploadedImages.forEach((img, idx) => { img.is_primary = (idx === primaryIndex) ? 1 : 0; });
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
        if (uploadedImages.length > 0) productData.productThumbnail = uploadedImages[0].imageUrl;
        else productData.productThumbnail = null;
        let categories = [];
        if (fields['categories[]']) categories = Array.isArray(fields['categories[]']) ? fields['categories[]'] : [fields['categories[]']];
        else if (fields.categories) categories = Array.isArray(fields.categories) ? fields.categories : [fields.categories];
        const features = [];
        const keys = Array.isArray(fields['feature_keys[]']) ? fields['feature_keys[]'] : (fields['feature_keys[]'] ? [fields['feature_keys[]']] : []);
        const values = Array.isArray(fields['feature_values[]']) ? fields['feature_values[]'] : (fields['feature_values[]'] ? [fields['feature_values[]']] : []);
        keys.forEach((key, index) => { if (key && key.trim() && values[index] && values[index].trim()) features.push({ key: key.trim(), value: values[index].trim() }); });
        connection.updateProduct(productID, productData, categories, features, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Ошибка обновления товара' });
            if (!keepCurrentImage && uploadedImages.length > 0) {
                connection.getProductImages(productID, (imgErr, oldImages) => {
                    if (!imgErr && oldImages) oldImages.forEach(img => { const oldPath = path.join(uploadDir, img.imageUrl); if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); });
                    connection.deleteProductImages(productID, (delErr) => { if (delErr) console.error(delErr); });
                    connection.saveProductImages(productID, uploadedImages, (saveErr) => { if (saveErr) console.error(saveErr); });
                });
            }
            res.json({ success: true, message: 'Товар обновлён' });
        });
    });
});

router.delete('/admin/delete-product/:id', checkAdmin, (req, res) => {
    connection.deleteProduct(req.params.id, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Ошибка удаления' });
        res.json({ success: true, message: 'Товар удалён' });
    });
});

router.get('/admin/products', checkAdmin, (req, res) => {
    const searchQuery = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    connection.connection.query('SELECT COUNT(*) as total FROM products', (err, countResult) => {
        if (err) return res.status(500).send('Ошибка подсчёта');
        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);
        let productsQuery = 'SELECT * FROM products ORDER BY productID LIMIT ? OFFSET ?';
        let queryParams = [limit, offset];
        if (searchQuery) {
            productsQuery = `SELECT * FROM products WHERE productTitle LIKE ? OR productManufacturer LIKE ? OR productDescription LIKE ? ORDER BY productID LIMIT ? OFFSET ?`;
            const searchPattern = `%${searchQuery}%`;
            queryParams = [searchPattern, searchPattern, searchPattern, limit, offset];
        }
        connection.connection.query(productsQuery, queryParams, (err, products) => {
            if (err) return res.status(500).send('Ошибка получения товаров');
            connection.getAllCategoriesFull((catErr, categories) => {
                if (products.length === 0) {
                    return res.render('layout', { body: 'admin_products', products: [], categories: catErr ? [] : categories, pagination: { currentPage: page, totalPages, totalProducts, hasPrev: page > 1, hasNext: page < totalPages, searchQuery } });
                }
                const productsWithDetails = [];
                let processed = 0;
                products.forEach((product, index) => {
                    connection.connection.query(`SELECT c.categorieName FROM categories c JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID WHERE cp.productID = ?`, [product.productID], (catErr, productCats) => {
                        const categoryNames = productCats.map(cat => cat.categorieName);
                        connection.connection.query('SELECT COUNT(*) as count FROM product_features WHERE productID = ?', [product.productID], (featErr, featuresResult) => {
                            productsWithDetails[index] = { ...product, categories: categoryNames, featuresCount: featuresResult[0].count || 0 };
                            processed++;
                            if (processed === products.length) {
                                const productIds = productsWithDetails.map(p => p.productID);
                                connection.getCategoryIconsForProducts(productIds, (iconErr, iconsMap) => {
                                    const enriched = productsWithDetails.map(p => ({ ...p, categories: iconsMap[p.productID] || [] }));
                                    res.render('layout', { body: 'admin_products', products: enriched, categories: catErr ? [] : categories, pagination: { currentPage: page, totalPages, totalProducts, hasPrev: page > 1, hasNext: page < totalPages, searchQuery } });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});

// ========== АДМИНКА: КАТЕГОРИИ ==========
router.get('/admin/categories', checkAdmin, (req, res) => {
    connection.getAllCategoriesFull((err, categories) => {
        res.render('layout', { body: 'admin_categories', categories: err ? [] : categories });
    });
});

router.get('/admin/categories/add', checkAdmin, (req, res) => {
    res.render('layout', { body: 'add_category' });
});

router.post('/admin/categories/add', checkAdmin, (req, res) => {
    const uploadDir = path.join(__dirname, '../public/images/categories');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const form = new IncomingForm({ uploadDir, keepExtensions: true, maxFileSize: 5 * 1024 * 1024, multiples: false });
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
        const name = Array.isArray(fields.categorieName) ? fields.categorieName[0] : fields.categorieName;
        const description = Array.isArray(fields.categorieDescription) ? fields.categorieDescription[0] : fields.categorieDescription;
        if (!name) return res.status(400).json({ success: false, message: 'Название категории обязательно' });
        let thumbnail = null;
        if (files.categorieThumbnail) {
            const file = Array.isArray(files.categorieThumbnail) ? files.categorieThumbnail[0] : files.categorieThumbnail;
            if (file.size > 0) {
                const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
                const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
                const ext = path.extname(file.originalFilename).toLowerCase();
                if (!allowedExt.includes(ext) || !allowedMime.includes(file.mimetype)) {
                    if (file.filepath && fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                    return res.status(400).json({ success: false, message: 'Недопустимый формат изображения' });
                }
                const newFileName = `cat_${Date.now()}_${file.originalFilename || 'category.jpg'}`;
                const newPath = path.join(uploadDir, newFileName);
                fs.renameSync(file.filepath, newPath);
                thumbnail = newFileName;
            }
        }
        connection.addCategory(name, description, thumbnail, (err, categoryID) => {
            if (err) return res.status(500).json({ success: false, message: 'Ошибка добавления категории' });
            res.json({ success: true, message: 'Категория добавлена', categoryID });
        });
    });
});

router.get('/admin/categories/edit/:id', checkAdmin, (req, res) => {
    const categoryID = req.params.id;
    connection.getCategoryById(categoryID, (err, category) => {
        if (err || !category) return res.status(404).send('Категория не найдена');
        res.render('layout', { body: 'edit_category', category });
    });
});

router.post('/admin/categories/edit/:id', checkAdmin, (req, res) => {
    const categoryID = req.params.id;
    const uploadDir = path.join(__dirname, '../public/images/categories');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    connection.getCategoryById(categoryID, (err, oldCategory) => {
        if (err || !oldCategory) return res.status(404).json({ success: false, message: 'Категория не найдена' });
        const form = new IncomingForm({ uploadDir, keepExtensions: true, allowEmptyFiles: true, minFileSize: 0, maxFileSize: 5 * 1024 * 1024, multiples: false });
        form.parse(req, (err, fields, files) => {
            if (err) return res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
            const name = Array.isArray(fields.categorieName) ? fields.categorieName[0] : fields.categorieName;
            const description = Array.isArray(fields.categorieDescription) ? fields.categorieDescription[0] : fields.categorieDescription;
            if (!name) return res.status(400).json({ success: false, message: 'Название категории обязательно' });
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
                        return res.status(400).json({ success: false, message: 'Недопустимый формат изображения' });
                    }
                    const newFileName = `cat_${Date.now()}_${file.originalFilename || 'category.jpg'}`;
                    const newPath = path.join(uploadDir, newFileName);
                    fs.renameSync(file.filepath, newPath);
                    thumbnail = newFileName;
                    if (oldCategory.categorieThumbnail) {
                        const oldPath = path.join(uploadDir, oldCategory.categorieThumbnail);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    }
                }
            }
            connection.updateCategory(categoryID, name, description, thumbnail, (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Ошибка обновления категории' });
                res.json({ success: true, message: 'Категория обновлена' });
            });
        });
    });
});

router.delete('/admin/categories/delete/:id', checkAdmin, (req, res) => {
    connection.deleteCategory(req.params.id, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Ошибка удаления' });
        res.json({ success: true, message: 'Категория удалена' });
    });
});

// ========== ЗАКАЗЫ ==========
router.get('/checkout', isAuthenticated, (req, res) => {
    connection.getCartWithProducts(req.session.userId, (err, products) => {
        if (err || !products.length) return res.redirect('/cart/' + req.session.userId);
        connection.getDeliveryPoints((err, deliveryPoints) => {
            const totalPrice = products.reduce((sum, p) => sum + (p.isDiscounted ? parseFloat(p.discountedPrice) : parseFloat(p.productPrice)) * p.sc_count, 0);
            res.render('layout', { body: 'checkout', products, deliveryPoints: deliveryPoints || [], totalPrice });
        });
    });
});

router.post('/checkout/process', isAuthenticated, (req, res) => {
    const { deliveryType, deliveryPointID, deliveryAddress, paymentType, customerName, customerPhone, customerEmail, comment } = req.body;
    if (!deliveryType || !paymentType || !customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({ success: false, message: 'Заполните все обязательные поля' });
    }
    if (deliveryType === 'pickup' && !deliveryPointID) return res.status(400).json({ success: false, message: 'Выберите пункт выдачи' });
    if (deliveryType === 'delivery' && (!deliveryAddress || deliveryAddress.trim() === '')) return res.status(400).json({ success: false, message: 'Укажите адрес доставки' });
    connection.getCartWithProducts(req.session.userId, (err, products) => {
        if (err || products.length === 0) return res.status(400).json({ success: false, message: 'Корзина пуста' });
        for (const product of products) {
            if (product.stock_quantity <= 0) return res.status(400).json({ success: false, message: `Товар "${product.productTitle}" отсутствует` });
            if (product.sc_count > product.stock_quantity) return res.status(400).json({ success: false, message: `Недостаточно "${product.productTitle}"` });
        }
        let totalAmount = 0;
        const orderItems = products.map(product => {
            const itemPrice = product.isDiscounted ? parseFloat(product.discountedPrice) : parseFloat(product.productPrice);
            totalAmount += itemPrice * product.sc_count;
            return { productID: product.productID, quantity: product.sc_count, price: parseFloat(product.productPrice), discountedPrice: product.isDiscounted ? parseFloat(product.discountedPrice) : null };
        });
        const deliveryCost = 0;
        let finalPaymentType = paymentType;
        if (deliveryType === 'delivery' && paymentType !== 'online') finalPaymentType = 'online';
        const orderData = {
            customerID: req.session.userId, totalAmount: totalAmount + deliveryCost, deliveryType,
            deliveryAddress: deliveryAddress || null, deliveryPointID: deliveryPointID || null, deliveryCost,
            paymentType: finalPaymentType, paymentStatus: 'pending', orderStatusID: 1,
            customerName: customerName.trim(), customerPhone: customerPhone.trim(), customerEmail: customerEmail.trim(),
            comment: comment ? comment.trim() : null
        };
        connection.createOrder(orderData, orderItems, (err, orderID) => {
            if (err) return res.status(500).json({ success: false, message: 'Ошибка создания заказа' });
            connection.connection.query('DELETE FROM shopping_cart WHERE customerID = ?', [req.session.userId], () => {});
            req.session.cart = {};
            req.session.cartCount = 0;
            if (finalPaymentType === 'online') {
                connection.generateSBPQRCode(orderID, orderData.totalAmount, (qrErr, qrData) => {
                    res.json({ success: true, orderID, paymentType: 'online', qrData, redirectUrl: `/checkout/success/${orderID}` });
                });
            } else {
                connection.generatePaymentData(orderID, orderData.totalAmount, (payErr, payData) => {
                    res.json({ success: true, orderID, paymentType: finalPaymentType, paymentData: payData, redirectUrl: `/checkout/success/${orderID}` });
                });
            }
        });
    });
});

router.get('/checkout/success/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;
    Promise.all([
        new Promise(resolve => connection.getOrderById(orderID, (err, order) => resolve(err ? null : order))),
        new Promise(resolve => connection.getOrderItems(orderID, (err, items) => resolve(err ? [] : items)))
    ]).then(([order, items]) => {
        if (!order || order.customerID !== req.session.userId) return res.status(403).send('Доступ запрещён');
        res.render('layout', { body: 'checkout_success', order, items });
    }).catch(() => res.status(500).send('Ошибка'));
});

router.get('/my-orders', isAuthenticated, (req, res) => {
    connection.getOrdersByCustomer(req.session.userId, (err, orders) => {
        res.render('layout', { body: 'my_orders', orders: err ? [] : orders });
    });
});

router.get('/order/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;
    Promise.all([
        new Promise(resolve => connection.getOrderById(orderID, (err, order) => resolve(err ? null : order))),
        new Promise(resolve => connection.getOrderItems(orderID, (err, items) => resolve(err ? [] : items)))
    ]).then(([order, items]) => {
        if (!order || order.customerID !== req.session.userId) return res.status(403).send('Доступ запрещён');
        res.render('layout', { body: 'order_detail', order, items });
    }).catch(() => res.status(500).send('Ошибка'));
});

router.get('/payment/sbp/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;
    connection.getOrderById(orderID, (err, order) => {
        if (err || !order || order.customerID !== req.session.userId || order.paymentType !== 'online') return res.status(404).send('Недоступно');
        connection.updatePaymentStatus(orderID, 'paid', () => {});
        res.render('layout', { body: 'payment_sbp', order });
    });
});

router.get('/payment/confirm/:orderID', isAuthenticated, (req, res) => {
    const orderID = req.params.orderID;
    connection.getOrderById(orderID, (err, order) => {
        if (err || !order || order.customerID !== req.session.userId) return res.status(404).send('Недоступно');
        res.render('layout', { body: 'payment_confirm', order });
    });
});

module.exports = router;
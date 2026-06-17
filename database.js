const mysql = require('mysql2');

// Подключение к БД
const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

// Подключение к БД
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sport'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Конекшн комплитед.');
});

// ========== Вспомогательная функция для основного изображения ==========
const primaryImageSubquery = `COALESCE((SELECT pi.imageUrl FROM product_images pi WHERE pi.productID = p.productID AND pi.is_primary = 1 LIMIT 1), p.productThumbnail) as productThumbnail`;

// ========== Функции для изображений ==========
function getProductImages(productID, callback) {
    const query = 'SELECT imageUrl, is_primary, sort_order FROM product_images WHERE productID = ? ORDER BY sort_order ASC, imageID ASC';
    connection.query(query, [productID], callback);
}

function saveProductImages(productID, images, callback) {
    if (!images || images.length === 0) return callback(null);
    const values = images.map(img => [productID, img.imageUrl, img.is_primary ? 1 : 0, img.sort_order || 0]);
    const query = 'INSERT INTO product_images (productID, imageUrl, is_primary, sort_order) VALUES ?';
    connection.query(query, [values], callback);
}

function deleteProductImages(productID, callback) {
    const query = 'DELETE FROM product_images WHERE productID = ?';
    connection.query(query, [productID], callback);
}

// ========== Главная страница ==========
function getAllCategories(callback) {
    connection.query('SELECT * FROM categories ORDER BY categorieName', callback);
}

function getPopularProducts(limit, callback) {
    const query = `
        SELECT p.*,
               GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list,
               ${primaryImageSubquery}
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        GROUP BY p.productID
        ORDER BY p.productRating DESC
        LIMIT ?
    `;
    connection.query(query, [limit], (err, results) => {
        if (err) return callback(err);
        const products = results.map(row => {
            const priceInfo = calculateDiscountedPrice(row);
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
        callback(null, products);
    });
}

// ========== Каталог ==========
function getPriceBounds(callback) {
    const query = `SELECT COALESCE(MIN(productPrice), 0) AS min_price, COALESCE(MAX(productPrice), 100000) AS max_price FROM products WHERE productPrice IS NOT NULL AND productPrice > 0`;
    connection.query(query, callback);
}

function getProductCount(filters, callback) {
    let query = `SELECT COUNT(DISTINCT p.productID) as total FROM products p LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID WHERE 1=1`;
    const params = [];
    if (filters.searchQuery) {
        query += ` AND (p.productTitle LIKE ? OR p.productManufacturer LIKE ? OR p.productDescription LIKE ? OR EXISTS (SELECT 1 FROM categoriesandproducts cp2 JOIN categories c2 ON cp2.categorieID = c2.categorieID WHERE cp2.productID = p.productID AND c2.categorieName LIKE ?))`;
        const s = `%${filters.searchQuery}%`;
        params.push(s, s, s, s);
    }
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        query += ` AND EXISTS (SELECT 1 FROM categoriesandproducts cp2 WHERE cp2.productID = p.productID AND cp2.categorieID IN (${filters.categoryIds.map(() => '?').join(',')}))`;
        params.push(...filters.categoryIds);
    }
    if (filters.minPrice) {
        query += ` AND p.productPrice >= ?`;
        params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
        query += ` AND p.productPrice <= ?`;
        params.push(filters.maxPrice);
    }
    if (filters.onSale) {
        query += ` AND p.is_on_sale = 1 AND COALESCE(p.discount_percentage, 0) > 0 AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())`;
    }
    if (filters.inStock) {
        query += ` AND p.stock_quantity > 0`;
    }
    connection.query(query, params, callback);
}

function getProductsFiltered(filters, callback) {
    let query = `SELECT p.*, GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list, GROUP_CONCAT(DISTINCT c.categorieID ORDER BY c.categorieID SEPARATOR ',') as categories_ids, ${primaryImageSubquery} FROM products p LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID LEFT JOIN categories c ON cp.categorieID = c.categorieID WHERE 1=1`;
    const params = [];
    if (filters.searchQuery) {
        query += ` AND (p.productTitle LIKE ? OR p.productManufacturer LIKE ? OR p.productDescription LIKE ? OR EXISTS (SELECT 1 FROM categoriesandproducts cp2 JOIN categories c2 ON cp2.categorieID = c2.categorieID WHERE cp2.productID = p.productID AND c2.categorieName LIKE ?))`;
        const s = `%${filters.searchQuery}%`;
        params.push(s, s, s, s);
    }
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        query += ` AND EXISTS (SELECT 1 FROM categoriesandproducts cp2 WHERE cp2.productID = p.productID AND cp2.categorieID IN (${filters.categoryIds.map(() => '?').join(',')}))`;
        params.push(...filters.categoryIds);
    }
    if (filters.minPrice) {
        query += ` AND p.productPrice >= ?`;
        params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
        query += ` AND p.productPrice <= ?`;
        params.push(filters.maxPrice);
    }
    if (filters.onSale) {
        query += ` AND p.is_on_sale = 1 AND COALESCE(p.discount_percentage, 0) > 0 AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())`;
    }
    if (filters.inStock) {
        query += ` AND p.stock_quantity > 0`;
    }
    let orderBy = 'p.created_at DESC';
    switch(filters.sort) {
        case 'newest': orderBy = 'p.created_at DESC, p.productID DESC'; break;
        case 'price_asc': orderBy = 'CASE WHEN p.is_on_sale = 1 AND p.discount_percentage > 0 THEN p.productPrice * (1 - p.discount_percentage/100) ELSE p.productPrice END ASC'; break;
        case 'price_desc': orderBy = 'CASE WHEN p.is_on_sale = 1 AND p.discount_percentage > 0 THEN p.productPrice * (1 - p.discount_percentage/100) ELSE p.productPrice END DESC'; break;
        case 'rating': orderBy = 'p.productRating DESC, p.created_at DESC'; break;
        case 'name_asc': orderBy = 'p.productTitle ASC'; break;
        case 'name_desc': orderBy = 'p.productTitle DESC'; break;
        case 'discount': orderBy = `CASE WHEN p.is_on_sale = 1 AND p.discount_percentage > 0 AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW()) THEN COALESCE(p.discount_percentage, 0) ELSE 0 END DESC, p.created_at DESC`; break;
        case 'stock_asc': orderBy = 'p.stock_quantity ASC, p.created_at DESC'; break;
        case 'stock_desc': orderBy = 'p.stock_quantity DESC, p.created_at DESC'; break;
    }
    query += ` GROUP BY p.productID ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset);
    connection.query(query, params, (err, results) => {
        if (err) return callback(err);
        const products = results.map(row => {
            const priceInfo = calculateDiscountedPrice(row);
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
                stock_quantity: row.stock_quantity || 0,
                is_available: (row.stock_quantity || 0) > 0,
                categories: row.categories_list ? row.categories_list.split(', ') : [],
                categories_ids: row.categories_ids ? row.categories_ids.split(',') : [],
                category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
                priceInfo: priceInfo,
                displayPrice: priceInfo.isDiscounted ? (isNaN(discountedPrice) ? originalPrice.toFixed(2) : discountedPrice.toFixed(2)) : originalPrice.toFixed(2),
                originalPrice: originalPrice.toFixed(2),
                discountPercentage: priceInfo.discountPercentage || 0,
                isDiscounted: priceInfo.isDiscounted,
                is_on_sale: row.is_on_sale,
                discount_percentage: row.discount_percentage || 0,
                discount_start_date: row.discount_start_date,
                discount_end_date: row.discount_end_date
            };
        });
        callback(null, products);
    });
}

// ========== Поиск ==========
function getPopularSearchSuggestions(limit, callback) {
    const query = `SELECT p.productID, p.productTitle, p.productThumbnail, p.productPrice, p.is_on_sale, p.discount_percentage, p.discount_start_date, p.discount_end_date FROM products p WHERE p.productPrice IS NOT NULL ORDER BY p.productRating DESC, p.created_at DESC LIMIT ?`;
    connection.query(query, [limit], callback);
}

function searchProducts(query, limit, callback) {
    if (query.length < 2) return callback(null, []);
    const searchPattern = `%${query}%`;
    const sql = `SELECT 
    p.productID, p.productTitle, p.productThumbnail, p.productPrice,
    p.is_on_sale, p.discount_percentage, p.discount_start_date, p.discount_end_date,
    p.productRating FROM products p WHERE (p.productTitle LIKE ? OR p.productDescription LIKE ?) AND p.productPrice IS NOT NULL ORDER BY CASE WHEN p.productTitle LIKE ? THEN 1 ELSE 2 END, p.productRating DESC LIMIT ?`;
    connection.query(sql, [searchPattern, searchPattern, `${query}%`, limit], callback);
}

// ========== Админка ==========
function getAdminProducts(filters, callback) {
    let query = `SELECT * FROM products WHERE 1=1`;
    const params = [];
    if (filters.searchQuery) {
        const s = `%${filters.searchQuery}%`;
        query += ` AND (productTitle LIKE ? OR productManufacturer LIKE ? OR productDescription LIKE ?)`;
        params.push(s, s, s);
    }
    query += ` ORDER BY productID LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset);
    connection.query(query, params, callback);
}

function getProductCategoriesForAdmin(productID, callback) {
    const query = `SELECT c.categorieName FROM categories c JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID WHERE cp.productID = ?`;
    connection.query(query, [productID], (err, results) => {
        if (err) return callback(err);
        callback(null, results.map(cat => cat.categorieName));
    });
}

function getProductFeaturesCount(productID, callback) {
    connection.query('SELECT COUNT(*) as count FROM product_features WHERE productID = ?', [productID], callback);
}

// ========== Пользователи ==========
function createUser(username, hashedPassword, email, callback) {
    connection.query('INSERT INTO customers (customerName, customerPassword, customerEmail) VALUES (?, ?, ?)', [username, hashedPassword, email], callback);
}

function findUserByUsername(email, callback) {
    connection.query('SELECT * FROM customers WHERE customerEmail = ?', [email], callback);
}

function AccPageRender(session_id, callback) {
    connection.query('SELECT * FROM customers WHERE customerID = ?', [session_id], callback);
}

function UpdateAvatar(avatar, session_id, callback) {
    connection.query('UPDATE customers SET customerThumbnail = ? WHERE customerID = ?', [avatar, session_id], callback);
}

function UpdateName(name_value, session_id, callback) {
    connection.query('UPDATE customers SET customerName = ? WHERE customerID = ?', [name_value, session_id], callback);
}

function GetProducts(callback) {
    const query = `SELECT p.*, GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list, GROUP_CONCAT(DISTINCT c.categorieID ORDER BY c.categorieID SEPARATOR ',') as categories_ids, ${primaryImageSubquery} FROM products p LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID LEFT JOIN categories c ON cp.categorieID = c.categorieID GROUP BY p.productID ORDER BY p.created_at DESC, p.productID DESC`;
    connection.query(query, (err, results) => {
        if (err) return callback(err);
        const products = results.map(row => ({
            ...row,
            categories: row.categories_list ? row.categories_list.split(', ') : [],
            categories_ids: row.categories_ids ? row.categories_ids.split(',').map(id => parseInt(id)) : [],
            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
        }));
        callback(null, products);
    });
}

// ========== Корзина ==========
function addToCart(customerID, productID, callback) {
    connection.query('INSERT INTO shopping_cart (customerID, productID, sc_count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE sc_count = sc_count + 1', [customerID, productID], callback);
}

function updateCartItem(customerID, productID, action, callback) {
    const query = action === 'increase' ?
        'UPDATE shopping_cart SET sc_count = sc_count + 1 WHERE customerID = ? AND productID = ?' :
        'UPDATE shopping_cart SET sc_count = sc_count - 1 WHERE customerID = ? AND productID = ? AND sc_count > 0';
    connection.query(query, [customerID, productID], (error, results) => {
        if (error) return callback(error);
        if (action === 'decrease' && results.affectedRows > 0 && results.changedRows > 0) {
            connection.query('DELETE FROM shopping_cart WHERE customerID = ? AND productID = ? AND sc_count = 0', [customerID, productID], () => {});
        }
        callback(null, results);
    });
}

function getCartByCustomerID(customerID, callback) {
    connection.query('SELECT productID, sc_count FROM shopping_cart WHERE customerID = ?', [customerID], callback);
}

function getCartWithProducts(customerID, callback) {
    const query = `
        SELECT sc.*, p.*, ${primaryImageSubquery}
        FROM shopping_cart sc
        JOIN products p ON sc.productID = p.productID
        WHERE sc.customerID = ?
    `;
    connection.query(query, [customerID], (error, results) => {
        if (error) return callback(error);
        const products = results.map(row => {
            const priceInfo = calculateDiscountedPrice(row);
            return {
                ...row,
                productPrice: parseFloat(row.productPrice),
                priceInfo: priceInfo,
                discountedPrice: priceInfo.discountedPrice.toFixed(2),
                originalPrice: priceInfo.originalPrice.toFixed(2),
                discountPercentage: priceInfo.discountPercentage,
                isDiscounted: priceInfo.isDiscounted
            };
        });
        callback(null, products);
    });
}

function removeFromCart(customerID, productID, callback) {
    connection.query('DELETE FROM shopping_cart WHERE customerID = ? AND productID = ?', [customerID, productID], callback);
}

function getProductByID(productID, callback) {
    connection.query('SELECT * FROM products WHERE productID = ?', [productID], (error, results) => {
        if (error) return callback(error, null);
        if (results.length === 0) return callback(null, null);
        const product = results[0];
        if (product.productPrice) product.productPrice = parseFloat(product.productPrice);
        getProductImages(productID, (err, images) => {
            if (err) product.images = [{ imageUrl: product.productThumbnail, is_primary: 1 }];
            else product.images = images.length > 0 ? images : [{ imageUrl: product.productThumbnail, is_primary: 1 }];
            const primary = product.images.find(img => img.is_primary) || product.images[0];
            product.productThumbnail = primary ? primary.imageUrl : product.productThumbnail;
            callback(null, product);
        });
    });
}

function getProductsByIDs(productIDs, callback) {
    const products = [];
    let remaining = productIDs.length;
    if (remaining === 0) return callback(null, []);
    productIDs.forEach(productID => {
        getProductByID(productID, (err, product) => {
            if (err) return callback(err);
            if (product) products.push(product);
            remaining--;
            if (remaining === 0) callback(null, products);
        });
    });
}

// ========== Избранное ==========
function addToFavorites(productID, customerID, callback) {
    connection.query('INSERT INTO favorites (productID, customerID) VALUES (?, ?)', [productID, customerID], callback);
}

function removeFromFavorites(productID, customerID, callback) {
    connection.query('DELETE FROM favorites WHERE productID = ? AND customerID = ?', [productID, customerID], callback);
}

function getFavoritesByCustomerID(customerID, callback) {
    const query = `SELECT p.productID, p.productThumbnail, p.productTitle, p.productPrice, p.productDescription, p.productRating, p.productManufacturer, p.created_at, ${primaryImageSubquery} FROM favorites f JOIN products p ON f.productID = p.productID WHERE f.customerID = ? ORDER BY p.created_at DESC`;
    connection.query(query, [customerID], (err, results) => {
        if (err) return callback(err);
        const favs = results.map(row => ({ productID: row.productID, productThumbnail: row.productThumbnail, productTitle: row.productTitle, productPrice: row.productPrice, productDescription: row.productDescription, productRating: row.productRating, productManufacturer: row.productManufacturer, created_at: row.created_at }));
        callback(null, favs);
    });
}

function getFavoritesWithProducts(customerID, callback) {
    const query = `SELECT p.*, f.favoritesID, ${primaryImageSubquery} FROM favorites f JOIN products p ON f.productID = p.productID WHERE f.customerID = ? ORDER BY f.favoritesID DESC`;
    connection.query(query, [customerID], (error, results) => {
        if (error) return callback(error);
        const products = results.map(row => {
            const priceInfo = calculateDiscountedPrice(row);
            return {
                ...row,
                productPrice: parseFloat(row.productPrice),
                priceInfo: priceInfo,
                discountedPrice: priceInfo.discountedPrice.toFixed(2),
                originalPrice: priceInfo.originalPrice.toFixed(2),
                discountPercentage: priceInfo.discountPercentage,
                isDiscounted: priceInfo.isDiscounted
            };
        });
        callback(null, products);
    });
}

// ========== Отзывы ==========
function addReview(productID, customerID, rating, comment, callback) {
    connection.query('INSERT INTO reviews (productID, customerID, rating, comment) VALUES (?, ?, ?, ?)', [productID, customerID, rating, comment], (err, results) => {
        if (err) return callback(err);
        updateProductRating(productID, (updateErr) => callback(updateErr || err, results));
    });
}

function getProductReviews(productID, callback) {
    connection.query(`SELECT r.*, c.customerName, c.customerThumbnail FROM reviews r JOIN customers c ON r.customerID = c.customerID WHERE r.productID = ? ORDER BY r.created_at DESC`, [productID], callback);
}

function hasUserReviewed(productID, customerID, callback) {
    connection.query('SELECT * FROM reviews WHERE productID = ? AND customerID = ?', [productID, customerID], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0);
    });
}

function getReviewStats(productID, callback) {
    connection.query(`SELECT rating, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage FROM reviews WHERE productID = ? GROUP BY rating ORDER BY rating DESC`, [productID], callback);
}

function updateProductRating(productID, callback) {
    connection.query(`UPDATE products SET productRating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE productID = ?) WHERE productID = ?`, [productID, productID], callback);
}

function updateReview(reviewID, rating, comment, callback) {
    connection.query('UPDATE reviews SET rating = ?, comment = ? WHERE reviewID = ?', [rating, comment, reviewID], callback);
}

function deleteReview(reviewID, callback) {
    connection.query('DELETE FROM reviews WHERE reviewID = ?', [reviewID], callback);
}

// ========== Категории и характеристики ==========
function getCategoriesForProducts(productIDs, callback) {
    if (!productIDs || productIDs.length === 0) return callback(null, {});
    const placeholders = productIDs.map(() => '?').join(',');
    const query = `SELECT cp.productID, c.categorieName FROM categoriesandproducts cp JOIN categories c ON cp.categorieID = c.categorieID WHERE cp.productID IN (${placeholders})`;
    connection.query(query, productIDs, (err, results) => {
        if (err) return callback(err);
        const map = {};
        results.forEach(row => {
            if (!map[row.productID]) map[row.productID] = [];
            map[row.productID].push(row.categorieName);
        });
        callback(null, map);
    });
}

function getProductsWithCategories(callback) {
    const query = `SELECT p.productID, p.productTitle, p.productThumbnail, p.productPrice, p.productDescription, p.productManufacturer, p.productRating, p.created_at, GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list FROM products p LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID LEFT JOIN categories c ON cp.categorieID = c.categorieID GROUP BY p.productID ORDER BY p.created_at DESC, p.productID DESC`;
    connection.query(query, (err, results) => {
        if (err) return callback(err);
        const products = results.map(row => ({
            productID: row.productID,
            productTitle: row.productTitle,
            productThumbnail: row.productThumbnail,
            productPrice: row.productPrice,
            productDescription: row.productDescription,
            productManufacturer: row.productManufacturer,
            productRating: row.productRating || 0,
            created_at: row.created_at,
            categories: row.categories_list ? row.categories_list.split(', ') : [],
            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized'
        }));
        callback(null, products);
    });
}

function getProductsByCategory(categoryID, callback) {
    connection.query(`SELECT p.* FROM products p JOIN categoriesandproducts cp ON p.productID = cp.productID WHERE cp.categorieID = ? GROUP BY p.productID ORDER BY p.productID`, [categoryID], callback);
}

function getUserRank(customerID, callback) {
    connection.query('SELECT customerRank FROM customers WHERE customerID = ?', [customerID], callback);
}

// ========== Категории (расширенные) ==========

// Получить все категории с полными данными (для главной страницы, админки)
function getAllCategoriesFull(callback) {
    const query = `
        SELECT c.*, COUNT(cp.productID) AS productCount
        FROM categories c
        LEFT JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
        GROUP BY c.categorieID
        ORDER BY c.categorieName
    `;
    connection.query(query, callback);
}

// Получить одну категорию по ID
function getCategoryById(categoryID, callback) {
    const query = 'SELECT * FROM categories WHERE categorieID = ?';
    connection.query(query, [categoryID], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0] || null);
    });
}

// Добавить новую категорию
function addCategory(name, description, thumbnail, callback) {
    const query = 'INSERT INTO categories (categorieName, categorieDescription, categorieThumbnail) VALUES (?, ?, ?)';
    connection.query(query, [name, description, thumbnail || null], (err, results) => {
        if (err) return callback(err);
        callback(null, results.insertId);
    });
}

// Обновить категорию
function updateCategory(categoryID, name, description, thumbnail, callback) {
    let query = 'UPDATE categories SET categorieName = ?, categorieDescription = ?';
    const params = [name, description];
    if (thumbnail !== undefined) {
        query += ', categorieThumbnail = ?';
        params.push(thumbnail);
    }
    query += ' WHERE categorieID = ?';
    params.push(categoryID);
    connection.query(query, params, callback);
}

function deleteCategory(categoryID, callback) {
    connection.beginTransaction(err => {
        if (err) return callback(err);
        // Удалить связи товар-категория
        connection.query('DELETE FROM categoriesandproducts WHERE categorieID = ?', [categoryID], (err) => {
            if (err) return connection.rollback(() => callback(err));
            // Удалить саму категорию
            connection.query('DELETE FROM categories WHERE categorieID = ?', [categoryID], (err) => {
                if (err) return connection.rollback(() => callback(err));
                connection.commit(err => callback(err));
            });
        });
    });
}

// Получить категории с миниатюрами для списка товаров
function getCategoryIconsForProducts(productIDs, callback) {
    if (!productIDs || productIDs.length === 0) return callback(null, {});
    const query = `
        SELECT cp.productID, c.categorieName, c.categorieThumbnail
        FROM categoriesandproducts cp
        JOIN categories c ON cp.categorieID = c.categorieID
        WHERE cp.productID IN (?)
        ORDER BY c.categorieName
    `;
    connection.query(query, [productIDs], (err, results) => {
        if (err) return callback(err);
        const map = {};
        results.forEach(row => {
            if (!map[row.productID]) map[row.productID] = [];
            map[row.productID].push({
                name: row.categorieName,
                icon: row.categorieThumbnail 
                    ? `/images/categories/${row.categorieThumbnail}` 
                    : null
            });
        });
        callback(null, map);
    });
}

// ========== Добавление/редактирование товара ==========
function addProductWithFeatures(productData, categories, features, callback) {
    connection.beginTransaction(err => {
        if (err) return callback(err);
        const discountPercentage = productData.discount_percentage ? parseFloat(productData.discount_percentage) : 0;
        const isOnSale = (productData.is_on_sale && discountPercentage > 0) ? 1 : 0;
        const stockQuantity = productData.stock_quantity ? parseInt(productData.stock_quantity) : 0;
        const productQuery = `INSERT INTO products (productTitle, productManufacturer, productDescription, productPrice, productThumbnail, discount_percentage, discount_start_date, discount_end_date, is_on_sale, stock_quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        connection.query(productQuery, [
            productData.productTitle,
            productData.productManufacturer,
            productData.productDescription,
            productData.productPrice,
            productData.productThumbnail || '',
            discountPercentage,
            productData.discount_start_date || null,
            productData.discount_end_date || null,
            isOnSale,
            stockQuantity
        ], (err, result) => {
            if (err) return connection.rollback(() => callback(err));
            const productID = result.insertId;
            const categoryPromises = categories && categories.length > 0 ? categories.map(catName => {
                return new Promise((resolve, reject) => {
                    connection.query('SELECT categorieID FROM categories WHERE categorieName = ?', [catName], (err, results) => {
                        if (err) return reject(err);
                        if (results.length > 0) {
                            connection.query('INSERT INTO categoriesandproducts (categorieID, productID) VALUES (?, ?)', [results[0].categorieID, productID], (err) => err ? reject(err) : resolve());
                        } else resolve();
                    });
                });
            }) : [];
            const featurePromises = features && features.length > 0 ? features.map(f => {
                return new Promise((resolve, reject) => {
                    connection.query('INSERT INTO product_features (productID, feature_key, feature_value) VALUES (?, ?, ?)', [productID, f.key, f.value], err => err ? reject(err) : resolve());
                });
            }) : [];
            Promise.all([...categoryPromises, ...featurePromises])
                .then(() => connection.commit(err => err ? connection.rollback(() => callback(err)) : callback(null, productID)))
                .catch(err => connection.rollback(() => callback(err)));
        });
    });
}

function getProductFeatures(productID, callback) {
    connection.query('SELECT * FROM product_features WHERE productID = ? ORDER BY featureID', [productID], (error, results) => {
        if (error) return callback(error, []);
        callback(null, results.map(row => ({ key: row.feature_key, value: row.feature_value, featureID: row.featureID })));
    });
}

function updateProductFeatures(productID, features, callback) {
    connection.query('DELETE FROM product_features WHERE productID = ?', [productID], err => {
        if (err) return callback(err);
        if (!features || features.length === 0) return callback(null);
        const promises = features.map(f => new Promise((resolve, reject) => {
            connection.query('INSERT INTO product_features (productID, feature_key, feature_value) VALUES (?, ?, ?)', [productID, f.key, f.value], err => err ? reject(err) : resolve());
        }));
        Promise.all(promises).then(() => callback(null)).catch(callback);
    });
}

function updateProduct(productID, productData, categories, features, callback) {
    connection.beginTransaction(err => {
        if (err) return callback(err);
        const { productRating, ...updateData } = productData;
        const discountPercentage = updateData.discount_percentage || 0;
        const discountStartDate = updateData.discount_start_date || null;
        const discountEndDate = updateData.discount_end_date || null;
        const isOnSale = updateData.is_on_sale || 0;
        const stockQuantity = updateData.stock_quantity !== undefined ? parseInt(updateData.stock_quantity) : null;
        let discountPrice = null;
        if (isOnSale == 1 && discountPercentage > 0) discountPrice = parseFloat(updateData.productPrice) * (1 - discountPercentage / 100);
        const updateProductQuery = `UPDATE products SET productTitle = ?, productManufacturer = ?, productDescription = ?, productPrice = ?, productThumbnail = COALESCE(?, productThumbnail), discount_percentage = ?, discount_start_date = ?, discount_end_date = ?, is_on_sale = ?, discount_price = ?, ${stockQuantity !== null ? 'stock_quantity = ?,' : ''} created_at = created_at WHERE productID = ?`;
        const params = [
            updateData.productTitle,
            updateData.productManufacturer,
            updateData.productDescription,
            updateData.productPrice,
            updateData.productThumbnail,
            discountPercentage,
            discountStartDate,
            discountEndDate,
            isOnSale,
            discountPrice,
            ...(stockQuantity !== null ? [stockQuantity] : []),
            productID
        ];
        connection.query(updateProductQuery, params, (err) => {
            if (err) return connection.rollback(() => callback(err));
            connection.query('DELETE FROM categoriesandproducts WHERE productID = ?', [productID], err => {
                if (err) return connection.rollback(() => callback(err));
                const categoryPromises = categories && categories.length > 0 ? categories.map(catName => {
                    return new Promise((resolve, reject) => {
                        connection.query('SELECT categorieID FROM categories WHERE categorieName = ?', [catName], (err, results) => {
                            if (err) return reject(err);
                            if (results.length > 0) {
                                connection.query('INSERT INTO categoriesandproducts (categorieID, productID) VALUES (?, ?)', [results[0].categorieID, productID], err => err ? reject(err) : resolve());
                            } else {
                                connection.query('INSERT INTO categories (categorieName) VALUES (?)', [catName], (err, result) => {
                                    if (err) return reject(err);
                                    connection.query('INSERT INTO categoriesandproducts (categorieID, productID) VALUES (?, ?)', [result.insertId, productID], err => err ? reject(err) : resolve());
                                });
                            }
                        });
                    });
                }) : [];
                Promise.all(categoryPromises)
                    .then(() => updateProductFeatures(productID, features, err => {
                        if (err) return connection.rollback(() => callback(err));
                        connection.commit(err => err ? connection.rollback(() => callback(err)) : callback(null, productID));
                    }))
                    .catch(err => connection.rollback(() => callback(err)));
            });
        });
    });
}

function deleteProduct(productID, callback) {
    const tables = ['product_features', 'categoriesandproducts', 'reviews', 'favorites', 'shopping_cart', 'products'];
    const deleteQueries = tables.map(table => {
        return new Promise((resolve, reject) => {
            connection.query(`DELETE FROM ${table} WHERE productID = ?`, [productID], err => err ? reject(err) : resolve());
        });
    });
    Promise.all(deleteQueries).then(() => callback(null)).catch(callback);
}

function calculateDiscountedPrice(product) {
    const originalPrice = parseFloat(product.productPrice) || 0;
    const discountPercentage = parseFloat(product.discount_percentage) || 0;
    if (!product.is_on_sale || discountPercentage <= 0) {
        return { originalPrice, discountedPrice: originalPrice, discountPercentage: 0, isDiscounted: false, isOnSale: false };
    }
    const now = new Date();
    let active = product.is_on_sale == 1;
    if (product.discount_start_date && now < new Date(product.discount_start_date)) active = false;
    if (product.discount_end_date && now > new Date(product.discount_end_date)) active = false;
    if (!active) return { originalPrice, discountedPrice: originalPrice, discountPercentage: 0, isDiscounted: false, isOnSale: product.is_on_sale == 1 };
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    return { originalPrice, discountedPrice: isNaN(discountedPrice) ? originalPrice : discountedPrice, discountPercentage, isDiscounted: true, isOnSale: true, savings: originalPrice - discountedPrice, endDate: product.discount_end_date };
}

function getDiscountedProducts(limit, callback) {
    const query = `SELECT p.*, GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list, ${primaryImageSubquery} FROM products p LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID LEFT JOIN categories c ON cp.categorieID = c.categorieID WHERE p.is_on_sale = 1 AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW()) AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) GROUP BY p.productID ORDER BY p.discount_percentage DESC, p.created_at DESC LIMIT ?`;
    connection.query(query, [limit], (err, results) => {
        if (err) return callback(err);
        const products = results.map(row => {
            const priceInfo = calculateDiscountedPrice(row);
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
        callback(null, products);
    });
}

// ========== Заказы ==========
function getDeliveryPoints(callback) {
    connection.query('SELECT * FROM delivery_points WHERE is_active = 1 ORDER BY pointName', callback);
}

function getDeliveryPointById(pointID, callback) {
    connection.query('SELECT * FROM delivery_points WHERE pointID = ? AND is_active = 1', [pointID], callback);
}

function createOrder(orderData, items, callback) {
    connection.beginTransaction(err => {
        if (err) return callback(err);

        // Последовательно проверяем наличие товаров (без Promise.all, через async.waterfall)
        let index = 0;
        function checkNext() {
            if (index >= items.length) {
                // Все проверки пройдены – создаём заказ
                const orderQuery = `
                    INSERT INTO orders (
                        customerID, totalAmount, deliveryType, deliveryAddress,
                        deliveryPointID, deliveryCost, paymentType, paymentStatus,
                        orderStatusID, customerName, customerPhone, customerEmail,
                        comment, qrCodeData, paymentLink
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                connection.query(
                    orderQuery,
                    [
                        orderData.customerID,
                        orderData.totalAmount,
                        orderData.deliveryType,
                        orderData.deliveryAddress || null,
                        orderData.deliveryPointID || null,
                        orderData.deliveryCost || 0,
                        orderData.paymentType,
                        orderData.paymentStatus || 'pending',
                        orderData.orderStatusID || 1,
                        orderData.customerName,
                        orderData.customerPhone,
                        orderData.customerEmail,
                        orderData.comment || null,
                        orderData.qrCodeData || null,
                        orderData.paymentLink || null
                    ],
                    (err, result) => {
                        if (err) return connection.rollback(() => callback(err));
                        const orderID = result.insertId;

                        // Вставляем товары заказа
                        let itemIndex = 0;
                        function insertNextItem() {
                            if (itemIndex >= items.length) {
                                // Обновляем остатки товаров
                                let stockIndex = 0;
                                function updateNextStock() {
                                    if (stockIndex >= items.length) {
                                        connection.commit(err => {
                                            if (err) return connection.rollback(() => callback(err));
                                            callback(null, orderID);
                                        });
                                        return;
                                    }
                                    const item = items[stockIndex];
                                    connection.query(
                                        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE productID = ?',
                                        [item.quantity, item.productID],
                                        err => {
                                            if (err) return connection.rollback(() => callback(err));
                                            stockIndex++;
                                            updateNextStock();
                                        }
                                    );
                                }
                                updateNextStock();
                                return;
                            }
                            const item = items[itemIndex];
                            connection.query(
                                `INSERT INTO order_items (orderID, productID, quantity, price, discountedPrice)
                                 VALUES (?, ?, ?, ?, ?)`,
                                [orderID, item.productID, item.quantity, item.price, item.discountedPrice || null],
                                err => {
                                    if (err) return connection.rollback(() => callback(err));
                                    itemIndex++;
                                    insertNextItem();
                                }
                            );
                        }
                        insertNextItem();
                    }
                );
                return;
            }

            const item = items[index];
            checkProductAvailability(item.productID, item.quantity, (err, availability) => {
                if (err) return connection.rollback(() => callback(err));
                if (!availability.available) {
                    return connection.rollback(() => callback(new Error(availability.message)));
                }
                index++;
                checkNext();
            });
        }
        checkNext();
    });
}

function getOrderById(orderID, callback) {
    connection.query(`SELECT o.*, dp.pointName, dp.address as pointAddress, dp.latitude, dp.longitude, dp.work_hours, dp.phone as pointPhone, os.statusName, os.statusDescription FROM orders o LEFT JOIN delivery_points dp ON o.deliveryPointID = dp.pointID LEFT JOIN order_status os ON o.orderStatusID = os.statusID WHERE o.orderID = ?`, [orderID], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0 ? results[0] : null);
    });
}

function getOrderItems(orderID, callback) {
    connection.query(`SELECT oi.*, p.productTitle, p.productThumbnail, p.productManufacturer FROM order_items oi JOIN products p ON oi.productID = p.productID WHERE oi.orderID = ?`, [orderID], callback);
}

function getOrdersByCustomer(customerID, callback) {
    connection.query(`SELECT o.*, os.statusName, os.statusDescription FROM orders o JOIN order_status os ON o.orderStatusID = os.statusID WHERE o.customerID = ? ORDER BY o.orderDate DESC`, [customerID], callback);
}

function updatePaymentStatus(orderID, paymentStatus, callback) {
    connection.query('UPDATE orders SET paymentStatus = ? WHERE orderID = ?', [paymentStatus, orderID], callback);
}

function updateOrderStatus(orderID, statusID, callback) {
    connection.query('UPDATE orders SET orderStatusID = ? WHERE orderID = ?', [statusID, orderID], callback);
}

function generateSBPQRCode(orderID, amount, callback) {
    callback(null, { orderID, amount, timestamp: new Date().toISOString(), type: 'SBP', qrCodeUrl: `/images/qr/sbp_${orderID}.png`, paymentLink: `/payment/sbp/${orderID}` });
}

function generatePaymentData(orderID, amount, callback) {
    callback(null, { orderID, amount, timestamp: new Date().toISOString(), type: 'CASH/CARD', paymentLink: `/payment/confirm/${orderID}` });
}

function getCatalogProducts(customerID, filters, callback) {
    getProductsFiltered(filters, (err, products) => {
        if (err) return callback(err);
        if (!customerID) return callback(null, { products, favorites: [], cart: {}, cartCount: 0 });
        getFavoritesByCustomerID(customerID, (err, favorites) => {
            if (err) favorites = [];
            getCartByCustomerID(customerID, (err, cartItems) => {
                if (err) cartItems = [];
                const cart = {};
                cartItems.forEach(item => { cart[item.productID] = { sc_count: item.sc_count }; });
                const cartCount = Object.values(cart).reduce((sum, i) => sum + (i.sc_count || 0), 0);
                callback(null, { products, favorites: favorites.map(f => f.productID), cart, cartCount });
            });
        });
    });
}

function checkProductAvailability(productID, quantity, callback) {
    connection.query(
        'SELECT stock_quantity FROM products WHERE productID = ?',
        [productID],
        (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) {
                return callback(null, { available: false, message: 'Товар не найден' });
            }
            const stock = results[0].stock_quantity;
            const available = stock >= quantity;
            callback(null, {
                available: available,
                currentStock: stock,
                requested: quantity,
                message: available
                    ? 'Товар в наличии'
                    : `Недостаточно товара на складе. Доступно: ${stock}`
            });
        }
    );
}


//все вместе
// ========== ОПТИМИЗАЦИЯ: получение избранного и корзины одним вызовом (два параллельных запроса) ==========
// Функция не нужна, мы делаем два вызова, но можно объединить – оставим как есть
// Просто убедимся, что getFavoritesByCustomerID и getCartByCustomerID работают быстро


// Экспорт
module.exports = {
    connection, getAllCategories, getPopularProducts, getPriceBounds, getProductCount, getProductsFiltered,
    getPopularSearchSuggestions, searchProducts, getAdminProducts, getProductCategoriesForAdmin, getProductFeaturesCount,
    updateProduct, calculateDiscountedPrice, getDiscountedProducts, getUserRank, addProductWithFeatures,
    getProductFeatures, updateProductFeatures, createUser, findUserByUsername, AccPageRender, UpdateAvatar, UpdateName,
    GetProducts, addToFavorites, removeFromFavorites, getFavoritesByCustomerID, addToCart, getCartByCustomerID,
    removeFromCart, updateCartItem, getProductsByIDs, getProductByID, addReview, getProductReviews, hasUserReviewed,
    getReviewStats, updateProductRating, updateReview, deleteReview, getProductsWithCategories, getCategoriesForProducts,
    getProductsByCategory, deleteProduct, getCartWithProducts, getFavoritesWithProducts, getDeliveryPoints,
    getDeliveryPointById, createOrder, getOrderById, getOrderItems, getOrdersByCustomer, updatePaymentStatus,
    updateOrderStatus, generateSBPQRCode, generatePaymentData, getCatalogProducts, checkProductAvailability,
    getProductImages, saveProductImages, deleteProductImages, getAllCategoriesFull, getCategoryById, addCategory, updateCategory,
    deleteCategory, getCategoryIconsForProducts
};
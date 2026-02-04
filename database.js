const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SportI'
});

// Установка часового пояса
connection.query("SET time_zone = '+08:00'", (err) => {
    if (err) {
        console.error('Ошибка установки часового пояса:', err);
    } else {
        console.log('Часовой пояс БД установлен: +08:00');
    }
});

// Подключение к БД
connection.connect((err) => {
    if (err) throw err;
    console.log('Конекшн комплитед.');
});

// ========================================
// Функции для главной страницы
// ========================================

// Получение всех категорий
function getAllCategories(callback) {
    const query = 'SELECT * FROM categories ORDER BY categorieName';
    connection.query(query, callback);
}

// Получение популярных товаров (по рейтингу)
function getPopularProducts(limit, callback) {
    const query = `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list
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

// ========================================
// Функции для каталога товаров
// ========================================

// Получение границ цен
function getPriceBounds(callback) {
    const query = `
        SELECT 
            COALESCE(MIN(productPrice), 0) AS min_price, 
            COALESCE(MAX(productPrice), 100000) AS max_price 
        FROM products 
        WHERE productPrice IS NOT NULL AND productPrice > 0
    `;
    connection.query(query, callback);
}

// Подсчет количества товаров с фильтрами
function getProductCount(filters, callback) {
    let query = `
        SELECT COUNT(DISTINCT p.productID) as total 
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        WHERE 1=1
    `;
    const params = [];
    
    // Фильтр поиска
    if (filters.searchQuery) {
        query += `
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
        const searchPattern = `%${filters.searchQuery}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // Фильтр по категории
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        const placeholders = filters.categoryIds.map(() => '?').join(',');
        query += `
            AND EXISTS (
                SELECT 1 FROM categoriesandproducts cp2
                WHERE cp2.productID = p.productID 
                AND cp2.categorieID IN (${placeholders})
            )
        `;
        params.push(...filters.categoryIds);
    }
    
    // Фильтр по цене
    if (filters.minPrice) {
        query += ` AND p.productPrice >= ?`;
        params.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
        query += ` AND p.productPrice <= ?`;
        params.push(filters.maxPrice);
    }
    
    // Фильтр акционных товаров
    if (filters.onSale) {
        query += ` 
            AND p.is_on_sale = 1 
            AND COALESCE(p.discount_percentage, 0) > 0 
            AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) 
            AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())
        `;
    }
    
    connection.query(query, params, callback);
}

// Получение товаров с фильтрами и пагинацией
function getProductsFiltered(filters, callback) {
    let query = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list,
            GROUP_CONCAT(DISTINCT c.categorieID ORDER BY c.categorieID SEPARATOR ',') as categories_ids
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        WHERE 1=1
    `;
    const params = [];
    
    // Фильтр поиска
    if (filters.searchQuery) {
        query += `
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
        const searchPattern = `%${filters.searchQuery}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // Фильтр по категории
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        const placeholders = filters.categoryIds.map(() => '?').join(',');
        query += `
            AND EXISTS (
                SELECT 1 FROM categoriesandproducts cp2
                WHERE cp2.productID = p.productID 
                AND cp2.categorieID IN (${placeholders})
            )
        `;
        params.push(...filters.categoryIds);
    }
    
    // Фильтр по цене
    if (filters.minPrice) {
        query += ` AND p.productPrice >= ?`;
        params.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
        query += ` AND p.productPrice <= ?`;
        params.push(filters.maxPrice);
    }
    
    // Фильтр акционных товаров
    if (filters.onSale) {
        query += ` 
            AND p.is_on_sale = 1 
            AND COALESCE(p.discount_percentage, 0) > 0 
            AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) 
            AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())
        `;
    }
    
    // Сортировка
    let orderBy = 'p.created_at DESC';
    switch(filters.sort) {
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
            orderBy = `
                CASE 
                    WHEN p.is_on_sale = 1 
                        AND p.discount_percentage > 0 
                        AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) 
                        AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())
                    THEN COALESCE(p.discount_percentage, 0) 
                    ELSE 0 
                END DESC,
                p.created_at DESC
            `;
            break;
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
        
        callback(null, products);
    });
}

// ========================================
// Функции для поиска
// ========================================

// Получение популярных товаров для поиска
function getPopularSearchSuggestions(limit, callback) {
    const query = `
        SELECT 
            p.productID, 
            p.productTitle, 
            p.productThumbnail, 
            p.productPrice,
            p.is_on_sale,
            p.discount_percentage,
            p.discount_start_date,
            p.discount_end_date
        FROM products p
        WHERE p.productPrice IS NOT NULL
        ORDER BY p.productRating DESC, p.created_at DESC
        LIMIT ?
    `;
    connection.query(query, [limit], callback);
}

// Получение товаров по поисковому запросу
function searchProducts(query, limit, callback) {
    if (query.length < 2) {
        return callback(null, []);
    }
    
    const searchPattern = `%${query}%`;
    const sql = `
        SELECT 
            p.productID, 
            p.productTitle, 
            p.productThumbnail, 
            p.productPrice,
            p.is_on_sale,
            p.discount_percentage,
            p.discount_start_date,
            p.discount_end_date
        FROM products p
        WHERE 
            (p.productTitle LIKE ? OR p.productDescription LIKE ?)
            AND p.productPrice IS NOT NULL
        ORDER BY 
            CASE 
                WHEN p.productTitle LIKE ? THEN 1 
                ELSE 2 
            END,
            p.productRating DESC
        LIMIT ?
    `;
    
    connection.query(sql, [
        searchPattern, 
        searchPattern,
        `${query}%`,
        limit
    ], callback);
}

// ========================================
// Функции для админки
// ========================================

// Получение товаров для админки с пагинацией
function getAdminProducts(filters, callback) {
    let query = `
        SELECT * FROM products 
        WHERE 1=1
    `;
    const params = [];
    
    if (filters.searchQuery) {
        const searchPattern = `%${filters.searchQuery}%`;
        query += ` AND (productTitle LIKE ? OR productManufacturer LIKE ? OR productDescription LIKE ?)`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ` ORDER BY productID LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset);
    
    connection.query(query, params, callback);
}

// Получение категорий товара для админки
function getProductCategoriesForAdmin(productID, callback) {
    const query = `
        SELECT c.categorieName 
        FROM categories c
        JOIN categoriesandproducts cp ON c.categorieID = cp.categorieID
        WHERE cp.productID = ?
    `;
    connection.query(query, [productID], (err, results) => {
        if (err) return callback(err);
        callback(null, results.map(cat => cat.categorieName));
    });
}

// Получение количества характеристик товара
function getProductFeaturesCount(productID, callback) {
    const query = 'SELECT COUNT(*) as count FROM product_features WHERE productID = ?';
    connection.query(query, [productID], callback);
}

// ========================================
// Существующие функции (без изменений)
// ========================================

function createUser(username, hashedPassword, email, callback) {
    const query = 'INSERT INTO customers (customerName, customerPassword, customerEmail) VALUES (?, ?, ?)';
    connection.query(query, [username, hashedPassword, email], callback);
}

function findUserByUsername(email, callback) {
    const query = 'SELECT * FROM customers WHERE customerEmail = ?';
    connection.query(query, [email], callback);
}

function AccPageRender(session_id, callback){
    const query = `select * from customers where customerID = (?)`
    connection.query(query, [session_id], callback);
}

function UpdateAvatar(avatar, session_id, callback){
    const query = `UPDATE customers SET customerThumbnail = (?) where customerID = (?)`
    connection.query(query, [avatar,session_id],callback)
}

function UpdateName(name_value, session_id, callback){
    const query = `UPDATE customers SET customerName = (?) where customerID = (?)`
    connection.query(query, [name_value,session_id],callback)
}

function GetProducts(callback) {
    const query = `SELECT p.*, GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list, GROUP_CONCAT(DISTINCT c.categorieID ORDER BY c.categorieID SEPARATOR ',') as categories_ids FROM products p LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID LEFT JOIN categories c ON cp.categorieID = c.categorieID GROUP BY p.productID ORDER BY p.created_at DESC, p.productID DESC`;
    connection.query(query, (err, results) => {
        if (err) return callback(err);
        
        const products = results.map(row => ({
            ...row,
            categories: row.categories_list ? row.categories_list.split(', ') : [],
            categories_ids: row.categories_ids ? row.categories_ids.split(',').map(id => parseInt(id)) : [],
            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
            created_at: row.created_at
        }));
        
        callback(null, products);
    });
}

function addToCart(customerID, productID, callback) {
    const query = `INSERT INTO shopping_cart (customerID, productID, sc_count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE sc_count = sc_count + 1`;
    connection.query(query, [customerID, productID], callback);
}

function updateCartItem(customerID, productID, action, callback) {
    const query = (action === 'increase') ?
        'UPDATE shopping_cart SET sc_count = sc_count + 1 WHERE customerID = ? AND productID = ?' :
        'UPDATE shopping_cart SET sc_count = sc_count - 1 WHERE customerID = ? AND productID = ? AND sc_count > 0';
    connection.query(query, [customerID, productID], (error, results) => {
        if (error) return callback(error);
        
        if (action === 'decrease' && results.affectedRows > 0 && results.changedRows > 0) {
            const selectiveDeleteQuery = 'DELETE FROM shopping_cart WHERE customerID = ? AND productID = ? AND sc_count = 0';
            connection.query(selectiveDeleteQuery, [customerID, productID], (error) => {
                if (error) return callback(error);
            });
        }
        
        callback(null, results);
    });
}

function getCartByCustomerID(customerID, callback) {
    const query = 'SELECT productID, sc_count FROM shopping_cart WHERE customerID = ?';
    connection.query(query, [customerID], callback);
}

function getCartWithProducts(customerID, callback) {
    const query = `SELECT sc.*, p.* FROM shopping_cart sc JOIN products p ON sc.productID = p.productID WHERE sc.customerID = ?`;
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

function getProductByID(productID, callback) {
    const query = 'SELECT * FROM products WHERE productID = ?';
    connection.query(query, [productID], (error, results) => {
        if (error) return callback(error, null);
        if (results.length === 0) return callback(null, null);
        
        const product = results[0];
        if (product.productPrice) {
            product.productPrice = parseFloat(product.productPrice);
        }
        
        callback(null, product);
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

function removeFromCart(customerID, productID, callback) {
    const query = 'DELETE FROM shopping_cart WHERE customerID = ? AND productID = ?';
    connection.query(query, [customerID, productID], callback);
}

function addToFavorites(productID, customerID, callback) {
    const query = 'INSERT INTO favorites (productID, customerID) VALUES (?, ?)';
    connection.query(query, [productID, customerID], callback);
}

function removeFromFavorites(productID, customerID, callback) {
    const query = 'DELETE FROM favorites WHERE productID = ? AND customerID = ?';
    connection.query(query, [productID, customerID], callback);
}

function getFavoritesByCustomerID(customerID, callback) {
    const query = `SELECT p.productID, p.productThumbnail, p.productTitle, p.productPrice, p.productDescription, p.productRating, p.productManufacturer, p.created_at FROM favorites f JOIN products p ON f.productID = p.productID WHERE f.customerID = ? ORDER BY p.created_at DESC`;
    connection.query(query, [customerID], callback);
}

function addReview(productID, customerID, rating, comment, callback) {
    const query = 'INSERT INTO reviews (productID, customerID, rating, comment) VALUES (?, ?, ?, ?)';
    connection.query(query, [productID, customerID, rating, comment], (err, results) => {
        if (err) return callback(err);
        updateProductRating(productID, (updateErr) => {
            callback(updateErr || err, results);
        });
    });
}

function getProductReviews(productID, callback) {
    const query = `SELECT r.*, c.customerName, c.customerThumbnail FROM reviews r JOIN customers c ON r.customerID = c.customerID WHERE r.productID = ? ORDER BY r.created_at DESC`;
    connection.query(query, [productID], callback);
}

function hasUserReviewed(productID, customerID, callback) {
    const query = 'SELECT * FROM reviews WHERE productID = ? AND customerID = ?';
    connection.query(query, [productID, customerID], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0);
    });
}

function getReviewStats(productID, callback) {
    const query = `SELECT rating, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage FROM reviews WHERE productID = ? GROUP BY rating ORDER BY rating DESC`;
    connection.query(query, [productID], callback);
}

function updateProductRating(productID, callback) {
    const query = `UPDATE products SET productRating = ( SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE productID = ? ) WHERE productID = ?`;
    connection.query(query, [productID, productID], callback);
}

function updateReview(reviewID, rating, comment, callback) {
    const query = 'UPDATE reviews SET rating = ?, comment = ? WHERE reviewID = ?';
    connection.query(query, [rating, comment, reviewID], callback);
}

function deleteReview(reviewID, callback) {
    const query = 'DELETE FROM reviews WHERE reviewID = ?';
    connection.query(query, [reviewID], callback);
}

function getCategoriesForProducts(productIDs, callback) {
    if (!productIDs || productIDs.length === 0) return callback(null, {});
    
    const placeholders = productIDs.map(() => '?').join(',');
    const query = `
        SELECT cp.productID, c.categorieName 
        FROM categoriesandproducts cp
        JOIN categories c ON cp.categorieID = c.categorieID
        WHERE cp.productID IN (${placeholders})
    `;
    
    connection.query(query, productIDs, (err, results) => {
        if (err) return callback(err);
        
        const categoriesMap = {};
        results.forEach(row => {
            if (!categoriesMap[row.productID]) {
                categoriesMap[row.productID] = [];
            }
            categoriesMap[row.productID].push(row.categorieName);
        });
        
        callback(null, categoriesMap);
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
    const query = `SELECT p.* FROM products p JOIN categoriesandproducts cp ON p.productID = cp.productID WHERE cp.categorieID = ? GROUP BY p.productID ORDER BY p.productID`;
    connection.query(query, [categoryID], callback);
}

function getUserRank(customerID, callback) {
    const query = 'SELECT customerRank FROM customers WHERE customerID = ?';
    connection.query(query, [customerID], callback);
}

function addProductWithFeatures(productData, categories, features, callback) {
    connection.beginTransaction((err) => {
        if (err) return callback(err);
        
        const discountPercentage = productData.discount_percentage ? parseFloat(productData.discount_percentage) : 0;
        const isOnSale = (productData.is_on_sale && discountPercentage > 0) ? 1 : 0;
        
        const productQuery = `
            INSERT INTO products (
                productTitle, 
                productManufacturer, 
                productDescription, 
                productPrice, 
                productThumbnail,
                discount_percentage,
                discount_start_date,
                discount_end_date,
                is_on_sale,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        connection.query(productQuery, [
            productData.productTitle,
            productData.productManufacturer,
            productData.productDescription,
            productData.productPrice,
            productData.productThumbnail,
            discountPercentage,
            productData.discount_start_date || null,
            productData.discount_end_date || null,
            isOnSale
        ], (err, result) => {
            if (err) {
                console.error('Product insert error:', err);
                return connection.rollback(() => callback(err));
            }
            
            const productID = result.insertId;
            
            if (categories && categories.length > 0) {
                const categoryPromises = categories.map(categoryName => {
                    return new Promise((resolve, reject) => {
                        const findCategoryQuery = 'SELECT categorieID FROM categories WHERE categorieName = ?';
                        connection.query(findCategoryQuery, [categoryName], (err, results) => {
                            if (err) return reject(err);
                            
                            let categorieID;
                            if (results.length > 0) {
                                categorieID = results[0].categorieID;
                                const linkQuery = 'INSERT INTO categoriesandproducts (categorieID, productID) VALUES (?, ?)';
                                connection.query(linkQuery, [categorieID, productID], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            } else {
                                resolve();
                            }
                        });
                    });
                });
                
                if (features && features.length > 0) {
                    const featurePromises = features.map(feature => {
                        return new Promise((resolve, reject) => {
                            const featureQuery = `
                                INSERT INTO product_features (productID, feature_key, feature_value) 
                                VALUES (?, ?, ?)
                            `;
                            connection.query(featureQuery, [productID, feature.key, feature.value], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    });
                    
                    Promise.all([...categoryPromises, ...featurePromises])
                        .then(() => {
                            connection.commit((err) => {
                                if (err) {
                                    console.error('Commit error:', err);
                                    return connection.rollback(() => callback(err));
                                }
                                callback(null, productID);
                            });
                        })
                        .catch(err => {
                            console.error('Promise error:', err);
                            connection.rollback(() => callback(err));
                        });
                } else {
                    Promise.all(categoryPromises)
                        .then(() => {
                            connection.commit((err) => {
                                if (err) {
                                    console.error('Commit error:', err);
                                    return connection.rollback(() => callback(err));
                                }
                                callback(null, productID);
                            });
                        })
                        .catch(err => {
                            console.error('Promise error:', err);
                            connection.rollback(() => callback(err));
                        });
                }
            } else {
                connection.commit((err) => {
                    if (err) {
                        console.error('Commit error:', err);
                        return connection.rollback(() => callback(err));
                    }
                    callback(null, productID);
                });
            }
        });
    });
}

function getProductFeatures(productID, callback) {
    const query = 'SELECT * FROM product_features WHERE productID = ? ORDER BY featureID';
    connection.query(query, [productID], (error, results) => {
        if (error) {
            console.error('Ошибка получения характеристик:', error);
            return callback(error, []);
        }
        
        const features = results.map(row => ({
            key: row.feature_key,
            value: row.feature_value,
            featureID: row.featureID
        }));
        
        callback(null, features);
    });
}

function updateProductFeatures(productID, features, callback) {
    const deleteQuery = 'DELETE FROM product_features WHERE productID = ?';
    connection.query(deleteQuery, [productID], (err) => {
        if (err) return callback(err);
        
        if (features && features.length > 0) {
            const featurePromises = features.map(feature => {
                return new Promise((resolve, reject) => {
                    const insertQuery = `
                        INSERT INTO product_features (productID, feature_key, feature_value) 
                        VALUES (?, ?, ?)
                    `;
                    connection.query(insertQuery, [productID, feature.key, feature.value], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });
            
            Promise.all(featurePromises)
                .then(() => callback(null))
                .catch(callback);
        } else {
            callback(null);
        }
    });
}

function updateProduct(productID, productData, categories, features, callback) {
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Ошибка начала транзакции:', err);
            return callback(err);
        }
        
        const { productRating, ...updateData } = productData;
        const discountPercentage = updateData.discount_percentage || 0;
        const discountStartDate = updateData.discount_start_date || null;
        const discountEndDate = updateData.discount_end_date || null;
        const isOnSale = updateData.is_on_sale || 0;
        
        let discountPrice = null;
        if (isOnSale == 1 && discountPercentage > 0) {
            const originalPrice = parseFloat(updateData.productPrice) || 0;
            discountPrice = originalPrice * (1 - discountPercentage / 100);
        }
        
        const updateProductQuery = `
            UPDATE products 
            SET productTitle = ?, 
                productManufacturer = ?, 
                productDescription = ?, 
                productPrice = ?, 
                productThumbnail = COALESCE(?, productThumbnail),
                discount_percentage = ?,
                discount_start_date = ?,
                discount_end_date = ?,
                is_on_sale = ?,
                discount_price = ?
            WHERE productID = ?
        `;
        
        connection.query(updateProductQuery, [
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
            productID
        ], (err, result) => {
            if (err) {
                console.error('Ошибка обновления товара:', err);
                return connection.rollback(() => callback(err));
            }
            
            const deleteCategoriesQuery = 'DELETE FROM categoriesandproducts WHERE productID = ?';
            connection.query(deleteCategoriesQuery, [productID], (err, result) => {
                if (err) {
                    console.error('Ошибка удаления старых категорий:', err);
                    return connection.rollback(() => callback(err));
                }
                
                if (categories && categories.length > 0) {
                    const categoryPromises = categories.map(categoryName => {
                        return new Promise((resolve, reject) => {
                            const findCategoryQuery = 'SELECT categorieID FROM categories WHERE categorieName = ?';
                            connection.query(findCategoryQuery, [categoryName], (err, results) => {
                                if (err) return reject(err);
                                
                                let categorieID;
                                if (results.length > 0) {
                                    categorieID = results[0].categorieID;
                                    resolve({ categorieID, productID });
                                } else {
                                    const insertCategoryQuery = 'INSERT INTO categories (categorieName) VALUES (?)';
                                    connection.query(insertCategoryQuery, [categoryName], (err, catResult) => {
                                        if (err) return reject(err);
                                        categorieID = catResult.insertId;
                                        resolve({ categorieID, productID });
                                    });
                                }
                            });
                        }).then(({ categorieID, productID }) => {
                            return new Promise((resolve, reject) => {
                                const linkQuery = 'INSERT INTO categoriesandproducts (categorieID, productID) VALUES (?, ?)';
                                connection.query(linkQuery, [categorieID, productID], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            });
                        });
                    });
                    
                    Promise.all(categoryPromises)
                        .then(() => {
                            updateProductFeatures(productID, features, (err) => {
                                if (err) {
                                    console.error('Ошибка обновления характеристик:', err);
                                    return connection.rollback(() => callback(err));
                                }
                                
                                connection.commit((err) => {
                                    if (err) {
                                        console.error('Ошибка коммита:', err);
                                        return connection.rollback(() => callback(err));
                                    }
                                    callback(null, productID);
                                });
                            });
                        })
                        .catch(err => {
                            console.error('Ошибка добавления категорий:', err);
                            connection.rollback(() => callback(err));
                        });
                } else {
                    updateProductFeatures(productID, features, (err) => {
                        if (err) {
                            console.error('Ошибка обновления характеристик:', err);
                            return connection.rollback(() => callback(err));
                        }
                        
                        connection.commit((err) => {
                            if (err) {
                                console.error('Ошибка коммита:', err);
                                return connection.rollback(() => callback(err));
                            }
                            callback(null, productID);
                        });
                    });
                }
            });
        });
    });
}

function calculateDiscountedPrice(product) {
    const originalPrice = parseFloat(product.productPrice) || 0;
    const discountPercentage = parseFloat(product.discount_percentage) || 0;
    
    if (!product.is_on_sale || discountPercentage <= 0) {
        return {
            originalPrice: originalPrice,
            discountedPrice: originalPrice,
            discountPercentage: 0,
            isDiscounted: false,
            isOnSale: false
        };
    }
    
    // Используем время из БД напрямую без конвертации
    const now = new Date();
    let isDiscountActive = product.is_on_sale == 1;
    
    // Проверяем даты как строки из БД (уже в правильном часовом поясе)
    if (product.discount_start_date) {
        const startDate = new Date(product.discount_start_date);
        // Конвертируем в миллисекунды для точного сравнения
        if (now.getTime() < startDate.getTime()) {
            isDiscountActive = false;
        }
    }
    
    if (product.discount_end_date) {
        const endDate = new Date(product.discount_end_date);
        if (now.getTime() > endDate.getTime()) {
            isDiscountActive = false;
        }
    }
    
    if (!isDiscountActive) {
        return {
            originalPrice: originalPrice,
            discountedPrice: originalPrice,
            discountPercentage: 0,
            isDiscounted: false,
            isOnSale: product.is_on_sale == 1
        };
    }
    
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    
    return {
        originalPrice: originalPrice,
        discountedPrice: isNaN(discountedPrice) ? originalPrice : discountedPrice,
        discountPercentage: discountPercentage,
        isDiscounted: true,
        isOnSale: true,
        savings: originalPrice - discountedPrice,
        endDate: product.discount_end_date
    };
}

function getDiscountedProducts(limit, callback) {
    const query = `SELECT p.*, GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list FROM products p LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID LEFT JOIN categories c ON cp.categorieID = c.categorieID WHERE p.is_on_sale = 1 AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW()) AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW()) GROUP BY p.productID ORDER BY p.discount_percentage DESC, p.created_at DESC LIMIT ?`;
    
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

function deleteProduct(productID, callback) {
    const deleteFeaturesQuery = 'DELETE FROM product_features WHERE productID = ?';
    connection.query(deleteFeaturesQuery, [productID], (err) => {
        if (err) return callback(err);
        
        const deleteCategoriesQuery = 'DELETE FROM categoriesandproducts WHERE productID = ?';
        connection.query(deleteCategoriesQuery, [productID], (err) => {
            if (err) return callback(err);
            
            const deleteReviewsQuery = 'DELETE FROM reviews WHERE productID = ?';
            connection.query(deleteReviewsQuery, [productID], (err) => {
                if (err) return callback(err);
                
                const deleteFavoritesQuery = 'DELETE FROM favorites WHERE productID = ?';
                connection.query(deleteFavoritesQuery, [productID], (err) => {
                    if (err) return callback(err);
                    
                    const deleteCartQuery = 'DELETE FROM shopping_cart WHERE productID = ?';
                    connection.query(deleteCartQuery, [productID], (err) => {
                        if (err) return callback(err);
                        
                        const deleteProductQuery = 'DELETE FROM products WHERE productID = ?';
                        connection.query(deleteProductQuery, [productID], callback);
                    });
                });
            });
        });
    });
}

function getFavoritesWithProducts(customerID, callback) {
    const query = `SELECT p.*, f.favoritesID FROM favorites f JOIN products p ON f.productID = p.productID WHERE f.customerID = ? ORDER BY f.favoritesID DESC`;
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

// Экспорт всех функций
module.exports = {
    connection,
    // Новые функции для главной страницы
    getAllCategories,
    getPopularProducts,
    // Новые функции для каталога
    getPriceBounds,
    getProductCount,
    getProductsFiltered,
    // Новые функции для поиска
    getPopularSearchSuggestions,
    searchProducts,
    // Новые функции для админки
    getAdminProducts,
    getProductCategoriesForAdmin,
    getProductFeaturesCount,
    // Существующие функции
    updateProduct,
    calculateDiscountedPrice,
    getDiscountedProducts,
    getUserRank,
    addProductWithFeatures,
    getProductFeatures,
    updateProductFeatures,
    createUser,
    findUserByUsername,
    AccPageRender,
    UpdateAvatar,
    UpdateName,
    GetProducts,
    addToFavorites,
    removeFromFavorites,
    getFavoritesByCustomerID,
    addToCart,
    getCartByCustomerID,
    removeFromCart,
    updateCartItem,
    getProductsByIDs,
    getProductByID,
    addReview,
    getProductReviews,
    hasUserReviewed,
    getReviewStats,
    updateProductRating,
    updateReview,
    deleteReview,
    getProductsWithCategories,
    getCategoriesForProducts,
    getProductsByCategory,
    deleteProduct,
    getCartWithProducts,
    getFavoritesWithProducts
};
const mysql = require('mysql2');

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'sportI'
// });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SportI'
});

//Аккаунт
connection.connect((err) => {
    if (err) throw err;
    console.log('Конекшн комплитед.');
});

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

// Обновленная функция GetProducts для получения всех категорий
function GetProducts(callback) {
    const query = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list,
            GROUP_CONCAT(DISTINCT c.categorieID ORDER BY c.categorieID SEPARATOR ',') as categories_ids
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        GROUP BY p.productID
        ORDER BY p.created_at DESC, p.productID DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) return callback(err);
        
        const products = results.map(row => ({
            ...row,
            categories: row.categories_list ? row.categories_list.split(', ') : [],
            categories_ids: row.categories_ids ? row.categories_ids.split(',').map(id => parseInt(id)) : [],
            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
            created_at: row.created_at // добавляем дату создания
        }));
        
        callback(null, products);
    });
}

function addToCart(customerID, productID, callback) {
    const query = `INSERT INTO shopping_cart (customerID, productID, sc_count) 
                   VALUES (?, ?, 1) 
                   ON DUPLICATE KEY UPDATE sc_count = sc_count + 1`; // использует ON DUPLICATE KEY для автоматического обновления
    connection.query(query, [customerID, productID], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results); // Возвращаем результаты или ошибку
    });
}

function updateCartItem(customerID, productID, action, callback) {
    const query = (action === 'increase') ?
        'UPDATE shopping_cart SET sc_count = sc_count + 1 WHERE customerID = ? AND productID = ?' :
        'UPDATE shopping_cart SET sc_count = sc_count - 1 WHERE customerID = ? AND productID = ? AND sc_count > 0';

    connection.query(query, [customerID, productID], (error, results) => {
        if (error) {
            return callback(error);
        }

        // Если количество стало 0, удаляем товар
        if (action === 'decrease' && results.affectedRows > 0 && results.changedRows > 0) {
            const selectiveDeleteQuery = 'DELETE FROM shopping_cart WHERE customerID = ? AND productID = ? AND sc_count = 0';
            connection.query(selectiveDeleteQuery, [customerID, productID], (error) => {
                if (error) {
                    return callback(error);
                }
            });
        }

        callback(null, results);
    });
}

function getCartByCustomerID(customerID, callback) {
    const query = 'SELECT productID, sc_count FROM shopping_cart WHERE customerID = ?';
    connection.query(query, [customerID], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
}

// Функция для получения корзины с деталями товаров
function getCartWithProducts(customerID, callback) {
    const query = `
        SELECT sc.*, p.* 
        FROM shopping_cart sc
        JOIN products p ON sc.productID = p.productID
        WHERE sc.customerID = ?
    `;
    
    connection.query(query, [customerID], (error, results) => {
        if (error) {
            return callback(error);
        }
        
        // Рассчитываем скидки для каждого товара
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
        if (error) {
            console.error('Ошибка получения товара:', error);
            return callback(error, null);
        }
        
        if (results.length === 0) {
            return callback(null, null);
        }
        
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

    if (remaining === 0) {
        return callback(null, products); // Если массив пустой, сразу возвращаем пустой массив
    }

    productIDs.forEach(productID => {
        getProductByID(productID, (err, product) => {
            if (err) {
                return callback(err); // В случае ошибки вызываем коллбек с ошибкой
            }
            if (product) {
                products.push(product); // Добавляем продукт в массив
            }
            remaining--;

            // Если все запросы завершены, вызываем коллбек с результатами
            if (remaining === 0) {
                callback(null, products);
            }
        });
    });
}

function removeFromCart(customerID, productID, callback) {
    const query = 'DELETE FROM shopping_cart WHERE customerID = ? AND productID = ?';
    connection.query(query, [customerID, productID], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
}

// Функция для добавления товара в избранное
function addToFavorites(productID, customerID, callback) {
    const query = 'INSERT INTO favorites (productID, customerID) VALUES (?, ?)';
    connection.query(query, [productID, customerID], (err, results) => {
        callback(err, results);
    });
}

// Функция для удаления товара из избранного
function removeFromFavorites(productID, customerID, callback) {
    const query = 'DELETE FROM favorites WHERE productID = ? AND customerID = ?';
    connection.query(query, [productID, customerID], (err, results) => {
        callback(err, results);
    });
}

// Функция для получения списка избранных товаров пользователя
function getFavoritesByCustomerID(customerID, callback) {
    const query = `
        SELECT p.productID, p.productThumbnail, p.productTitle, p.productPrice, 
               p.productDescription, p.productRating, p.productManufacturer,
               p.created_at
        FROM favorites f
        JOIN products p ON f.productID = p.productID
        WHERE f.customerID = ?
        ORDER BY p.created_at DESC
    `;
    connection.query(query, [customerID], callback);
}
// Добавление нового отзыва
function addReview(productID, customerID, rating, comment, callback) {
    const query = 'INSERT INTO reviews (productID, customerID, rating, comment) VALUES (?, ?, ?, ?)';
    connection.query(query, [productID, customerID, rating, comment], (err, results) => {
        if (err) {
            return callback(err);
        }
        // Обновляем средний рейтинг продукта
        updateProductRating(productID, (updateErr) => {
            callback(updateErr || err, results);
        });
    });
}

// Получение отзывов для продукта
function getProductReviews(productID, callback) {
    const query = `
        SELECT r.*, c.customerName, c.customerThumbnail 
        FROM reviews r
        JOIN customers c ON r.customerID = c.customerID
        WHERE r.productID = ?
        ORDER BY r.created_at DESC
    `;
    connection.query(query, [productID], callback);
}

// Проверка, оставлял ли пользователь отзыв для этого продукта
function hasUserReviewed(productID, customerID, callback) {
    const query = 'SELECT * FROM reviews WHERE productID = ? AND customerID = ?';
    connection.query(query, [productID, customerID], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0);
    });
}

// Получение статистики отзывов
function getReviewStats(productID, callback) {
    const query = `
        SELECT 
            rating,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
        FROM reviews 
        WHERE productID = ?
        GROUP BY rating
        ORDER BY rating DESC
    `;
    connection.query(query, [productID], callback);
}

// Обновление среднего рейтинга продукта
function updateProductRating(productID, callback) {
    const query = `
        UPDATE products 
        SET productRating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE productID = ?
        ) 
        WHERE productID = ?
    `;
    connection.query(query, [productID, productID], callback);
}

// Обновление существующего отзыва
function updateReview(reviewID, rating, comment, callback) {
    const query = 'UPDATE reviews SET rating = ?, comment = ? WHERE reviewID = ?';
    connection.query(query, [rating, comment, reviewID], callback);
}

// Удаление отзыва
function deleteReview(reviewID, callback) {
    const query = 'DELETE FROM reviews WHERE reviewID = ?';
    connection.query(query, [reviewID], callback);
}

// Получение категорий для продуктов
function getCategoriesForProducts(productIDs, callback) {
    if (!productIDs || productIDs.length === 0) {
        return callback(null, {});
    }
    
    const placeholders = productIDs.map(() => '?').join(',');
    const query = `
        SELECT cp.productID, c.categorieName 
        FROM categoriesandproducts cp
        JOIN categories c ON cp.categorieID = c.categorieID
        WHERE cp.productID IN (${placeholders})
    `;
    
    connection.query(query, productIDs, (err, results) => {
        if (err) return callback(err);
        
        // Группируем по productID
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

// Функция для получения всех продуктов с категориями
function getProductsWithCategories(callback) {
    const query = `
        SELECT 
            p.productID,
            p.productTitle,
            p.productThumbnail,
            p.productPrice,
            p.productDescription,
            p.productManufacturer,
            p.productRating,
            p.created_at, // добавляем поле
            GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        GROUP BY p.productID
        ORDER BY p.created_at DESC, p.productID DESC
    `;
    
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
            created_at: row.created_at, // добавляем в результат
            categories: row.categories_list ? row.categories_list.split(', ') : [],
            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized'
        }));
        
        callback(null, products);
    });
}

// Функция для получения товаров по категории
function getProductsByCategory(categoryID, callback) {
    const query = `
        SELECT p.*
        FROM products p
        JOIN categoriesandproducts cp ON p.productID = cp.productID
        WHERE cp.categorieID = ?
        GROUP BY p.productID
        ORDER BY p.productID
    `;
    
    connection.query(query, [categoryID], callback);
}

// Функция для получения ранга пользователя
function getUserRank(customerID, callback) {
    const query = 'SELECT customerRank FROM customers WHERE customerID = ?';
    connection.query(query, [customerID], callback);
}

// Функция для добавления товара со скидками
function addProductWithFeatures(productData, categories, features, callback) {
    connection.beginTransaction((err) => {
        if (err) return callback(err);
        
        // 1. Подготавливаем данные скидки
        const discountPercentage = productData.discount_percentage ? 
            parseFloat(productData.discount_percentage) : 0;
        
        const isOnSale = (productData.is_on_sale && discountPercentage > 0) ? 1 : 0;
        
        // 2. Добавляем товар
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
            
            // 3. Добавляем категории если есть
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
                                resolve(); // Пропускаем несуществующие категории
                            }
                        });
                    });
                });
                
                // 4. Добавляем характеристики если есть
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
                    
                    // Ждем все операции
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
                    // Только категории
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
                // Нет категорий
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

// Функция для получения характеристик товара
function getProductFeatures(productID, callback) {
    
    const query = 'SELECT * FROM product_features WHERE productID = ? ORDER BY featureID';
    connection.query(query, [productID], (error, results) => {
        if (error) {
            console.error('Ошибка получения характеристик:', error);
            return callback(error, []);
        }
        
        // Преобразуем результаты в нужный формат
        const features = results.map(row => ({
            key: row.feature_key,
            value: row.feature_value,
            featureID: row.featureID
        }));
        
        callback(null, features);
    });
}

// Функция для обновления характеристик товара
function updateProductFeatures(productID, features, callback) {
    // Удаляем старые характеристики
    const deleteQuery = 'DELETE FROM product_features WHERE productID = ?';
    connection.query(deleteQuery, [productID], (err) => {
        if (err) return callback(err);
        
        // Добавляем новые характеристики
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

// Функция для обновления товара со скидками
function updateProduct(productID, productData, categories, features, callback) {
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Ошибка начала транзакции:', err);
            return callback(err);
        }
        
        // 1. Обновляем товар со скидками
        const { productRating, ...updateData } = productData;
        
        // Определяем данные скидки
        const discountPercentage = updateData.discount_percentage || 0;
        const discountStartDate = updateData.discount_start_date || null;
        const discountEndDate = updateData.discount_end_date || null;
        const isOnSale = updateData.is_on_sale || 0;
        
        // Рассчитываем discount_price если есть скидка
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
            
            // 2. Удаляем старые категории и добавляем новые
            const deleteCategoriesQuery = 'DELETE FROM categoriesandproducts WHERE productID = ?';
            connection.query(deleteCategoriesQuery, [productID], (err, result) => {
                if (err) {
                    console.error('Ошибка удаления старых категорий:', err);
                    return connection.rollback(() => callback(err));
                }
                
                // 3. Добавляем новые категории если есть
                if (categories && categories.length > 0) {
                    const categoryPromises = categories.map(categoryName => {
                        return new Promise((resolve, reject) => {
                            // Находим или создаем категорию
                            const findCategoryQuery = 'SELECT categorieID FROM categories WHERE categorieName = ?';
                            connection.query(findCategoryQuery, [categoryName], (err, results) => {
                                if (err) return reject(err);
                                
                                let categorieID;
                                if (results.length > 0) {
                                    categorieID = results[0].categorieID;
                                    resolve({ categorieID, productID });
                                } else {
                                    // Создаем новую категорию
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
                    
                    // 4. Обновляем характеристики
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
                    // Нет категорий
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

//Функция расчета скидки
function calculateDiscountedPrice(product) {
    // Преобразуем цены в числа с проверкой
    const originalPrice = parseFloat(product.productPrice) || 0;
    const discountPercentage = parseFloat(product.discount_percentage) || 0;
    
    // Если товар не в продаже или нет процента скидки
    if (!product.is_on_sale || discountPercentage <= 0) {
        return {
            originalPrice: originalPrice,
            discountedPrice: originalPrice,
            discountPercentage: 0,
            isDiscounted: false,
            isOnSale: false
        };
    }
    
    // Проверяем сроки действия скидки
    const now = new Date();
    let isDiscountActive = product.is_on_sale == 1;
    
    // Проверяем даты если они есть
    if (product.discount_start_date) {
        const startDate = new Date(product.discount_start_date);
        if (now < startDate) {
            isDiscountActive = false;
        }
    }
    
    if (product.discount_end_date) {
        const endDate = new Date(product.discount_end_date);
        if (now > endDate) {
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
// Функция для получения товаров со скидкой
function getDiscountedProducts(limit, callback) {
     const query = `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        WHERE p.is_on_sale = 1 
        AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())
        AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW())
        GROUP BY p.productID
        ORDER BY p.discount_percentage DESC, p.created_at DESC
        LIMIT ?
    `;
    
    connection.query(query, [limit], (err, results) => {
        if (err) return callback(err);
        
        const products = results.map(row => {
            const priceInfo = calculateDiscountedPrice(row);
            return {
                ...row,
                categories: row.categories_list ? row.categories_list.split(', ') : [],
                category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized',
                priceInfo: priceInfo,
                displayPrice: priceInfo.isDiscounted ? priceInfo.discountedPrice : parseFloat(row.productPrice)
            };
        });
        
        callback(null, products);
    });
}

// Функция для удаления товара
function deleteProduct(productID, callback) {
    // Удаляем характеристики
    const deleteFeaturesQuery = 'DELETE FROM product_features WHERE productID = ?';
    connection.query(deleteFeaturesQuery, [productID], (err) => {
        if (err) return callback(err);
        
        // Удаляем категории
        const deleteCategoriesQuery = 'DELETE FROM categoriesandproducts WHERE productID = ?';
        connection.query(deleteCategoriesQuery, [productID], (err) => {
            if (err) return callback(err);
            
            // Удаляем отзывы
            const deleteReviewsQuery = 'DELETE FROM reviews WHERE productID = ?';
            connection.query(deleteReviewsQuery, [productID], (err) => {
                if (err) return callback(err);
                
                // Удаляем из избранного
                const deleteFavoritesQuery = 'DELETE FROM favorites WHERE productID = ?';
                connection.query(deleteFavoritesQuery, [productID], (err) => {
                    if (err) return callback(err);
                    
                    // Удаляем из корзин
                    const deleteCartQuery = 'DELETE FROM shopping_cart WHERE productID = ?';
                    connection.query(deleteCartQuery, [productID], (err) => {
                        if (err) return callback(err);
                        
                        // Удаляем сам товар
                        const deleteProductQuery = 'DELETE FROM products WHERE productID = ?';
                        connection.query(deleteProductQuery, [productID], callback);
                    });
                });
            });
        });
    });
}

// Функция для получения избранного с деталями товаров
function getFavoritesWithProducts(customerID, callback) {
    const query = `
        SELECT p.*, f.favoritesID
        FROM favorites f
        JOIN products p ON f.productID = p.productID
        WHERE f.customerID = ?
        ORDER BY f.favoritesID DESC
    `;
    
    connection.query(query, [customerID], (error, results) => {
        if (error) {
            return callback(error);
        }
        
        // Рассчитываем скидки для каждого товара
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
//Экспорт
module.exports = { 
    connection, 
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
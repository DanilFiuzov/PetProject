const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'GameCenter'
});

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'GameCenter'
// });

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
        ORDER BY p.productID
    `;
    
    connection.query(query, (err, results) => {
        if (err) return callback(err);
        
        // Обрабатываем результаты
        const products = results.map(row => ({
            ...row,
            categories: row.categories_list ? row.categories_list.split(', ') : [],
            categories_ids: row.categories_ids ? row.categories_ids.split(',').map(id => parseInt(id)) : [],
            // Первая категория для отображения (можно выбрать приоритетную)
            category: row.categories_list ? row.categories_list.split(', ')[0] : 'Uncategorized'
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

function getProductByID(productID, callback) {
    const query = 'SELECT * FROM products WHERE productID = ?';
    connection.query(query, [productID], (error, results) => {
        if (error) {
            console.error('Ошибка получения товара:', error);
            return callback(error, null);
        }
        
        if (results.length === 0) {
            console.log('Товар не найден, ID:', productID);
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
        SELECT p.productID, p.productThumbnail, p.productTitle, p.productPrice, p.productDescription, p.productRating, p.productManufacturer
        FROM favorites f
        JOIN products p ON f.productID = p.productID
        WHERE f.customerID = ?
    `;

    connection.query(query, [customerID], (err, results) => {
        callback(err, results);
    });
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
            GROUP_CONCAT(DISTINCT c.categorieName ORDER BY c.categorieName SEPARATOR ', ') as categories_list
        FROM products p
        LEFT JOIN categoriesandproducts cp ON p.productID = cp.productID
        LEFT JOIN categories c ON cp.categorieID = c.categorieID
        GROUP BY p.productID
        ORDER BY p.productID
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

// Функция для добавления товара с характеристиками
function addProductWithFeatures(productData, categories, features, callback) {
    // Начинаем транзакцию
    connection.beginTransaction((err) => {
        if (err) return callback(err);
        
        // 1. Добавляем товар
        const productQuery = `
            INSERT INTO products (productTitle, productManufacturer, productDescription, productPrice, productThumbnail) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        connection.query(productQuery, [
            productData.productTitle,
            productData.productManufacturer,
            productData.productDescription,
            productData.productPrice,
            productData.productThumbnail
        ], (err, result) => {
            if (err) {
                return connection.rollback(() => callback(err));
            }
            
            const productID = result.insertId;
            const promises = [];
            
            // 2. Добавляем категории если есть
            if (categories && categories.length > 0) {
                categories.forEach(categoryName => {
                    promises.push(new Promise((resolve, reject) => {
                        // Находим ID категории по имени
                        const findCategoryQuery = 'SELECT categorieID FROM categories WHERE categorieName = ?';
                        connection.query(findCategoryQuery, [categoryName], (err, results) => {
                            if (err) return reject(err);
                            
                            if (results.length > 0) {
                                const categorieID = results[0].categorieID;
                                // Связываем товар с категорией
                                const linkQuery = 'INSERT INTO categoriesandproducts (categorieID, productID) VALUES (?, ?)';
                                connection.query(linkQuery, [categorieID, productID], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            } else {
                                // Если категории нет, создаем её
                                const insertCategoryQuery = 'INSERT INTO categories (categorieName) VALUES (?)';
                                connection.query(insertCategoryQuery, [categoryName], (err, catResult) => {
                                    if (err) return reject(err);
                                    
                                    const categorieID = catResult.insertId;
                                    const linkQuery = 'INSERT INTO categoriesandproducts (categorieID, productID) VALUES (?, ?)';
                                    connection.query(linkQuery, [categorieID, productID], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                });
                            }
                        });
                    }));
                });
            }
            
            // 3. Добавляем характеристики если есть
            if (features && features.length > 0) {
                features.forEach(feature => {
                    promises.push(new Promise((resolve, reject) => {
                        const featureQuery = `
                            INSERT INTO product_features (productID, feature_key, feature_value) 
                            VALUES (?, ?, ?)
                        `;
                        connection.query(featureQuery, [productID, feature.key, feature.value], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }));
                });
            }
            
            // Ждем завершения всех операций
            if (promises.length > 0) {
                Promise.all(promises)
                    .then(() => {
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => callback(err));
                            }
                            callback(null, productID);
                        });
                    })
                    .catch(err => {
                        connection.rollback(() => callback(err));
                    });
            } else {
                // Нет ни категорий, ни характеристик
                connection.commit((err) => {
                    if (err) {
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
    console.log('Вызов getProductFeatures для productID:', productID);
    
    const query = 'SELECT * FROM product_features WHERE productID = ? ORDER BY featureID';
    connection.query(query, [productID], (error, results) => {
        if (error) {
            console.error('Ошибка получения характеристик:', error);
            return callback(error, []);
        }
        
        console.log('Результаты характеристик:', results);
        
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

// Функция для обновления товара (без изменения рейтинга)
function updateProduct(productID, productData, categories, features, callback) {
    console.log('=== updateProduct вызвана ===');
    console.log('productID:', productID);
    console.log('categories для обновления:', categories);
    console.log('features для обновления:', features);
    
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Ошибка начала транзакции:', err);
            return callback(err);
        }
        
        // 1. Обновляем товар (исключаем productRating из обновления)
        const { productRating, ...updateData } = productData;
        
        const updateProductQuery = `
            UPDATE products 
            SET productTitle = ?, 
                productManufacturer = ?, 
                productDescription = ?, 
                productPrice = ?, 
                productThumbnail = COALESCE(?, productThumbnail)
            WHERE productID = ?
        `;
        
        connection.query(updateProductQuery, [
            updateData.productTitle,
            updateData.productManufacturer,
            updateData.productDescription,
            updateData.productPrice,
            updateData.productThumbnail, // Может быть null
            productID
        ], (err, result) => {
            if (err) {
                return connection.rollback(() => callback(err));
            }
            
            // 2. Удаляем старые категории и добавляем новые
            const deleteCategoriesQuery = 'DELETE FROM categoriesandproducts WHERE productID = ?';
            connection.query(deleteCategoriesQuery, [productID], (err, result) => {
                if (err) {
                    console.error('Ошибка удаления старых категорий:', err);
                    return connection.rollback(() => callback(err));
                }
                
                console.log('Удалено старых связей с категориями:', result.affectedRows);
                
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
                    
                    // 3. Обновляем характеристики
                    Promise.all(categoryPromises)
                        .then(() => {
                            // Используем существующую функцию updateProductFeatures
                            updateProductFeatures(productID, features, (err) => {
                                if (err) {
                                    return connection.rollback(() => callback(err));
                                }
                                
                                connection.commit((err) => {
                                    if (err) {
                                        return connection.rollback(() => callback(err));
                                    }
                                    callback(null, productID);
                                });
                            });
                        })
                        .catch(err => {
                            connection.rollback(() => callback(err));
                        });
                } else {
                    // Нет категорий
                    updateProductFeatures(productID, features, (err) => {
                        if (err) {
                            return connection.rollback(() => callback(err));
                        }
                        
                        connection.commit((err) => {
                            if (err) {
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


//Экспорт
module.exports = { 
    connection, 
    updateProduct,
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
    getProductsByCategory
 };
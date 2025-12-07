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

function GetProducts(callback){
    const query = `SELECT * FROM products`
    connection.query(query,callback)
}

function addToCart(customerID, productID, callback) {
    const query = `INSERT INTO shopping_cart (customerID, productID, sc_count) 
                   VALUES (?, ?, 1) 
                   ON DUPLICATE KEY UPDATE sc_count = sc_count + 1`;
    connection.query(query, [customerID, productID], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
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
            return callback(error);
        }
        if (results.length > 0) {
            results[0].productPrice = parseFloat(results[0].productPrice); // Преобразуем в число
        }
        callback(null, results[0]);
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

//Экспорт
module.exports = { 
    connection, 
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
    getProductByID
 };
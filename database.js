const mysql = require('mysql2');

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'GameCenter'
// });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'GameCenter'
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


//Игры
// function GetDeveloperGames( session_id, callback ){
//     const query = `SELECT * FROM games WHERE customerID = (?)`
//     connection.query(query, [session_id], callback)
// }

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
    const query = 'SELECT productID, productThumbnail, productTitle, productPrice, productRating FROM products WHERE productID = ?';
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
    const query = 'SELECT productID FROM favorites WHERE customerID = ?';
    connection.query(query, [customerID], (err, results) => {
        callback(err, results);
    });
}

// function AddGame(session_id, title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, callback){
//     const query = `INSERT INTO games (customerID, gameTitle, gameDescription, gameImage, cssFile, jsFile, routeFile, viewFile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
//     connection.query(query, [session_id, title, description, imagePath , cssFilePath, jsFilePath, routeFilePath, viewFilePath], callback)
// }

// function DeleteGame(gameId ,session_id, callback){
//     const query = `DELETE FROM games WHERE gameID = (?) AND customerID = (?)`
//     connection.query(query, [gameId, session_id], callback)
// }

// function UpdateGame(title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, session_id, callback){
//     const query = `update games set gameTitle = ?, gameDescription = ?, gameImage = ?, cssFile = ?, jsFile = ?, routeFile = ?, viewFile = ? where customerID = ?`
//     connection.query(query, [title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, session_id],callback)
// }

// function DeleteGameData(data ,gameId, callback){
//     const query = `update games set ?? = null where gameID = ?`
//     connection.query(query, [data, gameId],callback)
// }

// function SelectGame(gameId ,callback){
//     const query = `SELECT * from games WHERE gameID = (?)`
//     connection.query(query , [gameId], callback)
// }

// function CountGames(session_id,callback){
//     const query = `SELECT * FROM games WHERE customerID = ?`
//     connection.query(query,[session_id],callback)
// }

// function SelectWinLoss(session_id,gameId,callback){
//     const query = "select * from winandloss where customerID = (?) and gameID = (?)"
//     connection.query(query,[session_id,gameId],callback)
// }

// function AddEmpty(session_id,gameId,callback){
//     const query = "insert into winandloss (customerID,gameID) values (?,?)"
//     connection.query(query, [session_id,gameId],callback)
// }

//Достижеия
// function SelectAchievements(userId, callback){
//     const query = ` SELECT achievement_type, count, achieved FROM achievements WHERE customerID = ?`
//     connection.query(query, [userId], callback)
// }

// function SelectOneAchievement(userId, callback) {
//     const query = `SELECT wins, losses FROM winandloss WHERE customerID = ?`;
//     connection.query(query, [userId], callback);
// }

// function InsertAchievement(userId, achievement_type, newCount, achievement_name ,callback){
//     const query = `INSERT INTO achievements (customerID, achievement_type, count, achieved, Name)
//                    VALUES (?, ?, ?, true, ?) 
//                    ON DUPLICATE KEY UPDATE count = ?, achieved = true`;
//     connection.query(query, [userId, achievement_type, newCount, achievement_name, newCount], callback);
// }

// function UpdateAchievement(newCount, userId, achievement_type, callback){
//     const query = `UPDATE achievements SET count = ? WHERE customerID = ? AND achievement_type = ?`;
//     connection.query(query, [newCount, userId, achievement_type], callback);
// }

// function UpdateWinRate(added_wins,added_losses,added_score,added_draws,gameId, userId, callback){
//     const query =  `Update winandloss SET wins = wins + ?, losses = losses + ?, score = score + ?, draws = draws + ? where gameID = ? AND customerID = ?`
//     connection.query(query,[added_wins,added_losses,added_score,added_draws,gameId,userId],callback)
// }


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
    getProductByID,
    removeFromCart,
    updateCartItem
    // AddGame,
    // DeleteGame,
    // UpdateGame,
    // SelectGame,
    // DeleteGameData,
    // GetDeveloperGames,
    // CountGames,
    // SelectWinLoss,
    // AddEmpty,
    // SelectAchievements,
    // SelectOneAchievement,
    // InsertAchievement,
    // UpdateAchievement,
    // UpdateWinRate
 };
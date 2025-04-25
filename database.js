const mysql = require('mysql2');

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'GameCenter'
// });

const connection = mysql.createConnection({
    host: '192.168.88.188',
    user: 'student2',
    password: 'n8z6qv',
    database: 'gamecenter'
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

function UpdateNameandPhone(name_value, session_id, callback){
    const query = `UPDATE customers SET customerName = (?) where customerID = (?)`
    connection.query(query, [name_value,session_id],callback)
}
//

//Игры
function GetDeveloperGames( session_id, callback ){
    const query = `SELECT * FROM games WHERE customerID = (?)`
    connection.query(query, [session_id], callback)
}

function GetGames(callback){
    const query = `SELECT * FROM games`
    connection.query(query,callback)
}

function AddGame(session_id, title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, callback){
    const query = `INSERT INTO games (customerID, gameTitle, gameDescription, gameImage, cssFile, jsFile, routeFile, viewFile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    connection.query(query, [session_id, title, description, imagePath , cssFilePath, jsFilePath, routeFilePath, viewFilePath], callback)
}

function DeleteGame(gameId ,session_id, callback){
    const query = `DELETE FROM games WHERE gameID = (?) AND customerID = (?)`
    connection.query(query, [gameId, session_id], callback)
}

function UpdateGame(title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, session_id, callback){
    const query = `update games set gameTitle = ?, gameDescription = ?, gameImage = ?, cssFile = ?, jsFile = ?, routeFile = ?, viewFile = ? where customerID = ?`
    connection.query(query, [title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, session_id],callback)
}

function DeleteGameData(data ,gameId, callback){
    const query = `update games set ?? = null where gameID = ?`
    connection.query(query, [data, gameId],callback)
}

function SelectGame(gameId ,callback){
    const query = `SELECT * from games WHERE gameID = (?)`
    connection.query(query , [gameId], callback)
}

function CountGames(session_id,callback){
    const query = `SELECT * FROM games WHERE customerID = ?`
    connection.query(query,[session_id],callback)
}

function SelectWinLoss(session_id,gameId,callback){
    const query = "select * from winandloss where customerID = (?) and gameID = (?)"
    connection.query(query,[session_id,gameId],callback)
}

function AddEmpty(session_id,gameId,callback){
    const query = "insert into winandloss (customerID,gameID) values (?,?)"
    connection.query(query, [session_id,gameId],callback)
}

//Достижеия
function SelectAchivements(userId, callback){
    const query = ` SELECT achievement_type, count, achieved 
        FROM achievements 
        WHERE customerID = ?`
    connection.query(query, [userId], callback)
}

function SelectOneAchivement(userId, achievement_type,callback){
    const query = `SELECT count FROM achievements WHERE customerID = ? AND achievement_type = ?`
    connection.query(query,[userId,achievement_type],callback)
}

function InsertAchivement(userId, achievement_type, newCount, callback){
    const query = `INSERT INTO achievements (customerID, achievement_type, count, achieved) VALUES (?, ?, ?, true) ON DUPLICATE KEY UPDATE count = ?, achieved = true`;
    connection.query(query, [userId, achievement_type, newCount, newCount], callback);
}

function UpdateAchivement(newCount, userId, achievement_type, callback){
    const query = `UPDATE achievements SET count = ? WHERE customerID = ? AND achievement_type = ?`;
    connection.query(query, [newCount, userId, achievement_type], callback);
}


module.exports = { 
    connection, 
    createUser, 
    findUserByUsername, 
    AccPageRender,
    UpdateAvatar,
    UpdateNameandPhone,
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame,
    SelectGame,
    DeleteGameData,
    GetDeveloperGames,
    CountGames,
    SelectWinLoss,
    AddEmpty,
    SelectAchivements,
    SelectOneAchivement,
    InsertAchivement,
    UpdateAchivement
 };
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'GameCenter'
});

// const connection = mysql.createConnection({
//     host: '192.168.88.188',
//     user: 'student2',
//     password: 'n8z6qv',
//     database: 'db_student2'
// });


connection.connect((err) => {
    if (err) throw err;
    console.log('Конекшн комплитед.');
});

function createUser(username, hashedPassword, email, phone, callback) {

    const query = 'INSERT INTO customers (customerName, customerPassword, customerEmail, customerPhone) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, hashedPassword, email, phone], callback);
}

function findUserByUsername(email, callback) {
    const query = 'SELECT * FROM customers WHERE customerEmail = ?';
    connection.query(query, [email], callback);
}

function AccPageRender(session_id,callback){

    const query = `select * from customers where customerID = (?)`

    connection.query(query, [session_id], callback);
}

function UpdateAvatar(avatar,session_id, callback){
    const query = `UPDATE customers SET customerThumbnail = (?) where customerID = (?)`
    connection.query(query, [avatar,session_id],callback)
}

function UpdateNameandPhone(name_value,phone_value, session_id,callback){
    const query = `UPDATE customers SET customerName = (?),customerPhone = (?) where customerID = (?)`
    connection.query(query, [name_value,phone_value,session_id],callback)
}

module.exports = { 
    connection, 
    createUser, 
    findUserByUsername, 
    AccPageRender,
    UpdateAvatar,
    UpdateNameandPhone
 };
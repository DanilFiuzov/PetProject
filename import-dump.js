const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Подключение к БД Railway
const connection = mysql.createConnection({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'iZXbrIWERtPBdzQItNTjPiEdLvvKDnyo',
  database: 'railway',
  port: 3306
});

// Читаем файл дампа
const dumpFile = path.join(__dirname, 'DUMP_database.sql');
const dumpContent = fs.readFileSync(dumpFile, 'utf8');

// Разбиваем на отдельные SQL-запросы
const queries = dumpContent
  .split(';')
  .map(q => q.trim())
  .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('/*'));

console.log(`Найдено ${queries.length} запросов для выполнения...`);

// Выполняем запросы по одному
let executed = 0;
let errors = 0;

function executeNext() {
  if (queries.length === 0) {
    console.log(`\n✅ Импорт завершён! Выполнено: ${executed}, Ошибок: ${errors}`);
    connection.end();
    return;
  }

  const query = queries.shift();
  
  connection.query(query, (err) => {
    executed++;
    
    if (err) {
      errors++;
      console.log(`❌ Ошибка в запросе ${executed}:`, err.message);
    } else {
      process.stdout.write(`✅ Выполнено ${executed}/${queries.length + executed}\r`);
    }
    
    executeNext();
  });
}

connection.connect((err) => {
  if (err) {
    console.error('❌ Ошибка подключения:', err);
    process.exit(1);
  }
  
  console.log('✅ Подключение к базе данных установлено');
  console.log('🚀 Начинаем импорт...\n');
  
  executeNext();
});
const connection = require('./database');

// Функция для обновления статуса скидок
function updateDiscountStatus() {
    console.log('Обновление статуса скидок...', new Date());
    
    // Деактивируем просроченные скидки
    const deactivateQuery = `
        UPDATE products 
        SET is_on_sale = 0 
        WHERE is_on_sale = 1 
        AND discount_end_date IS NOT NULL 
        AND discount_end_date < NOW()
    `;
    
    // Активируем скидки, срок которых начался
    const activateQuery = `
        UPDATE products 
        SET is_on_sale = 1 
        WHERE discount_percentage > 0 
        AND (discount_start_date IS NULL OR discount_start_date <= NOW())
        AND (discount_end_date IS NULL OR discount_end_date >= NOW())
    `;
    
    // Обновляем discount_price для активных скидок
    const updatePriceQuery = `
        UPDATE products 
        SET discount_price = productPrice * (1 - discount_percentage / 100)
        WHERE is_on_sale = 1 
        AND discount_percentage > 0
    `;
    
    // Обнуляем discount_price для неактивных скидок
    const resetPriceQuery = `
        UPDATE products 
        SET discount_price = NULL
        WHERE is_on_sale = 0 
        OR discount_percentage = 0
    `;
    
    connection.connection.query(deactivateQuery, (err) => {
        if (err) console.error('Ошибка деактивации скидок:', err);
        
        connection.connection.query(activateQuery, (err) => {
            if (err) console.error('Ошибка активации скидок:', err);
            
            connection.connection.query(updatePriceQuery, (err) => {
                if (err) console.error('Ошибка обновления цен:', err);
                
                connection.connection.query(resetPriceQuery, (err) => {
                    if (err) console.error('Ошибка сброса цен:', err);
                    console.log('Статус скидок обновлен');
                });
            });
        });
    });
}

// Запускаем сразу и затем каждые 5 минут
updateDiscountStatus();
setInterval(updateDiscountStatus, 5 * 60 * 1000);

module.exports = { updateDiscountStatus };
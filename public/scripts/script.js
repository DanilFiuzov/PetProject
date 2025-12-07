//перебор картинок
const avatarLabels = document.querySelectorAll('.avatar');
avatarLabels.forEach(label => {
    label.addEventListener('click', () => {
        // Сбросить выделение всех аватаров
        avatarLabels.forEach(l => {
            l.classList.remove('selected');
            l.querySelector('input[type="checkbox"]').checked = false; // Снимаем отметку с chekbox
        });

        // Выбор текущего аватара
        label.classList.add('selected');
        label.querySelector('input[type="checkbox"]').checked = true; // Устанавливаем отметку для выбранного чекбокса
    });
});

//Избранное
function toggleFavorite(event, productID) {
    const heartIcon = document.getElementById(`heart-${productID}`);
    const isFavorited = heartIcon.classList.contains('fas'); // Проверяем, закрашено ли сердце

    const url = isFavorited ? '/favorites/remove' : '/favorites/add';
    const method = 'POST';

    // Отправка AJAX запроса
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productID: productID }),
    })
    .then(response => {
        if (response.ok) {
            // Обновляем интерфейс
            heartIcon.classList.toggle('fas'); // Переключение закрашенного
            heartIcon.classList.toggle('far'); // Переключение пустого
            heartIcon.title = isFavorited ? 'Add to favorites' : 'Remove from favorites'; // Switch title
        } else {
            console.error('Error updating favorites');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//Добавление в корзину
function addToCart(productID) {
    fetch('/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productID: productID })
    })
    .then(response => {
        // Вывести статус и текст ответа для отладки
        console.log('Response status:', response.status);
        return response.text(); // Получение ответа как текст
    })
    .then(text => {
        try {
            const data = JSON.parse(text); // Пытаемся преобразовать текст в JSON
            if (data.success) {

            } else {
                alert('Не удалось добавить товар в корзину. Попробуйте еще раз.');
            }
        } catch (error) {
            console.error('Ошибка обработки JSON:', error);
            alert('Не удалось добавить товар в корзину. Пожалуйста, проверьте консоль для получения дополнительной информации.');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при добавлении товара в корзину. Попробуйте еще раз.');
    });
}

//Разворачиваемые пункты
  function toggleVisibility(sectionId) {
        const section = document.getElementById(sectionId);
        const icon = sectionId === 'description' ? document.getElementById('description-icon') : document.getElementById('features-icon');

        if (section.classList.contains('collapse')) {
            section.classList.remove('collapse');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            section.classList.add('collapse');
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
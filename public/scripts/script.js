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

// //Удаление файлов
// async function clearInput(inputId, button) {
//     // Скрываем инпут
//     document.getElementById(inputId).style.display = 'block';

//     // Отображаем информацию о файлах
//     const InfoDiv = document.getElementById(inputId+"2");
//     InfoDiv.style.display = 'none'; // Показываем блок с информацией

//     // Опционально - можно скрыть кнопку
//     button.style.display = 'none';

//       // Выполнение POST запроса
//       try {
//         const lastSegment = window.location.pathname.split('/').pop();
//         const response = await fetch(`/delete_data/${inputId}_${lastSegment}`, {
//             method: 'POST'
//         });

//         if (!response.ok) {
//             throw new Error('Сеть ответа не в порядке');
//         }
//     } catch (error) {
//         console.error('Ошибка при выполнении запроса:', error);
//     } 
// }

// document.getElementById('confirmDelete').addEventListener('click', function () {
//     document.getElementById('deleteForm').submit(); // Отправляем форму
// });

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
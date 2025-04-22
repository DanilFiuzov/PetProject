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

//корзина
let cart = {}; // Объект для хранения товаров в корзине
let totalAmount = 0; // Общая сумма товаров

// Функция для сохранения корзины в sessionStorage
function saveCart() {
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

// Функция для загрузки корзины из sessionStorage
function loadCart() {
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Функция для обновления общей суммы
function updateTotalAmount() {
    document.querySelector('#totalAmount strong').innerText = `₽${totalAmount.toFixed(2)}`;
}

// Загрузка корзины из sessionStorage при загрузке страницы
loadCart();

// Обработчик для кнопок "Добавить в корзину"
document.querySelectorAll('.addToCart').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.getAttribute('data-name');
        const productPrice = parseFloat(this.getAttribute('data-price'));
        const productCat = this.getAttribute('data-cat');

        // Если товар уже в корзине, увеличиваем его количество
        if (cart[productName]) {
            cart[productName].quantity += 1;
        } else {
            // Иначе добавляем новый товар в корзину
            cart[productName] = {
                price: productPrice,
                category: productCat,
                quantity: 1,
            };
        }

        // Сохраняем корзину в sessionStorage и обновляем интерфейс
        saveCart();
        renderCart();
    });
});

// Функция для отрисовки корзины
function renderCart() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = ''; // Очищаем текущий список

    totalAmount = 0; // Сбрасываем общую сумму

    for (let productName in cart) {
        const product = cart[productName];
        const productTotalPrice = product.price * product.quantity;
        totalAmount += productTotalPrice;

        // Создаем элемент списка с кнопками для количества (прибавить/убавить)
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between lh-sm';
        listItem.innerHTML = `
            <div class="d-flex flex-column">
                <h6 class="my-0">${productName}</h6>
                <small class="text-muted text-truncate">${product.category}</small>
            </div>
            <div class="flex-column ml-auto">
                <h6 class="my-0">₽${productTotalPrice.toFixed(2)}</h6>
                <small class="text-muted">(Кол-во: ${product.quantity})</small>
            </div>
            <div>
                <button type="button" class="btn btn-primary increaseItem">+</button>
                <button type="button" class="btn btn-danger decreaseItem">-</button>
                <button type="button" class="btn-close deleteItem" aria-label="Close"></button>
            </div>
        `;

        // Добавляем элемент в корзину
        cartList.appendChild(listItem);

        // Обработчик для кнопки увеличения количества
        listItem.querySelector('.increaseItem').addEventListener('click', function() {
            cart[productName].quantity += 1;
            saveCart(); // Сохраняем корзину после изменения
            renderCart(); // Перерисовываем корзину
        });

        // Обработчик для кнопки уменьшения количества
        listItem.querySelector('.decreaseItem').addEventListener('click', function() {
            if (cart[productName].quantity > 1) {
                cart[productName].quantity -= 1;
            } else {
                delete cart[productName]; // Удаляем товар, если его количество 0
            }
            saveCart(); // Сохраняем корзину после изменения
            renderCart(); // Перерисовываем корзину
        });

        // Обработчик для кнопки удаления товара
        listItem.querySelector('.deleteItem').addEventListener('click', function() {
            delete cart[productName];
            saveCart(); // Сохраняем корзину после изменения
            renderCart(); // Перерисовываем корзину
        });
    }

    // Обновляем общую сумму
    updateTotalAmount();
}

// Вызываем renderCart после загрузки страницы
renderCart();


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

document.querySelectorAll('.addToCart').forEach(button => {
    button.addEventListener('click', function(event) {
        // Получаем уникальный идентификатор продукта (если нужен для каких-то действий)
        const productId = button.getAttribute('data-product-id');

        // Получаем иконку корзины и показываем её
        const cartIcon = document.getElementById(`cartIcon${productId}`);
        cartIcon.style.display = 'block';

        // Получаем информацию о кнопке и её позиции
        const buttonRect = button.getBoundingClientRect();

        // Устанавливаем начальную позицию иконки для анимации
        cartIcon.style.left = `${buttonRect.left + window.scrollX}px`; // Позиция кнопки (по горизонтали)
        cartIcon.style.top = `${buttonRect.top + window.scrollY}px`;   // Позиция кнопки (по вертикали)

        // Удаляем предыдущий класс анимации (если он есть)
        cartIcon.classList.remove('flying');

        // Настройка таймера для завершения предыдущей анимации перед добавлением нового
        setTimeout(() => {
            // Анимация: добавление класса с анимацией
            cartIcon.classList.add('flying');
        }, 10); // Небольшая пауза, чтобы убедиться, что класс был удалён

        // После завершения анимации скрываем иконку
        cartIcon.addEventListener('animationend', () => {
            cartIcon.style.display = 'none'; // Скрываем иконку
        }, { once: true });
    });
});

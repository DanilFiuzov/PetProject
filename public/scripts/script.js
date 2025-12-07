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
    const heartIcon = event.target.closest('button').querySelector('i');
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
            heartIcon.title = isFavorited ? 'Добавить в избранное' : 'Убрать из избранного'; // Switch title
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
        return response.json(); // Берем ответ как JSON
    })
    .then(data => {
        if (data.success) {
            console.log('Товар добавлен в корзину:', data.cartCount);
            // Обновляем счетчик корзины если он есть на странице
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = data.cartCount;
            }
            // Показываем уведомление
            showNotification('Товар добавлен в корзину!', 'success');
        } else {
            showNotification('Не удалось добавить товар в корзину', 'error');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showNotification('Произошла ошибка при добавлении товара в корзину', 'error');
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

// Функции для отзывов
let currentProductID = null;

// Загрузка отзывов
function loadReviews(productID) {
    currentProductID = productID;
    
    fetch(`/api/reviews/${productID}`)
        .then(response => response.json())
        .then(data => {
            updateReviewStats(data.stats);
            renderReviews(data.reviews);
            updateAddReviewButton();
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
        });
}

// Обновление статистики
function updateReviewStats(stats) {
    // Обновляем прогресс-бары
    [5, 4, 3, 2, 1].forEach(rating => {
        const stat = stats.find(s => s.rating == rating) || { percentage: 0, count: 0 };
        const progressBar = document.getElementById(`progress-${rating}`);
        const countElement = document.getElementById(`count-${rating}`);
        
        if (progressBar) {
            progressBar.style.width = `${stat.percentage || 0}%`;
        }
        if (countElement) {
            countElement.textContent = stat.count || 0;
        }
    });
}

// Рендеринг списка отзывов
function renderReviews(reviews) {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center py-5">
                    <i class="far fa-comment-alt fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Пока нет отзывов</h5>
                    <p class="text-muted">Будьте первым, кто поделится своим мнением об этом товаре</p>
                </div>
            </div>
        `;
        return;
    }
    
    const reviewsHTML = reviews.map(review => `
        <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center">
                        <img src="${review.customerThumbnail || '/images/Avatars/default-avatar.png'}" 
                             alt="${review.customerName}" 
                             class="rounded-circle me-3" 
                             style="width: 50px; height: 50px; object-fit: cover;">
                        <div>
                            <h6 class="mb-0">${review.customerName}</h6>
                            <small class="text-muted">
                                ${new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </small>
                        </div>
                    </div>
                    <div class="review-star-rating">
                        ${Array(5).fill().map((_, i) => 
                            i < review.rating 
                                ? '<i class="fas fa-star text-warning" style="color: #ffc107 !important; -webkit-text-fill-color: #ffc107 !important; fill: #ffc107 !important;"></i>'
                                : '<i class="far fa-star text-muted" style="color: #dee2e6 !important; -webkit-text-fill-color: #dee2e6 !important; fill: #dee2e6 !important;"></i>'
                        ).join('')}
                    </div>
                </div>
                <p class="mb-0" style="line-height: 1.5;">${review.comment}</p>
            </div>
        </div>
    `).join('');
    
    // Если есть контейнер для отзывов
    const reviewsList = container.querySelector('.reviews-list');
    if (reviewsList) {
        reviewsList.innerHTML = reviewsHTML;
    } else {
        container.innerHTML = `<div class="reviews-list">${reviewsHTML}</div>`;
    }
}

// Обновление кнопки добавления отзыва
function updateAddReviewButton() {
    if (!currentProductID) return;
    
    fetch(`/api/reviews/${currentProductID}/check`)
        .then(response => response.json())
        .then(data => {
            const button = document.getElementById('add-review-btn');
            if (button) {
                if (data.hasReviewed) {
                    button.disabled = true;
                    button.innerHTML = '<i class="fas fa-check me-2"></i>Вы уже оставили отзыв';
                    button.classList.add('btn-secondary');
                    button.classList.remove('btn-primary');
                } else {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-plus me-2"></i>Оставить отзыв';
                    button.classList.add('btn-primary');
                    button.classList.remove('btn-secondary');
                }
            }
        })
        .catch(error => {
            console.error('Error checking review:', error);
        });
}

// Функции для звезд рейтинга
let currentRating = 0;

function hoverStars(rating) {
    const stars = document.querySelectorAll('#starRating .fa-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-muted');
            star.classList.add('text-warning');
        } else {
            star.classList.remove('text-warning');
            star.classList.add('text-muted');
        }
    });
}

function resetStars() {
    const stars = document.querySelectorAll('#starRating .fa-star');
    stars.forEach((star, index) => {
        if (index < currentRating) {
            star.classList.remove('text-muted');
            star.classList.add('text-warning');
        } else {
            star.classList.remove('text-warning');
            star.classList.add('text-muted');
        }
    });
}

function setRating(rating) {
    currentRating = rating;
    resetStars();
}

function openReviewModal() {
    // Проверяем, авторизован ли пользователь
    const userId = document.getElementById('userId')?.value;
    if (!userId) {
        window.location.href = '/login';
        return;
    }
    
    // Проверяем, не оставлял ли уже отзыв
    const hasReviewed = document.getElementById('hasReviewed')?.value === 'true';
    if (hasReviewed) {
        showNotification('Вы уже оставили отзыв на этот товар', 'warning');
        return;
    }
    
    currentRating = 0;
    document.getElementById('reviewComment').value = '';
    
    // Сброс звезд
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach(star => {
        star.classList.remove('text-warning');
        star.classList.add('text-muted');
    });
    
    // Скрываем ошибки
    document.getElementById('rating-error').classList.add('d-none');
    document.getElementById('comment-error').classList.add('d-none');
    
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();
}

function submitReview() {
    const comment = document.getElementById('reviewComment').value.trim();
    let isValid = true;
    
    // Валидация рейтинга
    if (currentRating === 0) {
        document.getElementById('rating-error').classList.remove('d-none');
        isValid = false;
    }
    
    // Валидация комментария
    if (comment.length < 10) {
        document.getElementById('comment-error').classList.remove('d-none');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Получаем productID из скрытого поля
    const productID = document.getElementById('productId').value;
    
    // Отправка данных
    fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productID: productID,
            rating: currentRating,
            comment: comment
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
            if (modal) modal.hide();
            
            // Обновляем страницу
            loadReviews(productID);
            
            // Обновляем статус hasReviewed
            document.getElementById('hasReviewed').value = 'true';
            
            // Показываем уведомление
            showNotification('Отзыв успешно добавлен!', 'success');
            
            // Обновляем кнопку
            updateAddReviewButton();
        } else {
            showNotification(data.error || 'Ошибка при добавлении отзыва', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Произошла ошибка при отправке отзыва', 'error');
    });
}

// Всплывающее уведомление
function showNotification(message, type) {
    // Удаляем старые уведомления
    document.querySelectorAll('.alert-notification').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} alert-dismissible fade show alert-notification`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, находимся ли мы на странице продукта
    const productIdElement = document.getElementById('productId');
    
    if (productIdElement) {
        const productId = productIdElement.value;
        if (productId) {
            loadReviews(productId);
        }
    }
    
    // Добавляем обработчики событий для звезд рейтинга
    const stars = document.querySelectorAll('#starRating i');
    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                hoverStars(rating);
            });
            
            star.addEventListener('mouseout', resetStars);
            
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                setRating(rating);
            });
        });
    }
});
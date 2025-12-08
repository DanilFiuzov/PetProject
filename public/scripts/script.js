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
    
    // Проверяем, находимся ли мы на странице редактирования товара
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        initEditProductForm();
    }
    
    // Проверяем, находимся ли мы на странице добавления товара
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        initAddProductForm();
    }
});

// Функции для страницы добавления товара
function initAddProductForm() {
    const addFeatureBtn = document.getElementById('addFeatureBtn');
    const featuresContainer = document.getElementById('featuresContainer');
    const productImageInput = document.querySelector('input[name="productImage"]');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.querySelector('.image-preview-container');
    const addProductForm = document.getElementById('addProductForm');
    
    if (addFeatureBtn && featuresContainer) {
        addFeatureBtn.addEventListener('click', function() {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item mb-3 border rounded p-3 bg-light';
            featureItem.innerHTML = `
                <div class="row g-2">
                    <div class="col-md-5">
                        <input type="text" 
                               class="form-control" 
                               name="feature_keys[]" 
                               placeholder="Характеристика (например: Вес)"
                               required>
                    </div>
                    <div class="col-md-5">
                        <input type="text" 
                               class="form-control" 
                               name="feature_values[]" 
                               placeholder="Значение (например: 5 кг)"
                               required>
                    </div>
                    <div class="col-md-2">
                        <button type="button" 
                                class="btn btn-outline-danger w-100 remove-feature-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            featuresContainer.appendChild(featureItem);
            
            // Добавляем обработчик для кнопки удаления
            const removeBtn = featureItem.querySelector('.remove-feature-btn');
            removeBtn.addEventListener('click', function() {
                if (featuresContainer.children.length > 1) {
                    featureItem.remove();
                } else {
                    // Не удаляем последнее поле, но очищаем его
                    const inputs = featureItem.querySelectorAll('input');
                    inputs.forEach(input => input.value = '');
                }
            });
        });
        
        // Добавляем обработчики для существующих кнопок удаления
        document.querySelectorAll('.remove-feature-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (featuresContainer.children.length > 1) {
                    this.closest('.feature-item').remove();
                } else {
                    const featureItem = this.closest('.feature-item');
                    const inputs = featureItem.querySelectorAll('input');
                    inputs.forEach(input => input.value = '');
                }
            });
        });
    }
    
    // Предпросмотр изображения
    if (productImageInput && imagePreview) {
        productImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    if (imagePreviewContainer) {
                        imagePreviewContainer.style.display = 'block';
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Обработка формы добавления товара
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Показываем индикатор загрузки
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Добавление...';
            submitBtn.disabled = true;
            
            // Создаем FormData для отправки файлов
            const formData = new FormData(this);
            
            fetch('/admin/add-product', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Успешное добавление
                    showNotification(data.message, 'success');
                    
                    // Очистка формы через 2 секунды
                    setTimeout(() => {
                        addProductForm.reset();
                        if (imagePreviewContainer) {
                            imagePreviewContainer.style.display = 'none';
                        }
                        
                        // Удаляем все поля характеристик кроме первого
                        const featureItems = featuresContainer.querySelectorAll('.feature-item');
                        featureItems.forEach((item, index) => {
                            if (index > 0) {
                                item.remove();
                            } else {
                                // Очищаем первое поле
                                const inputs = item.querySelectorAll('input');
                                inputs.forEach(input => input.value = '');
                            }
                        });
                        
                        // Восстанавливаем кнопку
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        
                        // Перенаправление на страницу товара через 3 секунды
                        setTimeout(() => {
                            window.location.href = `/product/${data.productID}`;
                        }, 3000);
                    }, 2000);
                } else {
                    // Ошибка
                    showNotification(data.message || 'Ошибка при добавлении товара', 'error');
                    
                    // Восстанавливаем кнопку
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка при отправке формы', 'error');
                
                // Восстанавливаем кнопку
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
}

// Функции для страницы редактирования товара
function initEditProductForm() {
    // Переключение отображения поля для нового изображения
    const keepCurrentImageCheckbox = document.getElementById('keepCurrentImage');
    const newImageField = document.getElementById('newImageField');
    const productImageInput = document.querySelector('input[name="productImage"]');

    if (keepCurrentImageCheckbox && newImageField) {
        keepCurrentImageCheckbox.addEventListener('change', function() {
            if (this.checked) {
                newImageField.style.display = 'none';
                // Очищаем значение файла при скрытии поля
                if (productImageInput) {
                    productImageInput.value = '';
                    // Также скрываем превью
                    const preview = document.getElementById('newImagePreview');
                    if (preview) {
                        preview.style.display = 'none';
                    }
                }
            } else {
                newImageField.style.display = 'block';
                const preview = document.getElementById('newImagePreview');
                if (preview) {
                    preview.style.display = 'block';
                }
            }
        });
}

    // Предпросмотр нового изображения
    if (productImageInput) {
        productImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Показываем превью нового изображения
                    const existingPreview = document.getElementById('newImagePreview');
                    if (existingPreview) {
                        existingPreview.src = e.target.result;
                    } else {
                        const preview = document.createElement('img');
                        preview.id = 'newImagePreview';
                        preview.className = 'img-fluid rounded mt-2';
                        preview.style.maxHeight = '200px';
                        preview.src = e.target.result;
                        preview.alt = 'Новое изображение';
                        
                        // Добавляем превью после поля загрузки
                        productImageInput.parentNode.appendChild(preview);
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    // Добавление новой характеристики
    const addFeatureBtn = document.getElementById('addFeatureBtn');
    const featuresContainer = document.getElementById('featuresContainer');
    
    if (addFeatureBtn && featuresContainer) {
        addFeatureBtn.addEventListener('click', function() {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item mb-3 border rounded p-3 bg-light';
            featureItem.innerHTML = `
                <div class="row g-2">
                    <div class="col-md-5">
                        <input type="text" 
                            class="form-control" 
                            name="feature_keys[]" 
                            placeholder="Характеристика (например: Вес)">
                    </div>
                    <div class="col-md-5">
                        <input type="text" 
                            class="form-control" 
                            name="feature_values[]" 
                            placeholder="Значение (например: 5 кг)">
                    </div>
                    <div class="col-md-2">
                        <button type="button" 
                                class="btn btn-outline-danger w-100 remove-feature-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            featuresContainer.appendChild(featureItem);
            
            // Добавляем обработчик для кнопки удаления
            const removeBtn = featureItem.querySelector('.remove-feature-btn');
            removeBtn.addEventListener('click', function() {
                featureItem.remove();
            });
        });

        // Удаление характеристики (для существующих кнопок)
        document.querySelectorAll('.remove-feature-btn').forEach(button => {
            button.addEventListener('click', function() {
                // Проверяем, не последний ли это элемент
                if (featuresContainer.children.length > 1) {
                    this.closest('.feature-item').remove();
                } else {
                    // Если последний, просто очищаем поля
                    const inputs = this.closest('.feature-item').querySelectorAll('input');
                    inputs.forEach(input => input.value = '');
                }
            });
        });
    }

   // Отправка формы редактирования
    if (editProductForm) {
       editProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Создаем FormData и проверяем содержимое:
        const formData = new FormData(this);
        console.log('=== FormData содержимое ===');
        
        // Выводим все поля:
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        
        // Проверяем конкретно категории:
        const categories = formData.getAll('categories[]');
        console.log('Категории в FormData:', categories);
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Сохранение...';
            submitBtn.disabled = true;
            
            // УДАЛЯЕМ ПОЛЕ ФАЙЛА, если отмечен чекбокс сохранения текущего изображения
            const keepCurrentImageCheckbox = document.getElementById('keepCurrentImage');
            const productImageInput = document.querySelector('input[name="productImage"]');
            
            // Клонируем форму для безопасного удаления полей
            const formClone = new FormData(editProductForm);
            
            // Если отмечен чекбокс, удаляем поле файла
            if (keepCurrentImageCheckbox && keepCurrentImageCheckbox.checked && productImageInput) {
                // Удаляем файл из FormData
                formClone.delete('productImage');
                
                // Также удаляем превью если оно есть
                const preview = document.getElementById('newImagePreview');
                if (preview) {
                    preview.remove();
                }
            }
            
            console.log('=== FormData содержимое ===');
            for (let pair of formClone.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            fetch('/admin/update-product', {
                method: 'POST',
                body: formClone
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Товар успешно обновлен!', 'success');
                    setTimeout(() => {
                        window.location.href = '/admin/products';
                    }, 1500);
                } else {
                    showNotification(data.message || 'Ошибка при обновлении товара', 'danger');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Ошибка сети или сервера', 'danger');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Удаление товара
    const deleteProductBtn = document.getElementById('deleteProductBtn');
    
    if (deleteProductBtn) {
        deleteProductBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            if (confirm('Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.')) {
                fetch(`/admin/delete-product/${productId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setTimeout(() => {
                            window.location.href = '/admin/products';
                        }, 1500);
                    } else {
                        showNotification(data.message || 'Ошибка при удалении товара', 'danger');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Ошибка сети или сервера', 'danger');
                });
            }
        });
    }
}

// Функция для валидации форм (общая)
function validateForm(form) {
    let isValid = true;
    
    // Проверяем обязательные поля
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            // Добавляем сообщение об ошибке
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = 'Это поле обязательно для заполнения';
            field.parentNode.appendChild(errorDiv);
        } else {
            field.classList.remove('is-invalid');
            const existingError = field.parentNode.querySelector('.invalid-feedback');
            if (existingError) {
                existingError.remove();
            }
        }
    });
    
    return isValid;
}

// Очистка ошибок при вводе
document.addEventListener('input', function(e) {
    if (e.target.hasAttribute('required')) {
        e.target.classList.remove('is-invalid');
        const errorDiv = e.target.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
});
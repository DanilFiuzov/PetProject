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
    const button = event.target.closest('button');
    if (!button) return;
    
    const heartIcon = button.querySelector('i');
    const isFavorited = heartIcon.classList.contains('fas');
    const url = isFavorited ? '/favorites/remove' : '/favorites/add';

    // Временно отключаем кнопку для предотвращения двойного клика
    button.disabled = true;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productID: productID }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Обновляем иконку только если не было дублирования
            if (!data.alreadyFavorited) {
                heartIcon.classList.toggle('fas');
                heartIcon.classList.toggle('far');
                
                // Обновляем title
                button.title = isFavorited ? 'Добавить в избранное' : 'Убрать из избранного';
                
                // Обновляем цвет
                if (isFavorited) {
                    heartIcon.classList.remove('text-danger');
                } else {
                    heartIcon.classList.add('text-danger');
                }
                

            }
        } else {
            showNotification('Ошибка при обновлении избранного', 'error');
        }
        button.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Ошибка сети', 'error');
        button.disabled = false;
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
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Обновляем счетчик корзины если он есть на странице
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = data.cartCount;
            }
            // Убрано уведомление о добавлении в корзину
        } else {
            showNotification('Не удалось добавить товар в корзину', 'error');
        }
    })
    .catch(error => {
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
    initDiscountFields();
    const isHomePage = document.querySelector('.carousel-section') !== null;
    
    if (isHomePage) {
        initHomePage();
    }

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
    initDiscountFields();
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
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // ВАЖНО: Создаем FormData с корректной обработкой чекбокса
            const formData = new FormData(this);
            
            // Убедимся, что is_on_sale имеет правильное значение
            const saleCheckbox = document.getElementById('is_on_sale');
            if (saleCheckbox) {
                // Удаляем старое значение и добавляем новое
                formData.delete('is_on_sale');
                formData.append('is_on_sale', saleCheckbox.checked ? '1' : '0');
            }
            
            // ОТЛАДКА - выводим все поля
            console.log('=== Form Data ===');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Показываем индикатор загрузки
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Добавление...';
            submitBtn.disabled = true;
            
            fetch('/admin/add-product', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    setTimeout(() => {
                        window.location.href = `/product/${data.productID}`;
                    }, 2000);
                } else {
                    showNotification(data.message || 'Ошибка при добавлении товара', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                showNotification('Произошла ошибка при отправке формы', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
}

// Функции для страницы редактирования товара
function initEditProductForm() {
    // Переключение отображения поля для нового изображения
    initDiscountFields();
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
            
            // Создаем FormData с корректной обработкой чекбокса is_on_sale
            const formData = new FormData(this);
            
            // Убедимся, что is_on_sale имеет правильное значение
            const saleCheckbox = document.getElementById('is_on_sale');
            if (saleCheckbox) {
                // Удаляем старое значение и добавляем новое
                formData.delete('is_on_sale');
                formData.append('is_on_sale', saleCheckbox.checked ? '1' : '0');
            }
            
            // Обработка keepCurrentImage
            const keepCurrentImageCheckbox = document.getElementById('keepCurrentImage');
            if (keepCurrentImageCheckbox && keepCurrentImageCheckbox.checked) {
                // Удаляем файл если отмечено сохранение текущего изображения
                formData.delete('productImage');
            }
            
            console.log('=== Update Form Data ===');
            for (let [key, value] of formData.entries()) {
                if (key === 'productImage') {
                    console.log(`${key}: [File]`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Сохранение...';
            submitBtn.disabled = true;
            
            fetch('/admin/update-product', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Товар успешно обновлен!', 'success');
                    setTimeout(() => {
                        window.location.href = '/admin/products';
                    }, 1500);
                } else {
                    showNotification(data.message || 'Ошибка при обновлении товара', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                showNotification('Ошибка сети или сервера', 'error');
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
                    showNotification('Ошибка сети или сервера', 'danger');
                });
            }
        });
    }
}

//Функция для валидации форм
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
    
    // Проверяем скидку
    const saleCheckbox = form.querySelector('#is_on_sale');
    if (saleCheckbox && saleCheckbox.checked) {
        const discountPercentage = form.querySelector('input[name="discount_percentage"]');
        if (discountPercentage && (!discountPercentage.value || discountPercentage.value <= 0)) {
            isValid = false;
            discountPercentage.classList.add('is-invalid');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = 'Укажите процент скидки (от 1 до 99)';
            discountPercentage.parentNode.appendChild(errorDiv);
        }
    }
    
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

// Инициализация главной страницы
function initHomePage() {
    // Автоматическое переключение карусели
    const carousel = document.getElementById('mainCarousel');
    if (carousel) {
        const carouselInstance = new bootstrap.Carousel(carousel, {
            interval: 4000,
            ride: 'carousel',
            wrap: true
        });
        
        // Добавляем индикатор текущего слайда
        carousel.addEventListener('slide.bs.carousel', function(event) {
            const slides = carousel.querySelectorAll('.carousel-item');
            const captions = carousel.querySelectorAll('.carousel-caption');
            
            // Анимация для заголовков
            captions.forEach(caption => {
                caption.style.animation = 'slideInRight 0.5s ease-out';
            });
            
            // Обновляем активные индикаторы
            const indicators = carousel.querySelectorAll('.carousel-indicators button');
            indicators.forEach((indicator, index) => {
                if (index === event.to) {
                    indicator.classList.add('active');
                    indicator.setAttribute('aria-current', 'true');
                } else {
                    indicator.classList.remove('active');
                    indicator.removeAttribute('aria-current');
                }
            });
        });
    }
    
    // Добавляем эффекты при наведении на карточки
    const cards = document.querySelectorAll('.category-card, .product-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = this.classList.contains('category-card') 
                ? 'translateY(-10px)' 
                : 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(96, 96, 255, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Анимация при загрузке страницы
    setTimeout(() => {
        const sections = document.querySelectorAll('.categories-section, .popular-section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 100);
}

// Управление полями скидки
document.addEventListener('DOMContentLoaded', function() {
    const saleCheckbox = document.getElementById('is_on_sale');
    const discountFields = document.getElementById('discountFields');
    
    if (saleCheckbox && discountFields) {
        // Показ/скрытие полей скидки
        saleCheckbox.addEventListener('change', function() {
            if (this.checked) {
                discountFields.style.display = 'block';
                
                // Установка дат по умолчанию
                const now = new Date();
                const startDate = document.getElementById('discount_start_date');
                const endDate = document.getElementById('discount_end_date');
                
                if (startDate && !startDate.value) {
                    startDate.value = now.toISOString().slice(0, 16);
                }
                
                if (endDate && !endDate.value) {
                    const weekLater = new Date(now);
                    weekLater.setDate(weekLater.getDate() + 7);
                    endDate.value = weekLater.toISOString().slice(0, 16);
                }
                } else {
                        discountFields.style.display = 'none';
                        
                        const discountPercentage = document.querySelector('input[name="discount_percentage"]');
                        const startDate = document.getElementById('discount_start_date');
                        const endDate = document.getElementById('discount_end_date');
                        
                        if (discountPercentage) discountPercentage.value = '';
                        if (startDate) startDate.value = '';
                        if (endDate) endDate.value = '';
                    }
        });
        
        // Валидация дат скидки
        const startDateInput = document.getElementById('discount_start_date');
        const endDateInput = document.getElementById('discount_end_date');
        
        if (startDateInput && endDateInput) {
            endDateInput.addEventListener('change', function() {
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(this.value);
                
                if (endDate < startDate) {
                    alert('Дата окончания не может быть раньше даты начала!');
                    this.value = '';
                }
            });
        }
    }
});

// Функция для форматирования даты
function formatDiscountDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Функция для отображения таймера скидки
function updateDiscountTimer(productId, endDate) {
    if (!endDate) return;
    
    const timerElement = document.getElementById(`timer-${productId}`);
    if (!timerElement) return;
    
    const end = new Date(endDate);
    const now = new Date();
    
    if (end <= now) {
        timerElement.innerHTML = '<small class="text-muted">Скидка закончилась</small>';
        return;
    }
    
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        timerElement.innerHTML = `<small class="text-danger">Осталось ${days}д ${hours}ч</small>`;
    } else if (hours > 0) {
        timerElement.innerHTML = `<small class="text-danger">Осталось ${hours}ч ${minutes}м</small>`;
    } else {
        timerElement.innerHTML = `<small class="text-danger">Осталось ${minutes}м</small>`;
    }
}

// Обновляем все таймеры на странице
function updateAllDiscountTimers() {
    const timerElements = document.querySelectorAll('[id^="timer-"]');
    timerElements.forEach(element => {
        const productId = element.id.replace('timer-', '');
        const endDate = element.getAttribute('data-end-date');
        if (endDate) {
            updateDiscountTimer(productId, endDate);
        }
    });
}

function initDiscountFields() {
    const saleCheckbox = document.getElementById('is_on_sale');
    const discountFields = document.getElementById('discountFields');
    
    if (saleCheckbox && discountFields) {
        // Проверяем состояние чекбокса при загрузке
        if (saleCheckbox.checked) {
            discountFields.style.display = 'block';
        } else {
            discountFields.style.display = 'none';
        }
        
        // Показ/скрытие полей скидки
        saleCheckbox.addEventListener('change', function() {
            if (this.checked) {
                discountFields.style.display = 'block';
                
                // Установка дат по умолчанию
                const now = new Date();
                const startDate = document.getElementById('discount_start_date');
                const endDate = document.getElementById('discount_end_date');
                
                if (startDate && !startDate.value) {
                    // Форматируем дату для input[type="datetime-local"]
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    
                    startDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
                
                if (endDate && !endDate.value) {
                    const weekLater = new Date(now);
                    weekLater.setDate(weekLater.getDate() + 7);
                    
                    const year = weekLater.getFullYear();
                    const month = String(weekLater.getMonth() + 1).padStart(2, '0');
                    const day = String(weekLater.getDate()).padStart(2, '0');
                    const hours = String(weekLater.getHours()).padStart(2, '0');
                    const minutes = String(weekLater.getMinutes()).padStart(2, '0');
                    
                    endDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
            } else {
                discountFields.style.display = 'none';
            }
        });
        
        // Валидация дат скидки
        const startDateInput = document.getElementById('discount_start_date');
        const endDateInput = document.getElementById('discount_end_date');
        
        if (startDateInput && endDateInput) {
            endDateInput.addEventListener('change', function() {
                if (startDateInput.value && this.value) {
                    const startDate = new Date(startDateInput.value);
                    const endDate = new Date(this.value);
                    
                    if (endDate < startDate) {
                        alert('Дата окончания не может быть раньше даты начала!');
                        this.value = '';
                    }
                }
            });
        }
    }
}

// Функция для обновления фильтров
function updateFilters() {
    const form = document.getElementById('searchForm');
    if (!form) return;
    
    const search = form.querySelector('[name="search"]')?.value || '';
    const category = document.querySelector('[name="category"]')?.value || '';
    const minPrice = document.querySelector('[name="minPrice"]')?.value || '';
    const maxPrice = document.querySelector('[name="maxPrice"]')?.value || '';
    const onSale = document.getElementById('onSale')?.checked ? 'true' : '';
    const sort = document.querySelector('[name="sort"]')?.value || 'newest';
    
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (onSale) params.set('onSale', onSale);
    if (sort && sort !== 'newest') params.set('sort', sort);
    
    // Сбрасываем страницу на первую при изменении фильтров
    params.set('page', '1');
    
    window.location.href = `/products?${params.toString()}`;
}

// Функция для сброса фильтров
function resetFilters() {
    window.location.href = '/products';
}

// Валидация полей цены
function validatePriceInput(input) {
    if (input.value < 0) {
        input.value = 0;
    }
    
    const minPriceInput = document.querySelector('[name="minPrice"]');
    const maxPriceInput = document.querySelector('[name="maxPrice"]');
    
    if (minPriceInput && maxPriceInput && minPriceInput.value && maxPriceInput.value) {
        if (parseFloat(minPriceInput.value) > parseFloat(maxPriceInput.value)) {
            alert('Минимальная цена не может быть больше максимальной');
            input.value = '';
        }
    }
}

// Инициализация фильтров при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для полей фильтров
    const priceInputs = document.querySelectorAll('[name="minPrice"], [name="maxPrice"]');
    priceInputs.forEach(input => {
        input.addEventListener('change', function() {
            validatePriceInput(this);
            // Не обновляем сразу при изменении цены, ждем подтверждения
        });
        
        input.addEventListener('blur', function() {
            if (this.value) {
                setTimeout(() => updateFilters(), 500); // Небольшая задержка
            }
        });
    });
    
    // Добавляем обработчик для Enter в поле поиска
    const searchInput = document.querySelector('[name="search"]');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                updateFilters();
            }
        });
    }
    
    // Добавляем обработчик для чекбокса акционных товаров
    const onSaleCheckbox = document.getElementById('onSale');
    if (onSaleCheckbox) {
        onSaleCheckbox.addEventListener('change', function() {
            setTimeout(() => updateFilters(), 100); // Небольшая задержка
        });
    }
    
    // Добавляем обработчик для выпадающих списков
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            updateFilters();
        });
    });
    
    // Инициализируем тултипы для фильтров
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Обновляем таймеры каждую минуту
setInterval(updateAllDiscountTimers, 60000);
// ========================================
// ОБЩИЕ ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ
// ========================================

// Кнопка "Наверх"
(function() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ========================================
// ФУНКЦИИ ДЛЯ СТРАНИЦЫ КАТАЛОГА ТОВАРОВ
// ========================================

// Обновление фильтра категорий
function updateCategoryFilter() {
    const checkboxes = document.querySelectorAll('#categoriesList .form-check-input:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    const hiddenInput = document.getElementById('categoriesHidden');
    hiddenInput.value = selectedIds.join(',');
    updateCategoriesCount(selectedIds.length);
}

// Очистка выбранных категорий
function clearCategories() {
    const checkboxes = document.querySelectorAll('#categoriesList .form-check-input');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    const hiddenInput = document.getElementById('categoriesHidden');
    hiddenInput.value = '';
    updateCategoriesCount(0);
}

// Обновление счётчика категорий
function updateCategoriesCount(count) {
    const countEl = document.querySelector('#selectedCategoriesCount .fw-bold');
    if (countEl) {
        countEl.textContent = count;
    }
}

// Сворачивание/разворачивание категорий
function toggleCategories() {
    const container = document.getElementById('categoriesFilterContainer');
    const icon = document.getElementById('categoriesToggleIcon');
    const btn = document.getElementById('toggleCategoriesBtn');

    if (container && icon && btn) {
        container.classList.toggle('d-none');
        if (container.classList.contains('d-none')) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            btn.setAttribute('aria-expanded', 'false');
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            btn.setAttribute('aria-expanded', 'true');
        }
    }
}

// Функции для мобильного меню
function toggleFilters() {
    document.querySelector('.filters-sidebar').classList.toggle('active');
    document.querySelector('.mobile-overlay').classList.toggle('active');
}

function closeFilters() {
    document.querySelector('.filters-sidebar').classList.remove('active');
    document.querySelector('.mobile-overlay').classList.remove('active');
}

// ========================================
// ФУНКЦИИ ПОИСКА И ПОДСКАЗОК
// ========================================

function initSearchForm() {
    const centralSearchInput = document.getElementById('centralSearchInput');
    const suggestionsContainer = document.getElementById('centralSearchSuggestions');

    if (!centralSearchInput || !suggestionsContainer) {
        console.warn('Search elements not found');
        return;
    }

    let debounceTimer;
    let isMouseOverSuggestions = false;

    centralSearchInput.addEventListener('focus', function(e) {
        const query = this.value.trim();
        if (query.length === 0) {
            fetchPopularSuggestions();
        } else if (query.length >= 2) {
            fetchSuggestions(query);
        }
    });

    centralSearchInput.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        const query = this.value.trim();

        if (query.length < 2) {
            if (query.length === 0) {
                fetchPopularSuggestions();
            } else {
                hideSuggestions();
            }
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });

    centralSearchInput.addEventListener('blur', function() {
        setTimeout(() => {
            if (!isMouseOverSuggestions) {
                hideSuggestions();
            }
        }, 200);
    });

    suggestionsContainer.addEventListener('click', function(e) {
        const item = e.target.closest('.search-suggestion-item');
        if (item) {
            const productId = item.dataset.productId;
            window.location.href = `/product/${productId}`;
        }
    });

    suggestionsContainer.addEventListener('mouseenter', () => {
        isMouseOverSuggestions = true;
    });
    suggestionsContainer.addEventListener('mouseleave', () => {
        isMouseOverSuggestions = false;
        setTimeout(() => {
            if (document.activeElement !== centralSearchInput) {
                hideSuggestions();
            }
        }, 200);
    });

    centralSearchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = document.getElementById('centralSearchForm');
            if (form) {
                form.submit();
            }
        }
        if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
}

function hideSuggestions() {
    const suggestionsContainer = document.getElementById('centralSearchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('show');
    }
}

function displaySuggestions(suggestions) {
    const container = document.getElementById('centralSearchSuggestions');
    if (!container) return;

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        container.innerHTML = `<div class="search-suggestions-empty">
            <i class="fas fa-search"></i>
            <p>Ничего не найдено</p>
        </div>`;
        container.classList.add('show');
        return;
    }

    let html = '';
    suggestions.forEach(item => {
        const discountBadge = item.isDiscounted ? 
            `<div class="search-suggestion-discount-badge"><i class="fas fa-tag"></i>-${item.discountPercentage}%</div>` : '';
        
        const ratingHtml = (item.rating !== undefined && item.rating !== null) ? 
            `<div class="rating-stars">
                <i class="fas fa-star"></i>
                <span class="rating-value">${Number(item.rating).toFixed(1)}</span>
            </div>` : '';

        html += `
        <div class="search-suggestion-item" data-product-id="${item.id}">
            <div class="suggestion-thumb">
                <img src="/images/products/${item.thumbnail}" alt="${item.title}">
                ${discountBadge}
            </div>
            <div class="search-suggestion-info">
                <div class="search-suggestion-title">${item.title}</div>
                <div class="search-suggestion-meta">
                    ${ratingHtml}
                </div>
                <div class="search-suggestion-footer">
                    <div class="search-suggestion-price-container">
                        <span class="search-suggestion-price">${item.price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}₽</span>
                        ${item.isDiscounted ? `<span class="search-suggestion-original-price">${item.originalPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}₽</span>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
    container.classList.add('show');
}

function fetchSuggestions(query) {
    fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(suggestions => {
            displaySuggestions(suggestions);
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
            hideSuggestions();
        });
}

function fetchPopularSuggestions() {
    fetch('/api/search-suggestions?popular=true')
        .then(response => response.json())
        .then(suggestions => {
            displaySuggestions(suggestions);
        })
        .catch(error => {
            console.error('Error fetching popular suggestions:', error);
            hideSuggestions();
        });
}

// ========================================
// ФУНКЦИИ ДЛЯ ИЗБРАННОГО И КОРЗИНЫ
// ========================================

// Функция для избранного (обновлена – редирект при 401)
function toggleFavorite(event, productID) {
    const button = event.target.closest('button');
    if (!button) return;
    
    const heartIcon = button.querySelector('i');
    const isFavorited = heartIcon.classList.contains('fas');
    const url = isFavorited ? '/favorites/remove' : '/favorites/add';

    button.disabled = true;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productID: productID }),
    })
    .then(response => {
        if (response.status === 401) {
            window.location.href = '/login';
            return Promise.reject('Not authorized');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            heartIcon.classList.toggle('fas');
            heartIcon.classList.toggle('far');
            
            if (isFavorited) {
                heartIcon.classList.remove('text-danger');
                button.title = 'Добавить в избранное';
            } else {
                heartIcon.classList.add('text-danger');
                button.title = 'Убрать из избранного';
            }
        } else {
            showNotification('Ошибка при обновлении избранного', 'error');
        }
        button.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        if (error !== 'Not authorized') {
            showNotification('Ошибка сети', 'error');
        }
        button.disabled = false;
    });
}

// Функция добавления в корзину (обновлена – проверка ответа 401)
function addToCart(productID) {
    fetch('/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productID: productID })
    })
    .then(response => {
        if (response.status === 401) {
            window.location.href = '/login';
            return Promise.reject('Not authorized');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const cartBadge = document.querySelector('.nav-badge');
            if (cartBadge) {
                cartBadge.textContent = data.cartCount || 0;
            }
            showNotification('Товар добавлен в корзину', 'success');
        } else {
            showNotification(data.message || 'Не удалось добавить товар в корзину', 'error');
        }
    })
    .catch(error => {
        console.error('Cart error:', error);
        if (error !== 'Not authorized') {
            showNotification('Произошла ошибка при добавлении товара в корзину', 'error');
        }
    });
}

// ========================================
// УНИВЕРСАЛЬНЫЕ ФУНКЦИИ
// ========================================

function showNotification(message, type = 'info') {
    document.querySelectorAll('.alert-notification').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    const alertType = type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger';
    
    notification.className = `alert alert-${alertType} alert-dismissible fade show alert-notification`;
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 9999;
        min-width: 280px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center" style='margin-right: 20px;'>
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'} me-2"></i>
            <div >${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(notification);
        bsAlert.close();
    }, 3000);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1100; min-width: 250px;';

    toast.innerHTML = `
    <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    `;

    document.body.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всплывающих подсказок (Tooltips)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Инициализация модальных окон
    const modalTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="modal"]'));
    modalTriggerList.map(function (modalTriggerEl) {
        return new bootstrap.Modal(modalTriggerEl);
    });
    
    // Делегирование для кнопок избранного (только если нет встроенного onclick)
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;
        
        // Пропускаем, если уже есть встроенный обработчик toggleFavorite
        if (button.hasAttribute('onclick') && button.getAttribute('onclick').includes('toggleFavorite')) {
            return;
        }
        
        if (button.getAttribute('onclick') && button.getAttribute('onclick').includes('toggleFavorite')) {
            e.preventDefault();
            const productID = button.getAttribute('data-product-id') || 
                             button.onclick.toString().match(/toggleFavorite\(event,\s*(\d+)\)/)?.[1];
            if (productID) {
                toggleFavorite(e, productID);
            }
        }
    });
    
    // Делегирование для кнопок корзины (только если нет встроенного onclick)
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;
        
        // Пропускаем, если уже есть встроенный обработчик addToCart
        if (button.hasAttribute('onclick') && button.getAttribute('onclick').includes('addToCart')) {
            return;
        }
        
        if (button.getAttribute('onclick') && button.getAttribute('onclick').includes('addToCart')) {
            e.preventDefault();
            const productID = button.getAttribute('data-product-id') || 
                             button.onclick.toString().match(/addToCart\(['"](\d+)['"]\)/)?.[1];
            if (productID) {
                addToCart(productID);
            }
        }
    });
});
// ========================================
// ОБЩИЕ ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ
// ========================================

// ========================================
// ФУНКЦИИ ДЛЯ СТРАНИЦЫ КАТАЛОГА ТОВАРОВ
// ========================================

// Глобальные переменные для слайдера (будут инициализированы на странице каталога)
let minPriceValue;
let maxPriceValue;
let sliderMin;
let sliderMax;
let step = 100;

// Инициализация слайдера цен
function initPriceSlider() {
    const sliderContainer = document.querySelector('.price-range-container');
    if (!sliderContainer) return;

    // Создаём слайдер
    const sliderHTML = `
    <div class="price-range-values">
        <span id="minValueDisplay">${minPriceValue.toLocaleString()}₽</span>
        <span id="maxValueDisplay">${maxPriceValue.toLocaleString()}₽</span>
    </div>
    <div class="price-slider" id="priceSlider">
        <div class="slider-thumb min" id="minThumb">
            <span class="range-slider-value" id="minValueLabel"></span>
        </div>
        <div class="slider-thumb max" id="maxThumb">
            <span class="range-slider-value" id="maxValueLabel"></span>
        </div>
    </div>
    <div class="price-inputs">
        <div class="price-input-wrapper">
            <span class="price-input-badge">От</span>
            <input type="number" class="price-input" id="minPriceInput" value="${minPriceValue}" min="${sliderMin}" max="${sliderMax}" step="${step}">
        </div>
        <div class="price-input-wrapper">
            <span class="price-input-badge">До</span>
            <input type="number" class="price-input" id="maxPriceInput" value="${maxPriceValue}" min="${sliderMin}" max="${sliderMax}" step="${step}">
        </div>
    </div>
    <input type="hidden" id="minPriceHidden" value="${minPriceValue}">
    <input type="hidden" id="maxPriceHidden" value="${maxPriceValue}">
    `;

    // Заменяем старый блок цен на новый слайдер
    const priceSection = document.querySelector('.price-range-container');
    if (priceSection) {
        priceSection.innerHTML = sliderHTML;
    }

    // Обновляем стили слайдера
    updateSliderStyle();

    // Добавляем обработчики событий
    const minThumb = document.getElementById('minThumb');
    const maxThumb = document.getElementById('maxThumb');
    const minInput = document.getElementById('minPriceInput');
    const maxInput = document.getElementById('maxPriceInput');

    // Обработчик для минимума
    minThumb.addEventListener('mousedown', (e) => startDrag(e, 'min'));
    minThumb.addEventListener('touchstart', (e) => startDrag(e, 'min'));

    // Обработчик для максимума
    maxThumb.addEventListener('mousedown', (e) => startDrag(e, 'max'));
    maxThumb.addEventListener('touchstart', (e) => startDrag(e, 'max'));

    // Обработчик для минимума
    minInput.addEventListener('input', (e) => {
        let value = Math.floor(parseInt(e.target.value) / step) * step;
        value = Math.max(sliderMin, Math.min(value, maxPriceValue - step));
        minPriceValue = value;
        e.target.value = value;
        document.getElementById('minPriceHidden').value = value;
        updateSliderStyle();
    });

    // Обработчик для максимума
    maxInput.addEventListener('input', (e) => {
        let value = Math.ceil(parseInt(e.target.value) / step) * step;
        value = Math.min(sliderMax, Math.max(value, minPriceValue + step));
        maxPriceValue = value;
        e.target.value = value;
        document.getElementById('maxPriceHidden').value = value;
        updateSliderStyle();
    });

    // Обработчик фокуса для инпутов
    minInput.addEventListener('focus', () => {
        document.querySelector('.price-input-wrapper:nth-child(1)').classList.add('active');
    });
    minInput.addEventListener('blur', () => {
        document.querySelector('.price-input-wrapper:nth-child(1)').classList.remove('active');
    });
    maxInput.addEventListener('focus', () => {
        document.querySelector('.price-input-wrapper:nth-child(2)').classList.add('active');
    });
    maxInput.addEventListener('blur', () => {
        document.querySelector('.price-input-wrapper:nth-child(2)').classList.remove('active');
    });
}

// Обновление стиля слайдера
function updateSliderStyle() {
    const minPercentage = ((minPriceValue - sliderMin) / (sliderMax - sliderMin)) * 100;
    const maxPercentage = ((maxPriceValue - sliderMin) / (sliderMax - sliderMin)) * 100;
    const slider = document.getElementById('priceSlider');
    if (slider) {
        slider.style.transition = 'background 0.1s ease';
        slider.style.setProperty('--min-percentage', minPercentage + '%');
        slider.style.setProperty('--max-percentage', maxPercentage + '%');
    }

    const minThumb = document.getElementById('minThumb');
    const maxThumb = document.getElementById('maxThumb');
    if (minThumb && maxThumb) {
        minThumb.style.transition = 'none';
        maxThumb.style.transition = 'none';
        minThumb.style.left = minPercentage + '%';
        maxThumb.style.right = (100 - maxPercentage) + '%';
    }
}

// Функция для перетаскивания ползунков
function startDrag(e, type) {
    e.preventDefault();

    const isTouch = e.type === 'touchstart';
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startValue = type === 'min' ? minPriceValue : maxPriceValue;
    const thumb = e.target.closest('.slider-thumb');

    if (thumb) {
        thumb.classList.add('active');
    }

    const slider = document.getElementById('priceSlider');
    if (slider) {
        slider.style.transition = 'none';
    }

    function handleMove(e) {
        e.preventDefault();

        const currentX = isTouch ? e.touches[0].clientX : e.clientX;
        const deltaX = currentX - startX;
        const sliderWidth = document.getElementById('priceSlider').offsetWidth;
        const pixelsPerStep = (sliderWidth / (sliderMax - sliderMin)) * step;

        let newValue = startValue + Math.round(deltaX / pixelsPerStep) * step;

        if (type === 'min') {
            newValue = Math.max(sliderMin, Math.min(newValue, maxPriceValue - step));
            minPriceValue = newValue;
            document.getElementById('minPriceInput').value = newValue;
            document.getElementById('minPriceHidden').value = newValue;
        } else {
            newValue = Math.min(sliderMax, Math.max(newValue, minPriceValue + step));
            maxPriceValue = newValue;
            document.getElementById('maxPriceInput').value = newValue;
            document.getElementById('maxPriceHidden').value = newValue;
        }

        updateSliderStyle();
    }

    function handleEnd() {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove, { passive: false });
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);

        if (thumb) {
            thumb.classList.remove('active');
        }

        const slider = document.getElementById('priceSlider');
        if (slider) {
            slider.style.transition = 'background 0.1s ease';
        }
    }

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
}

// Инициализация фильтров категорий
function initCategoryFilters() {
    const checkboxes = document.querySelectorAll('#categoriesList .form-check-input:checked');
    updateCategoriesCount(checkboxes.length);

    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('form-check-input') ||
                e.target.classList.contains('form-check-label')) {
                return;
            }
            const checkbox = this.querySelector('.form-check-input');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                const event = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(event);
            }
        });
    });
}

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

// Функция для применения фильтров
function applyFilters() {
    const search = document.querySelector('#centralSearchInput')?.value || '';
    const category = document.getElementById('categoriesHidden').value;
    const minPrice = document.getElementById('minPriceHidden').value;
    const maxPrice = document.getElementById('maxPriceHidden').value;
    const onSale = document.getElementById('onSale').checked ? 'true' : '';
    const inStock = document.getElementById('inStock').checked ? 'true' : '';
    const sort = document.getElementById('sortHidden').value;

    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice !== sliderMin.toString()) params.set('minPrice', minPrice);
    if (maxPrice !== sliderMax.toString()) params.set('maxPrice', maxPrice);
    if (onSale) params.set('onSale', onSale);
    if (inStock) params.set('inStock', inStock);
    if (sort) params.set('sort', sort);

    window.location.href = `/products?${params.toString()}`;
}

// ========================================
// ФУНКЦИИ ПОИСКА И ПОДСКАЗОК
// ========================================

// Инициализация формы поиска
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

// Отображение подсказок
function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('centralSearchSuggestions');
    if (!suggestionsContainer) return;

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        suggestionsContainer.innerHTML = `
        <div class="search-suggestions-empty">
            <i class="fas fa-search"></i>
            <p>Ничего не найдено</p>
        </div>
        `;
        suggestionsContainer.classList.add('show');
        return;
    }

    let html = '';
    suggestions.forEach(suggestion => {
        const discountBadge = suggestion.isDiscounted ? `
        <div class="search-suggestion-discount-badge">
            <i class="fas fa-tag"></i>-${suggestion.discountPercentage}%
        </div>
        ` : '';

        html += `
        <div class="search-suggestion-item" data-product-id="${suggestion.id}">
            <div style="position: relative;">
                <img src="/images/products/${suggestion.thumbnail}" alt="${suggestion.title}">
                ${discountBadge}
            </div>
            <div class="search-suggestion-info">
                <div class="search-suggestion-title">${suggestion.title}</div>
                <div class="search-suggestion-price-container">
                    <span class="search-suggestion-price">${suggestion.price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}₽</span>
                    ${suggestion.isDiscounted ? `
                    <span class="search-suggestion-original-price">${suggestion.originalPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}₽</span>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    });

    suggestionsContainer.innerHTML = html;
    suggestionsContainer.classList.add('show');
}

// Скрытие подсказок
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('centralSearchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('show');
    }
}

// Получение подсказок
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

// Получение популярных подсказок
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

// Функция для избранного
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
    .then(response => response.json())
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
        showNotification('Ошибка сети', 'error');
        button.disabled = false;
    });
}

// Функция добавления в корзину
function addToCart(productID) {
    const productElement = document.querySelector(`[data-product-id="${productID}"]`);
    if (productElement) {
        const stockQuantity = parseInt(productElement.dataset.stockQuantity || 0);
        if (stockQuantity <= 0) {
            showNotification('Товара нет в наличии', 'error');
            return;
        }
    }

    fetch('/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productID: productID })
    })
    .then(response => response.json())
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
        showNotification('Произошла ошибка при добавлении товара в корзину', 'error');
    });
}

// ========================================
// УНИВЕРСАЛЬНЫЕ ФУНКЦИИ
// ========================================

// Универсальное всплывающее уведомление
function showNotification(message, type = 'info') {
    document.querySelectorAll('.alert-notification').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    const alertType = type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger';
    
    notification.className = `alert alert-${alertType} alert-dismissible fade show alert-notification`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 280px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'} me-2"></i>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(notification);
        bsAlert.close();
    }, 3000);
}

// Функция показа тоста
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
    
    // Добавляем обработчики для кнопок избранного (делегирование событий)
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="toggleFavorite"]')) {
            e.preventDefault();
            const button = e.target.closest('button');
            if (button) {
                const productID = button.getAttribute('data-product-id') || 
                                 button.onclick.toString().match(/toggleFavorite\(event,\s*(\d+)\)/)?.[1];
                if (productID) {
                    toggleFavorite(e, productID);
                }
            }
        }
    });
    
    // Добавляем обработчики для кнопок корзины (делегирование событий)
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="addToCart"]')) {
            e.preventDefault();
            const button = e.target.closest('button');
            if (button) {
                const productID = button.getAttribute('data-product-id') || 
                                 button.onclick.toString().match(/addToCart\(['"](\d+)['"]\)/)?.[1];
                if (productID) {
                    addToCart(productID);
                }
            }
        }
    });
});
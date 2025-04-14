(function () {
    const quantityContainer = document.querySelector(".quantity");
    const minusBtn = quantityContainer.querySelector(".minus");
    const plusBtn = quantityContainer.querySelector(".plus");
    const inputBox = quantityContainer.querySelector(".input-box");
  
    updateButtonStates();
  
    quantityContainer.addEventListener("click", handleButtonClick);
    inputBox.addEventListener("input", handleQuantityChange);
  
    function updateButtonStates() {
      const value = parseInt(inputBox.value);
      minusBtn.disabled = value <= 1;
      plusBtn.disabled = value >= parseInt(inputBox.max);
    }
  
    function handleButtonClick(event) {
      if (event.target.classList.contains("minus")) {
        decreaseValue();
      } else if (event.target.classList.contains("plus")) {
        increaseValue();
      }
    }
  
    function decreaseValue() {
      let value = parseInt(inputBox.value);
      value = isNaN(value) ? 1 : Math.max(value - 1, 1);
      inputBox.value = value;
      updateButtonStates();
      handleQuantityChange();
    }
  
    function increaseValue() {
      let value = parseInt(inputBox.value);
      value = isNaN(value) ? 1 : Math.min(value + 1, parseInt(inputBox.max));
      inputBox.value = value;
      updateButtonStates();
      handleQuantityChange();
    }
  
    function handleQuantityChange() {
      let value = parseInt(inputBox.value);
      value = isNaN(value) ? 1 : value;
    }
  })();

  document.querySelectorAll('.addToCart_product').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.getAttribute('data-name');
        const productPrice = parseFloat(this.getAttribute('data-price'));
        const productCat = this.getAttribute('data-cat');
        const quantity = document.getElementById('quantity_product').value
        console.log(quantity)

        // Если товар уже в корзине, увеличиваем его количество
        if (cart[productName]) {
            cart[productName].quantity += parseInt(quantity);
        } else {
            // Иначе добавляем новый товар в корзину
            cart[productName] = {
                price: productPrice,
                category: productCat,
                quantity: parseInt(quantity),
            };
        }

        // Сохраняем корзину в sessionStorage и обновляем интерфейс
        saveCart();
        renderCart();
    });
});
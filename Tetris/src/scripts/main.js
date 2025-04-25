let board = document.querySelector('.board-section');

// Генерируем 200 клеточек
for (let i = 0; i < 200; i++) {
    let block = document.createElement('div');
    block.classList.add('block');
    board.appendChild(block);
}

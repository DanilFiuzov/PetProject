let field = document.getElementsByClassName('block');

// Функция для создания новой сетки игрового поля
newGrid = (width, height) => {
    let grid = new Array(height);
    for (let i = 0; i < height; i++) {
        grid[i] = new Array(width);
    }

    // ячейки сетки
    let index = 0;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            grid[i][j] = {
                index: index++,
                value: 0
            };
        }
    }

    // Возвращение объекта, представляющего игровую сетку
    return {
        board: grid,
        width: width,
        height: height
    };
};

resetGrid = (grid) => {
    for (let i = 0; i < grid.height; i++) { 
        for (let j = 0; j < grid.width; j++) { 
            grid.board[i][j].value = 0;
        }
    }

    Array.from(field).forEach(e => {
        e.style.background = TRANSPARENT;
    })
};

// Функция для создания нового блока
newTetromino = (blocks, colors, start_x, start_y) => {
    let index = Math.floor(Math.random() * blocks.length);

    return {
        block: JSON.parse(JSON.stringify(blocks[index])),
        color: colors[index],
        x: start_x,
        y: start_y
    };
};

// Функция для отрисовки блока на поле
drawTetromino = (tetromino, grid) => {
    tetromino.block.forEach((row, i) => {
        row.forEach((value, j) => {
            let x = tetromino.x + i;
            let y = tetromino.y + j;
            if (value > 0) {
                field[grid.board[x][y].index].style.background = tetromino.color;
            }
        })
    })
};

// Функция для очистки блока
clearTetromino = (tetromino, grid) => {
    tetromino.block.forEach((row, i) => {
        row.forEach((value, j) => {
            let x = tetromino.x + i;
            let y = tetromino.y + j;
            if (value > 0) {
                field[grid.board[x][y].index].style.background = TRANSPARENT;
            }
        })
    })
};

// Функция для проверки, находится ли точка в пределах сетки
isInGrid = (x, y, grid) => {
    return x < grid.height && x >=0 && y >= 0 && y < grid.width;
};

isFilled = (x, y, grid) => {
    if (!isInGrid(x, y, grid)) {
        return false;
    } else {
        return grid.board[x][y].value !== 0;
    }
};

// Функция для проверки, может ли блок переместиться в заданном направлении
movable = (tetromino, grid, direction) => {
    let newX = tetromino.x;
    let newY = tetromino.y;

    // Вычисление новых координат в зависимости от направления
    switch(direction) {
        case DIRECTION.DOWN:
            newX = tetromino.x + 1;
            break;
        case DIRECTION.LEFT:
            newY = tetromino.y - 1;
            break;
        case DIRECTION.RIGHT:
            newY = tetromino.y + 1;
            break;
    }

    // Проверка, все ли клетки блока могут переместиться в новые координаты
    return tetromino.block.every((row, i) => {
        return row.every((value, j) => {
            let x = newX + i;
            let y = newY + j;
            return value === 0 || (isInGrid(x, y, grid) && !isFilled(x, y, grid));
        });
    });
};

// Функция для перемещения блока вниз
moveDown = (tetromino, grid) => {
    if (!movable(tetromino, grid, DIRECTION.DOWN)) return;
    clearTetromino(tetromino, grid);
    tetromino.x++;
    drawTetromino(tetromino, grid);
};

// Функция для перемещения блока влево
moveLeft = (tetromino, grid) => {
    if (!movable(tetromino, grid, DIRECTION.LEFT)) return;
    clearTetromino(tetromino, grid);
    tetromino.y--;
    drawTetromino(tetromino, grid);
};

// Функция для перемещения блока вправо
moveRight = (tetromino, grid) => {
    if (!movable(tetromino, grid, DIRECTION.RIGHT)) return;
    clearTetromino(tetromino, grid);
    tetromino.y++;
    drawTetromino(tetromino, grid);
};

// Функция для проверки возможности вращения блока
rotatable = (tetromino, grid) => {
    let cloneBlock = JSON.parse(JSON.stringify(tetromino.block));

    // Поворот клонированного блока
    for (let y = 0; y < cloneBlock.length; y++) {
        for (let x = 0; x < y; ++x) {
            [cloneBlock[x][y], cloneBlock[y][x]] = [cloneBlock[y][x], cloneBlock[x][y]];
        }
    }
    cloneBlock.forEach(row => row.reverse());

    return cloneBlock.every((row, i) => {
        return row.every((value, j) => {
            let x = tetromino.x + i;
            let y = tetromino.y + j;
            return value === 0 || (isInGrid(x, y, grid) && !isFilled(x, y, grid));
        });
    });
};

// Функция для вращения блока
rotate = (tetromino, grid) => {
    if (!rotatable(tetromino, grid)) return;
    clearTetromino(tetromino, grid);
    for (let y = 0; y < tetromino.block.length; y++) {
        for (let x = 0; x < y; ++x) {
            [tetromino.block[x][y], tetromino.block[y][x]] = [tetromino.block[y][x], tetromino.block[x][y]];
        }
    }
    tetromino.block.forEach(row => row.reverse());
    drawTetromino(tetromino, grid);
};

// Функция для мгновенного падения блока
hardDrop = (tetromino, grid) => {
    clearTetromino(tetromino, grid);
    while (movable(tetromino, grid, DIRECTION.DOWN)) {
        tetromino.x++;
    }

    drawTetromino(tetromino, grid);
};

// Функция для обновления сетки при падении блока
updateGrid = (tetromino, grid) => {
    tetromino.block.forEach((row, i) => {
        row.forEach((value, j) => {
            let x = tetromino.x + i;
            let y = tetromino.y + j;
            if (value > 0 && isInGrid(x, y, grid)) {
                grid.board[x][y].value = value;
            }
        })
    })
};

// Функция для проверки, заполнена ли полностью строка
checkFilledRow = (row) => {
    return row.every(v => {
        return v.value !== 0;
    });
};

// Функция для удаления заполненных строк
deleteRow = (row_index, grid) => {
    for (let row = row_index; row > 0; row--) {
        for (let col = 0; col < 10; col++) {
            grid.board[row][col].value = grid.board[row - 1][col].value;
            let value = grid.board[row][col].value;
            field[grid.board[row][col].index].style.background = value === 0 ? TRANSPARENT : COLORS[value - 1];
        }
    }
};

// Функция для проверки сетки на наличие заполненных строк
checkGrid = (grid) => {
    let row_count = 0;
    grid.board.forEach((row, i) => {
        if (checkFilledRow(row)) {
            deleteRow(i, grid);
            row_count++;
        }
    })
    if (row_count > 0) updateGame(row_count);
};

let game = {
    score: START_SCORE,
    speed: START_SPEED,
    state: GAME_STATE.END,
    interval: null
};

let grid = newGrid(GRID_WIDTH, GRID_HEIGHT);

let tetromino = null;

let score_span = document.querySelector('#score');

score_span.innerHTML = game.score;

// Игровой цикл
gameLoop = () => {
    if (game.state === GAME_STATE.PLAY) {
        // Если блок может двигаться вниз, двигаем вниз
        if (movable(tetromino, grid, DIRECTION.DOWN)) {
            moveDown(tetromino, grid);
        } else {
            // Обновление сетки и проверка на заполненные строки
            updateGrid(tetromino, grid);
            checkGrid(grid);
            tetromino = newTetromino(BLOCKS, COLORS, START_X, START_Y);

            // Проверка, полна ли сетка - конец игры
            if (movable(tetromino, grid, DIRECTION.DOWN)) {
                drawTetromino(tetromino, grid);
            } else {
                // Игра завершена
                game.state = GAME_STATE.END;
                let body = document.querySelector('body');
                body.classList.add('end');
                body.classList.remove('play');

                let rs_score = document.querySelector('#result-score');

                rs_score.innerHTML = game.score;
            }
        }
    }
};

// Начало игры
gameStart = () => {
    game.state = GAME_STATE.PLAY;
    score_span.innerHTML = '0';
    tetromino = newTetromino(BLOCKS, COLORS, START_X, START_Y);
    drawTetromino(tetromino, grid);
    game.interval = setInterval(gameLoop, game.speed);
};

// Обновление параметров игры после удаления строк
updateGame = (row_count) => {
    game.score += row_count * MAIN_SCORE + (row_count - 1) * BONUS_SCORE;

    // Если изменена скорость, обновляем интервал для игрового цикла
    if (START_SPEED !== game.speed) {
        game.speed = START_SPEED;
        clearInterval(game.interval);
        game.interval = setInterval(gameLoop, game.speed);
    }

    score_span.innerHTML = game.score;
};

// Пауза в игре
gamePause = () => {
    game.state = GAME_STATE.PAUSE;
};

// Возобновление игры
gameResume = () => {
    game.state = GAME_STATE.PLAY;
};

// Сброс игры
gameReset = () => {
    clearInterval(game.interval);
    resetGrid(grid);
    game.score = START_SCORE;
    game.speed = START_SPEED;
    game.state = GAME_STATE.END;
    game.interval = null;
    tetromino = null;
};


// Обработка событий клавиатуры
document.addEventListener('keydown', e => {
    let body = document.querySelector('body');
    e.preventDefault();
    let key = e.which;
    switch(key) {
        case KEY.DOWN:
            moveDown(tetromino, grid);
            break;
        case KEY.LEFT:
            moveLeft(tetromino, grid);
            break;
        case KEY.RIGHT:
            moveRight(tetromino, grid);
            break;
        case KEY.UP:
            rotate(tetromino, grid);
            break;
        case KEY.SPACE:
            hardDrop(tetromino, grid);
            break;
        case KEY.P:
            let btn_play = document.querySelector('#btn-play');
            if (game.state !== GAME_STATE.PAUSE) {
                gamePause();
                body.classList.add('pause');
                body.classList.remove('play');
                btn_play.innerHTML = 'resume';
            } else {
                body.classList.remove('pause');
                body.classList.add('play');
                gameResume();
            }
    }
});

// Обработка событий кнопок
let btns = document.querySelectorAll('[id*="btn-"]');

btns.forEach(e => {
    let btn_id = e.getAttribute('id');
    let body = document.querySelector('body');
    e.addEventListener('click', () => {
        switch(btn_id) {
            case 'btn-drop':
                hardDrop(tetromino, grid);
                break;
            case 'btn-up':
                rotate(tetromino, grid);
                break;
            case 'btn-down':
                moveDown(tetromino, grid);
                break;
            case 'btn-left':
                moveLeft(tetromino, grid);
                break;
            case 'btn-right':
                moveRight(tetromino, grid);
                break;
            case 'btn-play':
                body.classList.add('play');
                if (game.state === GAME_STATE.PAUSE) {
                    body.classList.remove('pause');
                    gameResume();
                    return;
                }
                gameStart();
                break;
            case 'btn-pause':
                gamePause();
                let btn_play = document.querySelector('#btn-play');
                btn_play.innerHTML = 'Resume';
                body.classList.remove('play');
                body.classList.add('pause');
                break;
            case 'btn-new-game':
                gameReset();
                body.classList.add('play');
                body.classList.remove('pause');
                body.classList.remove('end');
                gameStart();
                break;
        }
    })
});
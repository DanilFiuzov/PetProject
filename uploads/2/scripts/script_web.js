//          Кнопки меню.
    //Игра
let game_bt = document.getElementById("Game");
game_bt.addEventListener('click', Game_button);

    //Настройки
let settings_bt = document.getElementById("Settings");
settings_bt.addEventListener('click', Settings_button);

    //О игре
let description_bt = document.getElementById("Description");
description_bt.addEventListener('click', Description_button);



/*------------------------------------------------------------*/
//Своеобразные ключи.
Cod_Wind_1 = 0
Cod_Wind_2 = 0
Cod_Wind_3 = 0

//          Кнопки сплывающих окон.

//Крест.
let crest = document.getElementById("crest1");
crest.addEventListener('click', remove_wind);

let crest2 = document.getElementById("crest2");
crest2.addEventListener('click', remove_wind);

let crest3 = document.getElementById("crest3");
crest3.addEventListener('click', remove_wind);

//Сплывающие окно.
let block_game = document.getElementById("block_game");
let block_settings = document.getElementById("block_settings");
let block_description = document.getElementById("block_description");

let n_w = document.getElementById("n_w");

//style.display = 'none'; Выключить
//style.display = 'block'; Включить


function Game_button(){//Игра
    block_game.style.display = 'block';//Показать окно.
    Cod_Wind_1 = 1
}
function Settings_button(){//Настройки
    block_settings.style.display = 'block';//Показать окно.
    Cod_Wind_2 = 1
}
function Description_button(){//О игру
    block_description.style.display = 'block';//Показать окно.
    Cod_Wind_3 = 1
}
function remove_wind(){//Убрать окно.
    if(Cod_Wind_1 == 1){
        block_game.style.display = 'none';
    }if(Cod_Wind_2 == 1){
        block_settings.style.display = 'none';
    }if(Cod_Wind_3 == 1){
        block_description.style.display = 'none';
    }
}

function Not_work(){
    n_w.style.display="block"
    setInterval(()=>{
        n_w.style.display="none"
    },3000)
}

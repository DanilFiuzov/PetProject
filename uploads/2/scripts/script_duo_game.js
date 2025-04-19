//Массивы для отображения поля. (в системе)

let field_xy = [//Поле игрока
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
];

let field_xy2 = [//Поле робота.
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
];

//Массивы для разришения что-то на противоположном поле.(в системе)

let field_CanShot= [//Поле игрока для проверки выстрела.
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,]
]

let field_CanShot2= [//Поле робота для проверки выстрела.
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,],
    [true,true,true,true,true,true,true,true,true,true,]
]

/*-----------------------------------------*/

//Массив, в котором хронятся данные: (0)Имя, (1)кол-во палуб или оставшихся палуб, а в дальнейшем Id div-ов, чтобы осуществить пометку убитого коробля. 

data_ship = [//Корабли игрока
    ["Ch",4],//Однопалубники
    ["Tr1",3],["Tr2",3],//Трёхпалубники
    ["db1",2],["db2",2],["db3",2], //Двухпалубники
    ["on1",1],["on2",1],["on3",1],["on4",1] //Однопалубники
]

data_ship2 = [//Корабли бота
    ["Ch",4],//Однопалубники
    ["Tr1",3],["Tr2",3],//Трёхпалубники
    ["db1",2],["db2",2],["db3",2], //Двухпалубники
    ["on1",1],["on2",1],["on3",1],["on4",1] //Однопалубники
]

/*-----------------------------------------*/

//Переменные


var Ship_Sum = 10


var dead_ship = 0
var dead_ship2 = 0

var triger = 0

var key_play = false
var key_play2 = false

var Can_Play_Users = false

var key_p_us = 0

var us1 = false
var us2 = false

var key_pg = false
var key_hover = false

var key_f_pos = false
var key_f_pos2 = false
var key_pos = false


var coord_xy = 0

var Ship = 0

var move_user = false//Игрок 1
var move_user2 = false//Игрок 2

var test_move = 0

/*-----------------------------------------*/




//Моё виденье попаданий кораблей

// Можно - true, нельзя - false не знаю англиский

//var field = document.querySelector('.Field'); Класс


/*-----------------------------------------*/ 

//Берём из HTML те или иные элементы.


// Берём места, куда поместим 2 поля (визуально).
var wrapperBlock = document.getElementById("wrapperBlock");
var wrapperBlock2 = document.getElementById("wrapperBlock2");

// Поле с кнопками.
var Block_button = document.getElementById("Block_button")

var Block_Win_Lozz = document.getElementById("Block_Win_Lozz") 


var move_label = document.getElementById("move_label")

/*-----------------------------------------*/ 

//Кнопки.


//Вызвать функцию "рандом", чтобы рандомно раставить корабли.
let Rand = document.getElementById("Random")
Rand.addEventListener('click', Random)

//Выбрать функцию "Раставить в ручную", чтобы игрок мог раставить корабли как ему нужно.
let Pos = document.getElementById("Position")
Pos.addEventListener('click', Position)

//Запустить игру.
let Play = document.getElementById("Play")
Play.addEventListener('click', Play_game)


//Заново
let Again = document.getElementById("Again")
Again.addEventListener('click', Again_start)

//Выйти
let Log_out = document.getElementById("Log_out")
Log_out.addEventListener('click', Log_end)

/*-----------------------------------------*/ 

//Создаём 2 поля.

for(i=0;i<10;i++){//С ботом.
    
    // Поле 1 
    for(j=0;j<10;j++){
        var square = document.createElement("div");
        square.classList.add("square");
        //square.addEventListener("mouseover", Hover_maus_on)
        //square.addEventListener("mouseout", Hover_maus_off)
        square.id=i+";"+j;
        square.addEventListener('click',handleClick2);
        square.innerText = " ";
        wrapperBlock.appendChild(square)
    }
    // Поле 2
    for(j=0;j<10;j++){
        var square2 = document.createElement("div");
        square2.classList.add("square2");
        //square2.addEventListener("mouseover", Hover_maus_on)
        //square2.addEventListener("mouseout", Hover_maus_off)
        square2.id=i+";;"+j;
        square2.addEventListener('click',handleClick);
        square2.innerText = " ";
        wrapperBlock2.appendChild(square2)
    }
}

/*-----------------------------------------*/ 
//Общие.

function Play_game(){//Начать игру с ботом.
    if(key_play == true || Ship==10){
        if(key_pg==false){
            key_pg=true
            key_play = false
            Pos.innerText = "Вручную"
            document.getElementById("User").innerText="Игрок 2"
            Ship=0
            triger = 0
            key_p_us = 1
            key_f_pos = false
            key_f_pos2 = true
            Play.style.display = "none"
            document.getElementById("Block_button").style.left = "24%"
        }
        

    }
    if(key_play2 == true || Ship==10){
        key_pg=false
        Can_Play_Users = true
    }
    if(Can_Play_Users == true){
        key_hover = true
        for(i=0;i<10;i++){
            for(j=0;j<10;j++){
                elm= document.getElementById(i+";"+j)
                elm2= document.getElementById(i+";;"+j)

                elm.addEventListener("mouseover", Hover_maus_on)
                elm.addEventListener("mouseout", Hover_maus_off)

                elm2.addEventListener("mouseover", Hover_maus_on)
                elm2.addEventListener("mouseout", Hover_maus_off)

                if(elm.classList.contains("Ship_shadow")){
                    elm.classList.remove("Ship_shadow")
                }
                if(elm2.classList.contains("Ship_shadow")){
                    elm2.classList.remove("Ship_shadow")
                }
            }
        }
        Block_button.style.display = "none"
        move = Math.round(Math.random())
        console.log("0-Игрок1, 1-Игрок2",move)
        if(move == 0){
            move_user=true
            move_label.innerText= "------>"
        }else{
            move_user2=true
            move_label.innerText= "<------"
        }
    }

}

function Hover_maus_on(event){
    if(key_hover==true){document.getElementById(event.srcElement.id).classList.add("hover_on2")}
    
}
function Hover_maus_off(event){
    if(key_hover==true){document.getElementById(event.srcElement.id).classList.remove("hover_on2")}
    

}

function Hover_on(event){//Hover
    if(Ship<10 && key_f_pos==true){
        coords=event.srcElement.id.split(";");
        x_coord=coords[0];
        y_coord=coords[1];
        let vr_coord=[]
        if(coord_xy==0){//x y+
            x= x_coord
            y= y_coord
            for(i=0;i<data_ship[Ship][1];i++){
                vr_coord.push([x,y])
                y++
            }
        }
        if(coord_xy==1){//x+ y
            x= x_coord
            y= y_coord
            for(i=0;i<data_ship[Ship][1];i++){
                vr_coord.push([x,y])
                x++
            }
        }
        if(Chek_pos(vr_coord)==true){
            for (k=0;k<vr_coord.length;k++){
                a= vr_coord[k][0]
                b= vr_coord[k][1]
                document.getElementById(a+";"+b).classList.add("Hover_on")
            }
            key_pos = true
        }else{
            for (k=0;k<vr_coord.length;k++){
                a= vr_coord[k][0]
                b= vr_coord[k][1]
                if(a>-1 && a<10){
                    if(b>-1&& b<10){
                        document.getElementById(a+";"+b).classList.add("Hover_on_red")
                    }
                }
            }
            key_pos = false
        }
    }
    if(Ship<10 && key_f_pos2==true){
        coords=event.srcElement.id.split(";;");
        x_coord=coords[0];
        y_coord=coords[1];
        let vr_coord=[]
        if(coord_xy==0){//x y+
            x= x_coord
            y= y_coord
            for(i=0;i<data_ship2[Ship][1];i++){
                vr_coord.push([x,y])
                y++
            }
        }
        if(coord_xy==1){//x+ y
            x= x_coord
            y= y_coord
            for(i=0;i<data_ship2[Ship][1];i++){
                vr_coord.push([x,y])
                x++
            }
        }
        if(Chek_pos(vr_coord)==true){
            for (k=0;k<vr_coord.length;k++){
                a= vr_coord[k][0]
                b= vr_coord[k][1]
                document.getElementById(a+";;"+b).classList.add("Hover_on")
            }
            key_pos = true
        }else{
            for (k=0;k<vr_coord.length;k++){
                a= vr_coord[k][0]
                b= vr_coord[k][1]
                if(a>-1 && a<10){
                    if(b>-1&& b<10){
                        document.getElementById(a+";;"+b).classList.add("Hover_on_red")
                    }
                }
            }
            key_pos = false
        }
    }
    //document.getElementById(event.srcElement.id).classList.add("Hover_on")
}
function Hover_off(event){
    if(key_f_pos==true){
        if(Ship<10){
            coords=event.srcElement.id.split(";");
            x_coord=coords[0];
            y_coord=coords[1];
            let vr_coord2=[]
            if(coord_xy==0){//x y+
                x= x_coord
                y= y_coord
                for(i=0;i<data_ship[Ship][1];i++){
                    vr_coord2.push([x,y])
                    y++
                }
    
            }
            if(coord_xy==1){//x+ y
                x= x_coord
                y= y_coord
                for(i=0;i<data_ship[Ship][1];i++){
                    vr_coord2.push([x,y])
                    x++
                }
            }
        }
        for(i=0;i<10;i++){
            for(j=0;j<10;j++){
                elm= document.getElementById(i+";"+j)
                if(elm.classList.contains("Hover_on_red")){
                    elm.classList.remove("Hover_on_red")
                }
                if(elm.classList.contains("Hover_on")){
                    elm.classList.remove("Hover_on")
                }
            }
        }
    }
    if(key_f_pos2==true){
        if(Ship<10){
            coords=event.srcElement.id.split(";;");
            x_coord=coords[0];
            y_coord=coords[1];
            let vr_coord2=[]
            if(coord_xy==0){//x y+
                x= x_coord
                y= y_coord
                for(i=0;i<data_ship2[Ship][1];i++){
                    vr_coord2.push([x,y])
                    y++
                }
    
            }
            if(coord_xy==1){//x+ y
                x= x_coord
                y= y_coord
                for(i=0;i<data_ship2[Ship][1];i++){
                    vr_coord2.push([x,y])
                    x++
                }
            }
        }
        for(i=0;i<10;i++){
            for(j=0;j<10;j++){
                elm= document.getElementById(i+";;"+j)
                if(elm.classList.contains("Hover_on_red")){
                    elm.classList.remove("Hover_on_red")
                }
                if(elm.classList.contains("Hover_on")){
                    elm.classList.remove("Hover_on")
                }
            }
        }
    }
    
    //document.getElementById(event.srcElement.id).classList.remove("Hover_on")
}

//Проверка: все корабли убиты.
function Result(){
    if(Ship_Sum == dead_ship){
        setTimeout(function(){
            let result2 = document.getElementById("Win_Lozz")
            Block_Win_Lozz.style.display = "block"
            result2.innerText = "Победа";
        }, 3000);
    }
    if(Ship_Sum == dead_ship2){
        for(i=0;i<10;i++){
            for(j=0;j<10;j++){
                for(f=0;f<10;f++){
                    if(field_xy2[i][j]==data_ship2[f][0]){
                        if(data_ship2[f][1]!="dead"){
                            document.getElementById(i+";;"+j).classList.add("Ship_shadow")
                        }
                    }
                }
            }
        }
        setTimeout(function(){
            let result2 = document.getElementById("Win_Lozz")
            Block_Win_Lozz.style.display = "block"
            result2.innerText = "Проиграл";
        },3000);
    }
}

/*-----------------------------------------*/ 
//Функции пользователя.

//(В) - вызвается функция

function Random(){//(В)Создание кораблей по методу рандома.
    if(key_p_us==0){
        Pos.innerText = "Вручную"
        key_play = true
        key_f_pos = false
        Play.style.display="block"
        check_Fl()//Проверяем, был ли поле уже запонино.

        //Определяем расположение по вертикали или по горизонтали.ы
        // 0 - горизонталь; 1 - вертекаль
        //remove('active')
        //Добавить отчистку, если игрок решит заново пересгенерировать положение кораблей.
        for(r=0;r<Ship_Sum;r++){
            Name_Ship = data_ship[r][0]//Название корабля.
            dask = data_ship[r][1]//Кол-во палуб.
            let vr_coord =[]//Временый массив, мнимых координат корабля на поле.
            Wh_tf=true
            /* 
                Цикл while нужен, чтобы генерировать координаты и проверять(функция checkShipBoard), можно ли на этих координатах ставить корабль.
                Есла "да", то выполнится функция и прервётся цикл while.
                Если "нет", то цикл не завершится и заново будет генерировать координаты.
            */
            while(Wh_tf == true){
                var xy = Math.round(Math.random()) //Рандомное число от 0 до 1
                if (xy==0){ // 0 - горизонталь
                    min = 0
                    max = 9
                    x = Math.floor(Math.random() * (max - min + 1)) + min
                    y = Math.floor(Math.random() * (max - dask - min + 2)) + min;//Диапозон с учётом с размером корабля.
                    absl = max - dask+1 //Максимум по координатам, котором можно поставить корабль,
                                        //чтобы не зайти за поле.
                    alf = dask//Временный массив координат кораблей.
                    
                    /*--------------------------------------------------------------------------------- */
            
                    //Из первой координаты создаём уже сам корабль.
                    for (i=0;i<alf;i++){
                        
                        vr_coord[i] = [x,y]//Координаты временного массива.
                        y= y+1
                    }
            
                    
                }else{     // 1 - вертекаль
                    min = 0 
                    max = 9
                    x = Math.floor(Math.random() * (max - dask - min + 2)) + min;//Диапозон с учётом с размером корабля.
                    y = Math.floor(Math.random() * (max - min + 1)) + min
                    absl = max - dask+1
                    alf = dask//Координаты временного массива.
            
                    /*--------------------------------------------------------------------------------- */
            
                    //Из первой координаты создаём уже сам корабль.
                    for (i=0;i<alf;i++){
                        vr_coord[i] = [x,y]
                        x= x+1
                    }    
                }
                if(checkShipBoard(vr_coord)==true){
                    
                    for(r1=0;r1<vr_coord.length;r1++){
                        x5=vr_coord[r1][0]
                        y5=vr_coord[r1][1]
                        document.getElementById(x5+";"+y5).classList.add("Ship_shadow")
                        field_xy[x5][y5] = Name_Ship
                    }
                    for(c=0;c<vr_coord.length;c++){ //Обводка вокруг корабля.
                        let vr_Check_Ship =[]
                        //Начальные координаты палубы корабля.
                        x1=vr_coord[c][0]
                        y1=vr_coord[c][1]
                        y1=y1+1 //Сдвиг вправо 1 раз.
                        vr_Check_Ship.push([x1,y1])
                        x1=x1+1//Сдвиг вниз 1 раз.
                        vr_Check_Ship.push([x1,y1])
                        for(t=0;t<2;t++){//Сдвиг влево 2 раза.
                            y1=y1-1
                            vr_Check_Ship.push([x1,y1])
                        }
                        for(tg=0;tg<2;tg++){//Сдвиг вверх 2 раза
                            x1=x1-1
                            vr_Check_Ship.push([x1,y1])
                        }
                        for(th=0;th<2;th++){//Сдвиг право 2 раза
                            y1=y1+1
                            vr_Check_Ship.push([x1,y1])
                        }
                        //console.log(vr_Check_Ship) //Координаты вокруг клетки.
                
                        //Проверка координат, чтобы пометить поле возле корабля.
                        for(chk=0;chk<vr_Check_Ship.length;chk++){
                            x2= vr_Check_Ship[chk][0]
                            y2= vr_Check_Ship[chk][1]
                            if (x2>-1 && x2<10){ //9>=x2>=0
                                if (y2>-1 && y2<10){
                                    if(field_xy[x2][y2]==0){
                                        field_xy[x2][y2] = 1
                                    }
                                }
                                
                            }
                        }
                
                    }
                    Wh_tf = false
                }

            }//Конец цикла while
            
        }//Конец цикла for
    }
    if(key_p_us==1){
        Pos.innerText = "Вручную"
        key_play2 = true
        key_f_pos2 = false
        Play.style.display="block"
        check_Fl()//Проверяем, был ли поле уже запонино.

        //Определяем расположение по вертикали или по горизонтали.ы
        // 0 - горизонталь; 1 - вертекаль
        //remove('active')
        //Добавить отчистку, если игрок решит заново пересгенерировать положение кораблей.
        for(r=0;r<Ship_Sum;r++){
            Name_Ship = data_ship2[r][0]//Название корабля.
            dask = data_ship2[r][1]//Кол-во палуб.
            let vr_coord =[]//Временый массив, мнимых координат корабля на поле.
            Wh_tf=true
            /* 
                Цикл while нужен, чтобы генерировать координаты и проверять(функция checkShipBoard), можно ли на этих координатах ставить корабль.
                Есла "да", то выполнится функция и прервётся цикл while.
                Если "нет", то цикл не завершится и заново будет генерировать координаты.
            */
            while(Wh_tf == true){
                var xy = Math.round(Math.random()) //Рандомное число от 0 до 1
                if (xy==0){ // 0 - горизонталь
                    min = 0
                    max = 9
                    x = Math.floor(Math.random() * (max - min + 1)) + min
                    y = Math.floor(Math.random() * (max - dask - min + 2)) + min;//Диапозон с учётом с размером корабля.
                    absl = max - dask+1 //Максимум по координатам, котором можно поставить корабль,
                                        //чтобы не зайти за поле.
                    alf = dask//Временный массив координат кораблей.
                    
                    /*--------------------------------------------------------------------------------- */
            
                    //Из первой координаты создаём уже сам корабль.
                    for (i=0;i<alf;i++){
                        
                        vr_coord[i] = [x,y]//Координаты временного массива.
                        y= y+1
                    }
            
                    
                }else{     // 1 - вертекаль
                    min = 0 
                    max = 9
                    x = Math.floor(Math.random() * (max - dask - min + 2)) + min;//Диапозон с учётом с размером корабля.
                    y = Math.floor(Math.random() * (max - min + 1)) + min
                    absl = max - dask+1
                    alf = dask//Координаты временного массива.
            
                    /*--------------------------------------------------------------------------------- */
            
                    //Из первой координаты создаём уже сам корабль.
                    for (i=0;i<alf;i++){
                        vr_coord[i] = [x,y]
                        x= x+1
                    }    
                }
                if(checkShipBoard2(vr_coord)==true){
                    
                    for(r1=0;r1<vr_coord.length;r1++){
                        x5=vr_coord[r1][0]
                        y5=vr_coord[r1][1]
                        document.getElementById(x5+";;"+y5).classList.add("Ship_shadow")
                        field_xy2[x5][y5] = Name_Ship
                    }
                    for(c=0;c<vr_coord.length;c++){ //Обводка вокруг корабля.
                        let vr_Check_Ship =[]
                        //Начальные координаты палубы корабля.
                        x1=vr_coord[c][0]
                        y1=vr_coord[c][1]
                        y1=y1+1 //Сдвиг вправо 1 раз.
                        vr_Check_Ship.push([x1,y1])
                        x1=x1+1//Сдвиг вниз 1 раз.
                        vr_Check_Ship.push([x1,y1])
                        for(t=0;t<2;t++){//Сдвиг влево 2 раза.
                            y1=y1-1
                            vr_Check_Ship.push([x1,y1])
                        }
                        for(tg=0;tg<2;tg++){//Сдвиг вверх 2 раза
                            x1=x1-1
                            vr_Check_Ship.push([x1,y1])
                        }
                        for(th=0;th<2;th++){//Сдвиг право 2 раза
                            y1=y1+1
                            vr_Check_Ship.push([x1,y1])
                        }
                        //console.log(vr_Check_Ship) //Координаты вокруг клетки.
                
                        //Проверка координат, чтобы пометить поле возле корабля.
                        for(chk=0;chk<vr_Check_Ship.length;chk++){
                            x2= vr_Check_Ship[chk][0]
                            y2= vr_Check_Ship[chk][1]
                            if (x2>-1 && x2<10){ //9>=x2>=0
                                if (y2>-1 && y2<10){
                                    if(field_xy2[x2][y2]==0){
                                        field_xy2[x2][y2] = 1
                                    }
                                }
                                
                            }
                        }
                
                    }
                    Wh_tf = false
                }

            }//Конец цикла while
            
        }//Конец цикла for
    }
    

}

function Position(){//(В)
    if(key_p_us==0){
        key_play = false
        key_f_pos = true
        Pos.innerText = "Очистеть"
        Play.style.display="none"
        if(check_Fl()==true){}
        if(us1 == false){
            us1 = true
            for(i=0;i<10;i++){
                for(j=0;j<10;j++){
                    document.getElementById(i+";"+j).addEventListener('click', Pos_ship)
                    document.getElementById(i+";"+j).addEventListener("mouseover", Hover_on)
                    document.getElementById(i+";"+j).addEventListener("mouseleave", Hover_off)
                    document.getElementById(i+";"+j).addEventListener('contextmenu', Change_Pos)
                }
            }
        }
    }
    if(key_p_us==1){
        key_play2 = false
        key_f_pos2 = true
        Pos.innerText = "Очистеть"
        Play.style.display="none"
        if(check_Fl()==true){}
        if(us2 == false){
            us2 = true
            for(i=0;i<10;i++){
                for(j=0;j<10;j++){
                    document.getElementById(i+";;"+j).addEventListener('click', Pos_ship)
                    document.getElementById(i+";;"+j).addEventListener("mouseover", Hover_on)
                    document.getElementById(i+";;"+j).addEventListener("mouseleave", Hover_off)
                    document.getElementById(i+";;"+j).addEventListener('contextmenu', Change_Pos)
                }
            }
        }
    }
}



function handleClick(event){//Выстрел.
    // Берём id div-ва и разделяем на координаты Х и У.
    if(Ship_Sum > dead_ship){
        if(move_user==true){
            coords=event.srcElement.id.split(";;");
            x_coord=coords[0];
            y_coord=coords[1]; 
            // Берём id div-ва
            let att= document.getElementById(event.srcElement.id)
        
            if(field_CanShot2[x_coord][y_coord]==true){//Проверка на выстрел 
                field_CanShot2[x_coord][y_coord] = false
                
                //Проверка на попадания по карабл, и если он попал, то данные изменяются и переносятся в массив data_ship
                
                for(g = 0;g<10;g++){
                    if(field_xy2[x_coord][y_coord]==data_ship2[g][0]){//Если попал
                        hp = data_ship2[g][1]
                        hp = hp-1
                        data_ship2[g][1] = hp
                        data_ship2[g].push(att)
                        att.classList.add("hit") //Цвет, что ты попал.

                    }else if(field_xy2[x_coord][y_coord]==0 || field_xy2[x_coord][y_coord]==1){ //Промах.
                        move_label.innerText= "<------"
                        att.classList.add("miss") //Цвет, что ты промазал.
                        move_user=false
                        move_user2=true
                        break
                    }
                    //Мертвяк.
                    if (data_ship2[g][1]==0){
                        for(k=2;k<data_ship2[g].length;k++){
                            stl= data_ship2[g][k]
                            stl.classList.add("dead")
                        }
                        dead_ship = dead_ship + 1
                        dead_ship_check()
                        data_ship2[g][1] = "dead"
                        Result()
                    }    
                }
            }
        }
    }
    
    
      
}

function handleClick2(event){//Выстрел.
    // Берём id div-ва и разделяем на координаты Х и У.
    if(Ship_Sum > dead_ship2){
        if(move_user2==true){
            coords=event.srcElement.id.split(";");
            x_coord=coords[0];
            y_coord=coords[1]; 
            // Берём id div-ва
            let att= document.getElementById(event.srcElement.id)
        
            if(field_CanShot[x_coord][y_coord]==true){//Проверка на выстрел 
                field_CanShot[x_coord][y_coord] = false
                
                //Проверка на попадания по карабл, и если он попал, то данные изменяются и переносятся в массив data_ship
                
                for(g = 0;g<10;g++){
                    if(field_xy[x_coord][y_coord]==data_ship[g][0]){//Если попал
                        hp = data_ship[g][1]
                        hp = hp-1
                        data_ship[g][1] = hp
                        data_ship[g].push(att)
                        att.classList.add("hit") //Цвет, что ты попал.

                    }else if(field_xy[x_coord][y_coord]==0 || field_xy[x_coord][y_coord]==1){ //Промах.
                        move_label.innerText= "------>"
                        att.classList.add("miss") //Цвет, что ты промазал.
                        move_user=true
                        move_user2=false
                        break
                    }
                    //Мертвяк.
                    if (data_ship[g][1]==0){
                        for(k=2;k<data_ship[g].length;k++){
                            stl= data_ship[g][k]
                            stl.classList.add("dead")
                        }
                        dead_ship2 = dead_ship2 + 1
                        dead_ship_check2()
                        data_ship[g][1] = "dead"
                        Result()
                    }    
                }
            }
        }
    }
    
    
      
}

function Pos_ship(event){
    if(key_p_us==0){
        if(Ship<10 && key_pos==true){
            coords2= event.srcElement.id.split(";")
            Name_Ship = data_ship[Ship][0]
            x_coord = Number(coords2[0])
            y_coord = Number(coords2[1])
    
            let vr_coord2 = []
            for(i=0;i<data_ship[Ship][1];i++){
                if(coord_xy==0){
                    vr_coord2.push([x_coord,y_coord ])
                    field_xy[x_coord][y_coord]=Name_Ship
                    document.getElementById(x_coord+";"+y_coord).classList.add("Ship_shadow")
                    y_coord=y_coord+1
                } else{
                    vr_coord2.push([x_coord,y_coord ])
                    field_xy[x_coord][y_coord]=Name_Ship
                    document.getElementById(x_coord+";"+y_coord).classList.add("Ship_shadow")
                    x_coord=x_coord+1
                }
            }
            for(c=0;c<vr_coord2.length;c++){ //Обводка вокруг корабля.
                let vr_Check_Ship =[]
                //Начальные координаты палубы корабля.
                x1=vr_coord2[c][0]
                y1=vr_coord2[c][1]
                y1=y1+1 //Сдвиг вправо 1 раз.
                vr_Check_Ship.push([x1,y1])
                x1=x1+1//Сдвиг вниз 1 раз.
                vr_Check_Ship.push([x1,y1])
                for(t=0;t<2;t++){//Сдвиг влево 2 раза.
                    y1=y1-1
                    vr_Check_Ship.push([x1,y1])
                }
                for(tg=0;tg<2;tg++){//Сдвиг вверх 2 раза
                    x1=x1-1
                    vr_Check_Ship.push([x1,y1])
                }
                for(th=0;th<2;th++){//Сдвиг право 2 раза
                    y1=y1+1
                    vr_Check_Ship.push([x1,y1])
                }
                
                //console.log(vr_Check_Ship) //Координаты вокруг клетки.
    
                //Проверка координат, чтобы пометить поле возле корабля.
                for(chk=0;chk<vr_Check_Ship.length;chk++){
                    x2= vr_Check_Ship[chk][0]
                    y2= vr_Check_Ship[chk][1]
                    if (x2>-1 && x2<10){ //9>=x2>=0
                        if (y2>-1 && y2<10){
                            if(field_xy[x2][y2]==0){
                                field_xy[x2][y2] = 1
                            }
                        }
                        
                    }
                }
    
            }
            Ship++
        }
    }
    if(key_p_us==1){
        if(Ship<10 && key_pos==true){
            coords2= event.srcElement.id.split(";;")
            Name_Ship = data_ship2[Ship][0]
            x_coord = Number(coords2[0])
            y_coord = Number(coords2[1])
    
            let vr_coord2 = []
            for(i=0;i<data_ship[Ship][1];i++){
                if(coord_xy==0){
                    vr_coord2.push([x_coord,y_coord ])
                    field_xy2[x_coord][y_coord]=Name_Ship
                    document.getElementById(x_coord+";;"+y_coord).classList.add("Ship_shadow")
                    y_coord=y_coord+1
                } else{
                    vr_coord2.push([x_coord,y_coord ])
                    field_xy2[x_coord][y_coord]=Name_Ship
                    document.getElementById(x_coord+";;"+y_coord).classList.add("Ship_shadow")
                    x_coord=x_coord+1
                }
            }
            for(c=0;c<vr_coord2.length;c++){ //Обводка вокруг корабля.
                let vr_Check_Ship =[]
                //Начальные координаты палубы корабля.
                x1=vr_coord2[c][0]
                y1=vr_coord2[c][1]
                y1=y1+1 //Сдвиг вправо 1 раз.
                vr_Check_Ship.push([x1,y1])
                x1=x1+1//Сдвиг вниз 1 раз.
                vr_Check_Ship.push([x1,y1])
                for(t=0;t<2;t++){//Сдвиг влево 2 раза.
                    y1=y1-1
                    vr_Check_Ship.push([x1,y1])
                }
                for(tg=0;tg<2;tg++){//Сдвиг вверх 2 раза
                    x1=x1-1
                    vr_Check_Ship.push([x1,y1])
                }
                for(th=0;th<2;th++){//Сдвиг право 2 раза
                    y1=y1+1
                    vr_Check_Ship.push([x1,y1])
                }
                
                //console.log(vr_Check_Ship) //Координаты вокруг клетки.
    
                //Проверка координат, чтобы пометить поле возле корабля.
                for(chk=0;chk<vr_Check_Ship.length;chk++){
                    x2= vr_Check_Ship[chk][0]
                    y2= vr_Check_Ship[chk][1]
                    if (x2>-1 && x2<10){ //9>=x2>=0
                        if (y2>-1 && y2<10){
                            if(field_xy2[x2][y2]==0){
                                field_xy2[x2][y2] = 1
                            }
                        }
                        
                    }
                }
    
            }
            Ship++
        }
    }
    if(Ship==10){
        Play.style.display="block"
    }
}


function Change_Pos(event){//ПКМ
    if(key_f_pos==true && Ship<11){
        event.preventDefault(); // Отменяем вызов стандартного контекстного меню браузера
        if(coord_xy == 0){
            coord_xy = 1
            console.log(coord_xy)
        }else{
            coord_xy = 0
            console.log(coord_xy)
        }
    }
    if(key_f_pos2==true && Ship<11){
        event.preventDefault(); // Отменяем вызов стандартного контекстного меню браузера
        if(coord_xy == 0){
            coord_xy = 1
            console.log(coord_xy)
        }else{
            coord_xy = 0
            console.log(coord_xy)
        }
    }
}

/*-----------------------------------------*/ 

//Системные функции
function Log_end(){
    Again_start()
    Block_button.style.display = "none"
    document.getElementById("Bord_ship").style.display = 'none';
    document.getElementById("web").style.display = 'block';
}

//Полная отчистака.
function Again_start(){
    Again_1()//Очищаем переменные
    Again_2()//Возращаем обратно изначальные значения
    check_Fl_full()// Очищаем 2 поля.
    document.getElementById("Block_button").style.left = "76%"
    document.getElementById("User").innerText="Игрок 1"
    move_label.innerText= " "
    Block_Win_Lozz.style.display = "none"
    Block_button.style.display = "block"
    Play.style.display="none"
}

function Again_1(){

    dead_ship = 0
    dead_ship2 = 0

    triger = 0

    key_play = false
    key_play2 = false

    Can_Play_Users = false

    key_p_us = 0
    key_hover = false

    us1 = false
    us2 = false

    key_f_pos = false
    key_f_pos2 = false
    key_pos = false


    coord_xy = 0

    Ship = 0

    move_user = false//Игрок 1
    move_user2 = false//Игрок 2

    test_move = 0
}
function Again_2(){
    //Очистка.
    data_ship.length = 0
    data_ship2.length = 0

    //Возращаем прежние данные.
    data_ship.push(
        ["Ch",4],["Tr1",3],["Tr2",3],["db1",2],["db2",2],
        ["db3",2], ["on1",1],["on2",1],["on3",1],["on4",1]
    )
    data_ship2.push(
        ["Ch",4],["Tr1",3],["Tr2",3],["db1",2],["db2",2],
        ["db3",2], ["on1",1],["on2",1],["on3",1],["on4",1]
    )
}


function dead_ship_check(){//Проверка: уничтожен корабль 2 игрока
    console.log("-------------------------------------")
    console.log("Проверяем.")

    for(i=0;i<10;i++){
        if(data_ship2[i][1]==0){
            for(j=2;j<data_ship2[i].length;j++){
                str = data_ship2[i][j].id.split(";;")
                x2= Number(str[0])
                y2= Number(str[1])
                let vr_Check_Ship =[]
                //Начальные координаты палубы корабля.
                y2=y2+1 //Сдвиг вправо 1 раз.
                vr_Check_Ship.push([x2,y2])
                x2=x2+1//Сдвиг вниз 1 раз.
                vr_Check_Ship.push([x2,y2])
                for(t=0;t<2;t++){//Сдвиг влево 2 раза.
                    y2=y2-1
                    vr_Check_Ship.push([x2,y2])
                }
                for(tg=0;tg<2;tg++){//Сдвиг вверх 2 раза
                    x2=x2-1
                    vr_Check_Ship.push([x2,y2])
                }
                for(th=0;th<2;th++){//Сдвиг право 2 раза
                    y2=y2+1
                    vr_Check_Ship.push([x2,y2])
                }
                //console.log(vr_Check_Ship) //Координаты вокруг клетки.

                //Проверка координат, чтобы пометить поле возле корабля.
                for(chk=0;chk<vr_Check_Ship.length;chk++){
                    x3= vr_Check_Ship[chk][0]
                    y3= vr_Check_Ship[chk][1]
                    att= document.getElementById(x3+";;"+y3)
                    if (x3>-1 && x3<10){ //9>=x2>=0
                        if (y3>-1 && y3<10){
                            if(field_CanShot2[x3][y3]==true){
                                field_CanShot2[x3][y3] = false
                                att.classList.add("miss")
                            }
                        }
                                
                    }
                }
            }
            break
        }
    }
    
        
    
    //конец мертвека
    console.log("Конец")
    console.log("-------------------------------------")
}
function dead_ship_check2(){//Проверка: уничтожен корабль 1 игрока
    console.log("-------------------------------------")
    console.log("Проверяем.")

    for(i=0;i<10;i++){
        if(data_ship[i][1]==0){
            for(j=2;j<data_ship[i].length;j++){
                str = data_ship[i][j].id.split(";")
                x2= Number(str[0])
                y2= Number(str[1])
                let vr_Check_Ship =[]
                //Начальные координаты палубы корабля.
                y2=y2+1 //Сдвиг вправо 1 раз.
                vr_Check_Ship.push([x2,y2])
                x2=x2+1//Сдвиг вниз 1 раз.
                vr_Check_Ship.push([x2,y2])
                for(t=0;t<2;t++){//Сдвиг влево 2 раза.
                    y2=y2-1
                    vr_Check_Ship.push([x2,y2])
                }
                for(tg=0;tg<2;tg++){//Сдвиг вверх 2 раза
                    x2=x2-1
                    vr_Check_Ship.push([x2,y2])
                }
                for(th=0;th<2;th++){//Сдвиг право 2 раза
                    y2=y2+1
                    vr_Check_Ship.push([x2,y2])
                }
                //console.log(vr_Check_Ship) //Координаты вокруг клетки.

                //Проверка координат, чтобы пометить поле возле корабля.
                for(chk=0;chk<vr_Check_Ship.length;chk++){
                    x3= vr_Check_Ship[chk][0]
                    y3= vr_Check_Ship[chk][1]
                    att= document.getElementById(x3+";"+y3)
                    if (x3>-1 && x3<10){ //9>=x2>=0
                        if (y3>-1 && y3<10){
                            if(field_CanShot[x3][y3]==true){
                                field_CanShot[x3][y3] = false
                                att.classList.add("miss")
                            }
                        }
                                
                    }
                }
            }
            break
        }
    }
    
        
    
    //конец мертвека
    console.log("Конец")
    console.log("-------------------------------------")
}

//Удаление кораблей при растановки.
function Delet(xd,yd){//Проверка и удаление кораблей, если они уже на поле(М).
    if(key_p_us==0){
        if (field_xy[xd][yd]==0){ // Нет в массиве ничего
            return 0
        } else{
            return 1 // Есть в массиве палуба или очертания вокруг корабля(1) 
        }
    }
    if(key_p_us==1){
        if (field_xy2[xd][yd]==0){ // Нет в массиве ничего
            return 0
        } else{
            return 1 // Есть в массиве палуба или очертания вокруг корабля(1) 
        }
    }
}
function check_Fl(){
    if(key_p_us==0){
        if(triger == 1){
            Ship=0
            for(xd=0;xd<10;xd++){
                for(yd=0;yd<10;yd++){
                    //Очищаем массив и поле.
                    if(Delet(xd,yd)== 1){
                        field_xy[xd][yd] = 0 //Очистака массива по координатам
                        document.getElementById(xd+";"+yd).classList.remove("Ship_shadow") //Удаляем палубу на поле.
                    }
                }
            }
        } else{
            triger= triger + 1
        }
    }
    if(key_p_us==1){
        if(triger == 1){
            Ship=0
            for(xd=0;xd<10;xd++){
                for(yd=0;yd<10;yd++){
                    //Очищаем массив и поле.
                    if(Delet(xd,yd)== 1){
                        field_xy2[xd][yd] = 0 //Очистака массива по координатам
                        document.getElementById(xd+";;"+yd).classList.remove("Ship_shadow") //Удаляем палубу на поле.
                    }
                }
            }
        } else{
            triger= triger + 1
        }
    }
    
}

//(М) - модуль другому.

//Удаление при законченой игры(М).
function check_Fl_full(){
    for(xd=0;xd<10;xd++){
        for(yd=0;yd<10;yd++){

            field_xy[xd][yd] = 0
            field_xy2[xd][yd] = 0

            field_CanShot[xd][yd] = true
            field_CanShot2[xd][yd] = true

            cletka = document.getElementById(xd+";"+yd)

            if(cletka.classList.contains("Ship_shadow")){cletka.classList.remove("Ship_shadow")}
            if(cletka.classList.contains("miss")){cletka.classList.remove("miss")}
            if(cletka.classList.contains("hit")){cletka.classList.remove("hit")}
            if(cletka.classList.contains("dead")){cletka.classList.remove("dead")}

            cletka2 = document.getElementById(xd+";;"+yd)
            if(cletka2.classList.contains("Ship_shadow")){cletka2.classList.remove("Ship_shadow")}
            if(cletka2.classList.contains("miss")){cletka2.classList.remove("miss")}
            if(cletka2.classList.contains("hit")){cletka2.classList.remove("hit")}
            if(cletka2.classList.contains("dead")){cletka2.classList.remove("dead")}
        }
    }
    dead_ship2=0
    
}

function checkShipBoard(vr_coord){ //Проверяем можно ли поставить корабль
    
    Can=0
    for(i=0;i<vr_coord.length;i++){
        x4= vr_coord[i][0]
        y4= vr_coord[i][1]
        if(field_xy[x4][y4] == 0){
            Can=Can+1    
        } else {
            break;
        }
    }
    if(Can==vr_coord.length){
        return true;
    }else{
        return false;
    } 
    


}

function checkShipBoard2(vr_coord){ //Проверяем можно ли поставить корабль робота
    
    Can=0
    for(i=0;i<vr_coord.length;i++){
        x4= vr_coord[i][0]
        y4= vr_coord[i][1]
        if(field_xy2[x4][y4] == 0){
            Can=Can+1    
        } else {
            break;
        }
    }
    if(Can==vr_coord.length){
        return true;
    }else{
        return false;
    } 
    


}

function Chek_pos(vr_coord){
    if(key_p_us==0){
        Can = 0
        Can_Fl = 0
        for(i=0;i<vr_coord.length;i++){
            kx= vr_coord[i][0]
            ky= vr_coord[i][1]
            if(ky>-1 && ky<10){
                if(kx>-1 && kx<10){
                    Can++
                }
            }
        }
        if(Can==vr_coord.length){
            for(j=0;j<vr_coord.length;j++){
                kx2= vr_coord[j][0]
                ky2= vr_coord[j][1]
                if(field_xy[kx2][ky2]==0){
                    Can_Fl++
                }else{
                    break
                }
            }
        }
        if(Can_Fl==vr_coord.length){
            return true
        } else {
            return false
        }
    }
    if(key_p_us==1){
        Can = 0
        Can_Fl = 0
        for(i=0;i<vr_coord.length;i++){
            kx= vr_coord[i][0]
            ky= vr_coord[i][1]
            if(ky>-1 && ky<10){
                if(kx>-1 && kx<10){
                    Can++
                }
            }
        }
        if(Can==vr_coord.length){
            for(j=0;j<vr_coord.length;j++){
                kx2= vr_coord[j][0]
                ky2= vr_coord[j][1]
                if(field_xy2[kx2][ky2]==0){
                    Can_Fl++
                }else{
                    break
                }
            }
        }
        if(Can_Fl==vr_coord.length){
            return true
        } else {
            return false
        }
    }
}


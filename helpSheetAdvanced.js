const inputUah = document.querySelector('#uah'),
    inputUsd = document.querySelector('#usd');

// Логика программы-калькулятора:
// при вводе числа в первом поле (UAH), в нижнем (USD) отображается результат в долларах
inputUah.addEventListener('input', () => {
    const request = new XMLHttpRequest();

    //Методы объекта XMLHttpRequest
    // request.open(метод GET или POST, url путь по которому будем делать запрос, async по умолчанию true, login, pass);
    request.open('GET', 'js/current.json');
    // заголовки/ Этот метод вызывается обязательно после .open() и обязательно до .send()
    request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    // запуск запроса
    //.send() при работе с методом GET не отправляет ничего на сервер,
    // но при работе с методом POST, он может отправлять на сервер какой-то body: .send(body)
    request.send();


    // Свойства объекта XMLHttpRequest
    // status нашего запроса (page 404 и т.д.)
    // statusText текстовое описание ответа от сервера
    // !!! ВАЖНО response ответ сервера. В этом свойстве хранится ответ от сервера, с которым нам придется работать.
    // readyState возвращает текущее состояние объекта XMLHttpRequest, нашего запроса. 
    //Например done - наш запрос выполнен
    // Это важное свойство, можно использовать для условий в скрипте, например

    // События объекта XMLHttpRequest
    // readystatechange - отслеживает статус готовности нашего запроса в текущий момент
    // варианты кодов статусов (0, 1, 2, 3, 4) есть на странице XMLHttpRequest.readyState в MDN
    // 4 - DONE операция полностью завершена
    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4 && request.status === 200) { // 200 - success (все ок)
            // то есть проверяется текущее состояние запроса: если запрос успешно совершен, то...
            // выводим в консоль ответ сервера
            // console.log(request.response);
            // Важно!!! Запуск на сервере!!! Если только GET, то можно и через liveserver, 
            // но если POST, то только через локальные сервера
            // переводим олучаемый JSON в нормальный формат
            const data = JSON.parse(request.response);

            inputUsd.value = (+inputUah.value / data.current.usd).toFixed(2); // округлить до двух знаков
            // обязательно выводим сообщение об ошибке в случае неудачи
        } else {
            inputUsd.value = 'Что-то пошло не так';
        }
    });

    // чаще используется событие load. Оно проще. Срабатывает только один раз, когда запрос полностью готов.
    request.addEventListener('load', () => {
        if (request.status === 200) {
            const data = JSON.parse(request.response);
            inputUsd.value = (+inputUah.value / data.current.usd).toFixed(2);
            // обратить внимание на то, как обращаемся к обьекту в переменной data -- data.current.usd
        } else {
            inputUsd.value = 'Что-то пошло не так';
        }
    });

});

/*

Суть запроса:
1. Делаем запрос на  сервер.
2. Приходит ответ, который нужно проанализировать и после этого уже как-то реагировать.
3.  События объекта XHR (XMLHttpRequest)

*****************************************************************************************
Реализация скрипта отправки данных на сервер (unit 53)

в коде есть две формы, которые отправляют данные на сервер.
Чтобы не создавать отдельно два похожих обработчика - обернем все это в функцию, 
которую будем при необходимости вызывать

******************

// Forms


    const forms = document.querySelectorAll('form');

    const message = { //заготовки сообщений о статусе запроса для пользователя
        loading: 'Идет загрузка...',
        succes: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...'
    };

    forms.forEach(item => {
        postData(item);
    });

    function postData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); //отключение параметров по умолчанию для события (e), то есть перезагрузка страницы
            // это обязательная первая строка в AJAX-запросах

            const statusMessage = document.createElement('div');
            statusMessage.classList.add('status');
            statusMessage.textContent = message.loading; // первое сообщение о загрузке процесса
            // дальше нужно вывести на страницу это собщение
            form.append(statusMessage);

            const request = new XMLHttpRequest();
            request.open('POST', 'server.php'); //метод POST и путь куда отправляются данные server.php

            // request.setRequestHeader('Content-type', 'miltipart/form-data');
            //!!! ВАЖНО. при использовании XMLHttpRequest в связке с FormDate заголовки указываются автоматически.
             Если его указать, то при получении ответа от сервера мы получаем пустой объект
              от вместо объекта с теми данными, которые мы отправили через форму.
            // При такой связке нет необходимости прописывать заголовки setRequestHeader()

            const formData = new FormData(form); // форма, с которой мы берем данные

            request.send(formData);

            request.addEventListener('load', () => { // load - отслеживаем полную загрузку нашего запроса
                if (request.status === 200) { // 200 - все ок, на запрос успешно прошел
                    console.log(request.response); //здесь размещаются ответы пользователю по поводу статуса его отправки формы:
                    // спасибо мы с вами свжемся, или при неудачной отправке соответствующее сообщение
                    statusMessage.textContent = message.succes;
                    //очистка формы после удачной отправки:
                    form.reset(); // или можно перелопатить все input.values и очистить их
                    setTimeout(() => {
                        statusMessage.remove();
                    }, 2000); //убираем ответ сервера с экрана через 2 сек.

                } else {
                    statusMessage.textContent = message.failure;
                }
                

            });
        });
    }


//Как получить в js данные с заполненной формы для отправки на сервер без стандартных итераций, 
переборов и создания объектов

// объект FormData()
// Можно использовать объект formData(), если данные, которые идут на не нужно передеваать в формате JSON

const form = new FormData(form) // form - это форма, с которой нужно забрать данные

Правильность верстки форм
Всегда при верстке форм ОБЯЗАТЕЛЬНО указывать атрибут [name="name"], главное чтобы значения не повторялись,
 но атрибут name обязан быть, иначе
FormData не сможет взять из такой формы значения и создать объект

******
Отправка данных в формате JSON

1. Обязательно прописываем заголовки
request.setRequestHeader('Content-type', 'application/json')
2. Для работы с FormData (а это специфичный объект) придется сначала перевести его в стандартный объект
const object {};
object.forEach(function (value, key) => {
    object[key] = value;
});
3. Теперь можно трансформировать нормальный объект в JSON:
const json = JSON.stringify(object);
request.send(json);


**************************************************************
Красивое оповещение пользователя после отправки формы
Unit 54

//  Работа с модальным окном оповещения
В уроке это div  с классом modal__dialog
Используем существующую верстку формы отправки данных. Только для вывода нашего оповещения
скрываем содержимое через hide и сверху показываем наше обращение к  пользователю. 
Создаем html-сщдержимое динамически при помощи скрипта.
Нужно помнить, что динамически сгенерированый html не сможет работать с некоторыми 
обработчиками событий, например крестик!!!
В уроке в это модальное окно передается текст о статусе нашей отправки
Алгоритм простой:
1. Скрыть старое содержимое
2. Запустить модалку
3. Добавить нужное нам содержимое окна

//Работа с крестиком (как повесить на динеамический крестик возможность реагировать на обработчик событий)

Вот это уже не сработает при динамической верстке:
    modalCloseBtn = document.querySelector('[data-close]'); //крестик на модальном окне
    modalCloseBtn.addEventListener('click', closeModal);

Править можно с помощью блока, который закрывает модалку при клике на подложку
Мы в условия event.target добавляем " ИЛИ элемент имеет атрибут data-close"

// выключение модалки по клику на подложку
modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.getAttribute('data-close' == '') {
        closeModal();
    }
});
************************************************************************

Promise

*************************************************************************
Есть «создающий» код, который делает что-то, что занимает время. Например, загружает данные по сети.

Есть «потребляющий» код, который хочет получить результат «создающего» кода, когда он будет готов. 
Он может быть необходим более чем одной функции.

Promise (по англ. promise, будем называть такой объект «промис») – это специальный объект в JavaScript, 
который связывает «создающий» и «потребляющий» коды вместе. В терминах нашей аналогии – это «список для подписки». 
«Создающий» код может выполняться сколько потребуется, чтобы получить результат, 
а промис делает результат доступным для кода, который подписан на него, когда результат готов.

***
Промисы позволяют строить код таким образом, что определенные его асинхронные куски 
будут запускаться строго после выполнения предыдущего.
То есть это цепочка асинхронных кодов, выполняемых в определенной последовательности
с возможностью работать с их колбеками через аргументы.


******
Методы промисов:
.then()
.cath()

.then - это метод, которые выплоняется на промисе в случае положительного исхода
то есть это ф-ция resolve



console.log('Запрос данных...');

const req = new Promise((resolve, reject) => {
    // resolve - аргумент-функция, которая запускается, если условие промиса достигнуто/выполнено
    // reject - если условие не выполнено
    setTimeout(() => {
        console.log('Подготовка данных...');

        const product = {
            name: 'TV',
            price: 3500
        };

        resolve(product)
    }, 2000);
});

req.then((product) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            product.status = 'order';
            resolve(product);
            // reject();
        }, 2000);
    });
}).then(data => {
    data.modify = true;
    return data;
}).then(data => {
    console.log(data);
}).catch(() => {
    console.error('Произошла ошибка');
}).finally(() => {
    console.log('Finally');
});



Для того, чтобы получить в req.then() параметр product необходимо в предыдущем этапе выполнения кода вернуть его.
Как раз resolve и возвращает нам значение, которое перенесется в метод .then().

ВАЖНО!!! 
То есть в параметры .then() попадает то, что возвращает resolve того фрагмента кода, которы идет перед then(). 
Будь то переменная или функция или объект.
После этого уже операция в req.then() возьмет product, 
который возвращает resolve предыдущего промиса и будет что-то с ним делать
И вот такими цепочками можно выстраивать целый паровоз действий,
 которые будут выполнятся строго после выполнения предыдущего шага
И тут если нам нужно после второго шага еще что-то сделать мы снова обворачиваем это в промис

Чейнинг. в then(), мы получаем resolve из предыдущего промиса. 
Для продолжения цепочки мы можем создать еще один промис и с его resolve запустить очередное звено.
Или сделать return объекта, с которым работаем и создать такую цепочку операций, 
которые будут обрабатываться строго друг за другом (то есть работаес  помощью then() с синхронным кодом)
При таком подходе код выстраивается в читабельную понятную цепочку операций. 
И это применять можем и в синхронном и в асинхронном коде.


***
reject / catch

при срабатывании reject, все последующие then() пропускаются и выполняется
.catch() - тоже колбэк, который выводит например сообщение об ошибке

.catch() - обычно ставится в конце цепочки

***
.finally() - возвращает то, что должно быть при любом исходе кода: при этом неважно что сработало resolve или reject

***
хороший пример промиса с возможностью задавать время задержки до старта новой операции
const test = time => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), time);
    });
};

test(1000).then(() => console.log('1000 ms'));
test(3000).then(() => console.log('3000 ms'));
***
***
Метод Promise.all()
Это по сути массив промисов. Он шикарен тем, что в него можно запихнуть перечень всех тех промисов,
которых нам нужно дождаться и и уже к этому массиву можно обращаться как типа обобщенному промису
Promise.all([test(1000), test(3000)]).then(() => {
    console.log('All);
});
***
Метод Promise.race()
Это тот же массов промисов, но исполняется функция не тогда, когда все промисы пройдут,
а сразу как только пройдет самый быстрый
***
!!! Возвращая промисы, мы можем строить цепочки из асинхронных действий.

new Promise(function(resolve, reject) {

  setTimeout(() => resolve(1), 1000);

}).then(function(result) {

  alert(result); // 1

  return new Promise((resolve, reject) => { // (*)
    setTimeout(() => resolve(result * 2), 1000);
  });

}).then(function(result) { // (**)

  alert(result); // 2

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result * 2), 1000);
  });

}).then(function(result) {

  alert(result); // 4

});


**********************************************************************
fetch();
**********************************************************************

Если в аргументах fetch мы указываем только url, то он сработает как по методу GET. То есть просто загрузит из этого url то, то там есть
fetch('https://jsonplaceholder.typicode.com/todos/1') //получаем какой-то промис от сервера
    .then(response => response.json()) // переводим этот промис с формата json в стандартный JS и отдаем дальше как промис!
    .then(json => console.log(json)); // от предыдущего промиса, который пришел нам уже от .then(), выводим значение в консоль


При использовании других методов, например POST, в аргументы fetch() добавляем объект, в котором указываем дополнительные параметры запроса:
например body, headers

***
Реакция fetch() на ошибку http (404, 500 и т.п.)

При таких ошибках fetch() вс равно отрпботает. Потому что для него самое главное получилось ли сделать запрос. Если получилось, но там пошли какие-то не те данные или неправильный адрес - это проконает, запрос прошел.
Вот что для  fetch() главное. Но если не будет соединения, то тогда будет reject.

Но можна настроить правильную реакцию на статусы HTTP:

const getResoutce = async (url) => { //функция-шаблон для геттинга данных от сервера
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Could not fetch ${url}, status: ${res.status}`);
    }

    return await res.json();
};

// throw
throw позволяет генерировать исключения, определяемые пользователем. При этом выполнение текущей функции будет остановлено (инструкции после throw не будут выполнены), и управление будет передано в первый блок catch в стеке вызовов. Если catch блоков среди вызванных функций нет, выполнение программы будет остановлено.

Свойства feth:
//
.ok - логическое значение: будет true, если код HTTP-статуса в диапазоне 200-299
.status – код статуса HTTP-запроса, например 200.


***********************************************************************
Методы массивов и Object.entries()
    filter()    
    map()
    every / some
    reduce()

***
filter()
создание нового массива, состоящего из отфильтрованных по определенному условию/правилу  элементов

const arr = ['nika', 'alexei', 'natali', 'joanne', 'maximus'];
const newArr = arr.filter(name => name.length < 7);
console.log(newArr);

const arr2 = [5, 23, 8, 33, 44, 32, 9, 35, 46];
const newArr2 = arr2.filter(name => name < 40 && name > 20);
console.log(newArr2);

!!!****!!!
из примеров MDN:
я так понимаю это правильная тема сначала написать функцию с алгоритмом действий. А потом вызывать ее в нужных arr.filter()
это позволяет удобно  обрабатывать разные массивы с аналогичными задачами

function isBigEnough(value) {
  return value >= 10;
}

let filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
// массив filtered равен [12, 130, 44]

В следующем примере filter() используется для фильтрации содержимого массива на основе входных данных.

const fruits = ['apple', 'banana', 'grapes', 'mango', 'orange'];

Элементы массива фильтруется на основе критериев поиска (query)

 const filterItems = (query) => {
    return fruits.filter((el) =>
      el.toLowerCase().indexOf(query.toLowerCase()) > -1
    );
  }
  
  console.log(filterItems('ap')); // ['apple', 'grapes']
  console.log(filterItems('an')); // ['banana', 'mango', 'orange']


***
map()
возможность изменить каждый элемент массива и создает новый массив из таких элементов

const names = ['IvaN', 'naTali', 'niKA', 'aleX'];
const newNames = names.map(item => item.toLowerCase());
console.log(newNames); // [ 'ivan', 'natali', 'nika', 'alex' ]

const numbers = [23, 56, 85, 24, 14];
const newNumbers = numbers.map(item => item * 10);
console.log(newNumbers); //[ 230, 560, 850, 240, 140 ]


!!!***!!!
/ Рассмотрим пример:
['1', '2', '3'].map(parseInt);
// Хотя ожидаемый результат вызова равен [1, 2, 3],
// в действительности получаем [1, NaN, NaN]

// Функция parseInt часто используется с одним аргументом, но она принимает два.
// Первый аргумент является выражением, а второй - основанием системы счисления.
// В функцию callback Array.prototype.map передаёт 3 аргумента:
// элемент, его индекс и сам массив.
// Третий аргумент игнорируется parseInt, но не второй, следовательно,
// возможна путаница. Смотрите запись в блоге для дополнительной информации.

function returnInt(element) {
  return parseInt(element, 10);
}

['1', '2', '3'].map(returnInt);
// Результатом является массив чисел (как и ожидалось)

// Простейший способ добиться вышеозначенного поведения и избежать чувства "чё за!?":
['1', '2', '3'].map(Number); // [1, 2, 3]
***
every / some - возвращают булиновое значение!
при переборе массива, если все/хотя бы один (every/some) элемент соответствует условию, то возвращается true

const arr = [3, 4, 23, 34];
const arr4 = arr.every(item => typeof (item) === 'number');
console.log(arr4); // true

const arr = [3, 4, 23, 34];
const arr4 = arr.some(item => typeof (item) === 'number');
console.log(arr4); // false

***
reduce
схлопывает или собирает массив в одно целое
то есть плюсует все в кучу или минусует...
то есть это операции с элементами и проводим между ними  одну операцию, которая добавляется к итоговой переменной sum

const formula = arr.reduce((sum, item) => sum + item, start)
sum - итоговая переменная
item - текущий элемент массива
start - начальное значение sum (необязательно)

const arr = [3, 5, 3, 7, 5, 6, 8, 4, 9];
const res = arr.reduce((sum, item) => sum + item);
console.log(res); // 50. Если использовать минус будет - 44

const arr2 = ['IvaN', 'naTali', 'niKA', 'aleXeI'];
const res2 = arr2.reduce((sum, item) => `${sum}, ${item}`);
console.log(res2);

! Интересно !
Разворачивание массива массивов:
var flattened = [[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
  return a.concat(b);
});
// flattened равен [0, 1, 2, 3, 4, 5]

***
Object.entries()
Превращает объект в матрицу - массив массивов
То есть пара ключ значение превращается в массив из двух елементов

// задача вывести из такого объекта массив имен

const obj = {
    ivan: 'persone',
    ann: 'persone',
    dog: 'animal',
    cat: 'animal'
};

// 1. превращаем обект в массив массивов
// 2. фильтруем там, где есть 'persone'
// 3. создаем итоговый массив имен

const newArr = Object.entries(obj)
    .filter(item => item[1] === 'persone')
    .map(item => item[0]);

console.log(newArr);

Object.fromEntries() - это обратный метода перевода из матрицы (массив массивов) в стандартный объект JS

***
//чейнинг
const names3 = ['IvaN', 'naTali', 'niKA', 'aleXeI'];
const var3 = names3.filter(item => item.length > 4).map(item => item.toUpperCase());
console.log(var3); //[ 'NATALI', 'ALEXEI' ]

*************************************************************
Async / Await
**************************************************************
парные операторы

async - ставится в начале функции и указывает на то, что данная функция асинхронна
await - ставится перед тем узлом функции, которого необходимо дождааться, прежде чем продолжить выполнять код


********************************
Добавлеие inline-стилей через js-script
1. создать элемент для html
2. через style.cssText прописыываем то, что войдет файл css, как описание данного элемента

Фрагмент из кода к сайту про питание:

const indicators = document.createElement('ol');
indicators.classList.add('carousel-indicators');
indicators.style.cssText = `
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 15;
    display: flex;
    justify-content: center;
    margin-right: 15%;
    margin-left: 15%;
    list-style: none;
`;
slider.append(indicators);

************************************
Local storage

глобальный объект, точне свойство глобального объекта Window.localStorage

Основные 4 команды

localStorage.setItem() - отправить key & value
localStorage.getItem() - получить key & value
localStorage.removeItem() - удалить ключ
localStorage.clear(); - очищает localStorage от всех данных

localStorage.setItem('Alex', 'programmer');

localStorage.getItem('Alex');
localStorage.Alex = 'merried';
localStorage['Alex'] = 'good man';
console.log(localStorage.Alex);

к ключу localStorage можно обращаться по синтаксису свойства объекта:
localStorage.Alex
'также его модно и менять, перезаписывать его значение
при этом нет необходимости отправлять его повторно через setItem
он мменяется автоматически' - мои личные наблюдения

!!! Классный пример для того, чтобы тоглить кнопку!
Пример работы с localStorage для реализауии тогла кнопки, которая переключает цвет формы

const checkbox = document.querySelector('#checkbox'),
      form = document.querySelector('form'),
      change = document.querySelector('#color');

if (localStorage.getItem('isChecked')) {
    checkbox.checked = true;
}

if (localStorage.getItem('bg') === 'changed') {
    form.style.backgroundColor = 'red';
}

checkbox.addEventListener('change', () => {
    localStorage.setItem('isChecked', true);
});

change.addEventListener('click', () => {
    if (localStorage.getItem('bg') === 'changed') {
        localStorage.removeItem('bg');
        form.style.backgroundColor = '';
    } else {
        localStorage.setItem('bg', 'changed');
        form.style.backgroundColor = 'red';
    }
});

при помещении в ключ localStorage каких-то массивов или объектов нужно переводить их в JSON (сериализация)
потому что при попытке получить оттуда данные, мы будем получать строку [object Object]


******************************************************
Регулярные выражения
******************************************************

new RegExp('pattern', 'flags');

реальный вариант:
/pattern/flag

pattern - шаблон/образец/тип, по котоорому мы будем работать в этом выражении
flag - уточнение к этому поиску/запросу к шаблону
i - игнорирует регистр букв в строке
g - работает не только с одним символом/элементом, но со всеми, которые попадают под заданный паттерн
m - работа с многострочными строками

флаги можно комбинировать все вместе

!!!
очень сильный метод для работы со строками - match()
возвращвет массив с заданными патернами, исходя из того, как настроены флаги
например

const ans = prompt('Введите свое имя');

здесь мы ищем в строке из prompt паттерн 'n', то есть буквы n, которые есть в имени

имя ANN
const reg = /n/i;
console.log(ans.match(reg));
>>["N", index: 1, input: "ANN", groups: undefined]

добавиим флаг g
const reg = /n/ig;
console.log(ans.match(reg));
>>(2) ["N", "N"]

!!!
/./
метод replace('что меняем', 'на что меняем')
замена одного куска стоки на другой. классно работает для подмены пароя на звездочки
регулярку вписываем прямо в аргументы метода

если в качестве паттерна наисать точку, то это подразумевает любой символ строки

например:

const pass = prompt('password');

console.log(pass.replace(/./g, '*'));
>> при вводе пароля в лог выводятся только звездочки`

если нужно найти именно точку, то в регулярке ее нужно экранировать обратным слешем:
/\./

еще один пример подмены с ходу:
console.log('23-07-80'.replace(/-/g, '.'));
>>23.07.80

метод непосредственно самих регулярных выражений test()
проверяет есть ли искомый патерн в строке, возвращает true/false

!!!
Классы регулярных выражений
\d - ищет только цифры
\w - ищет только слова
\s - ищет пробелы
\D - ищет все кроме цифр
\W - ищет все кроме слов

\ - и много других
больше по символах тут: https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Regular_Expressions

******************************************
ОБЬЕКТЫ. Геттеры и сеттеры
******************************************
Свойства обектов бывают свойствами данных и свойствами-акцессорами
геттеры позволяют получать значения свойста
сеттеры позволяют устанавливать значения свойств
get – функция без аргументов, которая сработает при чтении свойства,
set – функция, принимающая один аргумент, вызываемая при присвоении свойства,

это как метод объекта, который использует this, но при его вызове мы не используем скобки, 
а обращаемся к нему как свойству. Поэтому свойства-акцессоры

const persone = {
    name: 'Alex',
    age: 40,

    get userAge() {
        return this.age;
    }
};

console.log(persone.userAge);
>> 40

сеттер позволяет нам получать извне параметры, чтобы изменять/устанавливаьт значения свойств

const persone = {
    name: 'Alex',
    age: 40,

    get userAge() {
        return this.age;
    },

    set userAge(num) {
        this.age = num;
    }
};

console.log(persone.userAge = 30);
console.log(persone.userAge);
>>30
>>30

подробно https://learn.javascript.ru/property-accessors
let obj = {
  get propName() {
    // геттер, срабатывает при чтении obj.propName
  },

  set propName(value) {
    // сеттер, срабатывает при записи obj.propName = value
  }
};


*****************************************************************

Инкапсуляция

###
Инкапсуляция - скрытие функций программы (ее переменных, скриптов).
Мы можем взаимодействовать только с результатом ее работы

Объект хранит свое состояние в приватном порядке и только методы объекта имеют доступы к его изменению

Пример на функции-конструкторе:

function User(name, age) { //функция-конструктоор
    this.name = name;
    let userAge = age;
    
    this.say = function () {
        console.log(`Имя пользователя: ${this.name}, возраст ${userAge}`);
    };

    this.getAge = function() {
        return userAge;
    };

    this.setAge = function(age) {
        if (typeof age === 'number' && age > 0 && age < 110) {
            userAge = age;
        } else {
            console.log('Недопустимое значение');
        }
    };
}

const ivan = new User('Ivan', 27);// вызов функции конструктора
console.log(ivan.name);
console.log(ivan.getAge());

ivan.setAge(30);
ivan.setAge(300);
console.log(ivan.getAge());
ivan.say();
*********************

Пример на классах:

class User {
    constructor(name, age) {
        this.name = name;
        this._age = age;
        // у классов для инкапсуляции используется нижнее почеркивание перед именем свойства
        // потом для работы с объктом извне, выодятся гетеры и сетеры в отдельные методы
        // но если обартится к свойсту объекта через это нижнее подчеркивание, то уже никакой инкапсуляции нет
        // и мы можем изменять значение свойств объекта обходя геттеры и сеттеры
    }

    // новый, пока что эксперементальный вариант синтаксиса пердусматривает
    //       возможность создавать новые совйтсва класса вне конструктора:
    #surname = 'Vatamaniuk';
    // обращаться к такому свойству можно через this

    // для того чтоьы сделать свойства класса "приватными" используется символ #
    
    say() {
        console.log(`Имя пользователя: ${this.name} ${this.#surname}, возраст ${this._age}`);
    }

    get age() {
        return this._age;
    }

    set age(age) {
        if (typeof age === 'number' && age > 0 && age < 110) {
            this._age = age;
        } else {
            console.log('Недопустимое значение');
        }
    }
}

const ivan = new User('Ivan', 27);
// В классах обращение к сеттерам и геттерам идет через точку, как обращение к свойству объекта
// При это при вызове этого свойства, как логе например, это работает как гетер
// console.log(ivan.age);
// а при присваивании свойсту нового значения, работает как сетер
// ivan.age = 89;


*****************************************************************

Домашнее задание по инкапсуляции
обращение к приватным свойствам и их изменение

class Alex {
    constructor (name, age, proff) {
        this.name = name;
        this.age = age;
        this.proff = proff;
    }

    #famil = 'Vanamaniuk';

    do() {
        console.log(`${this.name} ${this.#famil} имеет ${this.age} лет, и работает как ${this.proff}`);
    }

    get familAlex() {
        return this.#famil;
    }

    set familAlex (surName) {
        this.#famil = surName;
    }
}

const alex = new Alex('Alex', 41, 'programmer');
alex.do();

console.log(alex.familAlex);
alex.familAlex = 'tarasiuk';
alex.do();

*****************************************************************
*/

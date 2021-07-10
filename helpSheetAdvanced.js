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
Чтобы не создавать отдельно два похожих обработчика - обернем все это в функцию, которую будем при необходимости вызывать

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
            //!!! ВАЖНО. при использовании XMLHttpRequest в связке с FormDate заголовки указываются автоматически. Если его указать, то при получении ответа от сервера мы получаем пустой объект от вместо объекта с теми данными, которые мы отправили через форму.
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


//Как получить в js данные с заполненной формы для отправки на сервер без стандартных итераций, переборов и создания объектов

// объект FormData()
// Можно использовать объект formData(), если данные, которые идут на не нужно передеваать в формате JSON

const form = new FormData(form) // form - это форма, с которой нужно забрать данные

Правильность верстки форм
Всегда при верстке форм ОБЯЗАТЕЛЬНО указывать атрибут [name="name"], главное чтобы значения не повторялись, но атрибут name обязан быть, иначе
FormData не сможет взять из такой формы значения и создать объект

******
Отправка данных в формате JSON

1. Обязательно прописываем заголовки
request.setRequestHeader('Content-type', 'application/json')
2. Для работы с FormData (а это не специфичный объект) придется сначала перевести его в стандартный объект
const object {};
object.forEach(function (value, key) => {
    object[key] = value;
});
3. Теперь можно трансформировать нормальный объект в JSON:
const json = JSON.stringify(object);
request.send(json)

*/
const inputUah = document.querySelector('#uah'),
    inputUsd = document.querySelector('#usd');

// Логика программы:
// при вводе числа в первом поле (UAH), в нижнем (USD) отображается результат в долларах
inputUah.addEventListener('input', () => {
    const request = new XMLHttpRequest();

    // request.open(метод GET или POST, url путь по которому будем делать запрос, async по умолчанию true, login, pass);
    request.open('GET', 'js/current.json');
    // заголовки
    request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    // запуск запроса
    request.send();

    // Свойства объекта XMLHttpRequest
    // status нашего запроса (page 404 и т.д.)
    // statusText текстовое описание ответа от сервера
    // response ответ сервера
    // readyState возвращает текущее состояние объекта XMLHttpRequest

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
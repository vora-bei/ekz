Проект реализован с помощью библиотек Backbone.js, Jquery.js, jquery.meio.mask.js, jquery.tools.min.js, underscore.js.
Реализован живой поиск,по дате, лектору,заголовку лекции. Поиск происходит по строчке разделенной пробелами,
 например "10.10.2011 Трошев" выдаст все строчки где дата 10.10.2011 или автор Трошев.
 Список отсортирован по дате + время,если добавляется новый элемент он вставляется на хронологически верное место.
 При переходе в режим печати фильтр не сбрасывается и можно распечатать только нужные записи.

Формат экспорта данных (id не обязателен)
```
{
	"schema":["date", "time", "title", "abstract", "presenter", "presentation", "id"],
	"data":[
		["15.09.2012", "12:00", "Общий цикл разработки ", "первая лекция", "Михаил Трошев", "<a href='http://yadi.sk/d/VDsJ4ZUBiq6u'>Презентация лекции</a> <br><a href='http://static.video.yandex.ru/lite/ya-events/yb1ix4ck06.4829'>Видео</a><br><a href='http://yadi.sk/d/Lr0Y4WO606jTc'>Видео для скачивания</a>"],
		["15.09.2012", "13:00", "Системы ведения задач", "Task Tracker", "Сергей Бережной", "<a href='http://yadi.sk/d/D5xTwoIciq6c'>Презентация лекции</a>"],
		["15.09.2012", "14:00", "Системы ведения задач", "Wiki", "Сергей Бережной", "<a href='http://yadi.sk/d/7F9PuECdiq6G'>Презентация лекции</a>"],
		["18.09.2012", "19:00", "Командная строка Unix", "bash,dash,sh", "Виктор Ашик", "<a href='http://yadi.sk/d/3N0d6h9rlRA8'>Презентация лекции</a> <br><a href='http://static.video.yandex.ru/lite/ya-events/qxv95xwi4q.4820'>Видео</a><br><a href='http://yadi.sk/d/O5OBYxHwnGTw'>Видео для скачивания</a>"],
		["18.09.2012", "20:00", "Редакторы кода ", "Редакторы/Средства разработки", " Вячеслав Олиянчук", "<a href='https://github.com/yandex-shri/lectures/blob/master/05-editors.md'>Презентация лекции</a> <br><a href='http://static.video.yandex.ru/lite/ya-events/h4kt5t9a07.4101'>Видео</a><br><a href='http://yadi.sk/d/f3CYmlG3nGSC'>Видео для скачивания</a>"],
		["20.09.2012", "19:00", "Браузеры", "браузерные войны", "Георгий Мостоловица", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=171'>Браузеры</a>"],
		["20.09.2012", "20:00", "Системы контроля версий", "git,mercurial", "Сергей Сергеев", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=173'>Системы контроля версий</a>"],
		["22.09.2012", "12:00", "Тестирование", "Взрыв,кишкиб рас..", "Марина Широчкина", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=173'>Системы контроля версий</a>"],
		["22.09.2012", "13:00", "Развертывание верстки ", "deploy", "Павел Пушкарев", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=261'>Развертывание верстки</a>"],
		["22.09.2012", "14:00", "HTTP-протокол ", "", "Алексей Бережной", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=262'>HTTP-протокол</a>"],
		["24.09.2012", "18:00", "XSLT (факультативная)", "xslt", "Сергей Пузанков", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=404'>XSLT</a>"],
		["25.09.2012", "19:00", "Механизм работы браузера", "рендеринг", "Роман Комаров", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=492'>Механизм работы браузера</a>"],
		["25.09.2012", "20:00", "Кеширование на клиенте и сервере", "cookies", "Егор Львовский", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=493'>Кеширование на клиенте и сервере</a>"],
		["27.09.2012", "19:00", "Безопасность веб-приложений", "", "Тарас Иващенко", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=548'>Безопасность веб-приложений</a>"],
		["27.09.2012", "20:00", "Языки программирования ", "lisp", "Алексей Воинов", "<a href='http://yadi.sk/d/LRpqvLuIv4UI'>Презентация лекции</a>"],
		["29.09.2012", "12:00", "JS. Базовые знания", "синтаксис", "Михаил Давыдов", "-"],
		["29.09.2012", "13:00", "Транспорт. AJAX", "ajax ...", "Михаил Давыдов", "-"],
		["29.09.2012", "14:00", "JS. Асинхронность", "node.js", "Михаил Давыдов", "-"],
		["2.10.2012", "19:00", "Отладка кода", "debug", "Алексей Андросов", "-"],
		["4.10.2012", "19:00", "Клиентская оптимизация", "", "Иван Карев", "-"],
		["4.10.2012", "20:00", "Profiler", "", "Михаил Корепанов", "-"],
		["6.10.2012", "12:00", "Регулярные выражения", "regexp", "Максим Ширшин", "-"],
		["6.10.2012", "13:00", "CSS", "Магия", "Михаил Трошев", "-"],
		["9.10.2012", "19:00", "Фреймворки. Обзор", "jquery ...", "Алексей Андросов", "-"],
		["9.10.2012", "20:00", "jQuery", "...", "Алексей Бережной", "-"],
		["11.10.2012", "19:00", "БЭМ (2 лекции)", "БЭМ", "Владимир Варанкин", "-"],
		["13.10.2012", "12:00", "Шаблонизаторы", "XSLT", "Сергей Бережной ", "-"],
		["13.10.2012", "13:00", "Дизайн", "дизайн", "Константин Горский", "-"],
		["13.10.2012", "14:00", "Дизайн глазами разработчика", "дизайн", "Михаил Трошев", "-"]
	]
}

```
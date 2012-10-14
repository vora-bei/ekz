$(function(){
	var calendarCollection = new ItemList;
	var calendarView = new mainApp({el:document.getElementById('list'), collection:calendarCollection})
	var filterView = new Filter({name:'all', el:document.getElementById('search'), collection:calendarCollection})
});

/* Filter
 View имеющая ссылку на коллекцию календаря и вызывающая метод collection.search()
 -----------------------------------------------------------------------------*/
var Filter = Backbone.View.extend({
	template:_.template($('#filter').html()),
	timer:0,
	events:{
		"keyup .filter":'filter',
		"click .filter-button-click":'Timer'
	},
	name:'filter',
	initialize:function (options) {
		!options.name || (this.name = options.name);
		if ((options != undefined) && (options.filter != undefined))
			this.filter_param = options.filter;
		this.render();
	},
	render:function () {
		this.$el.append(this.template({name:this.name, filter:this.filter_param}));
		return this;
	},
	Timer:function () {
		var a = this.collection.search();
		clearTimeout(this.timer)
	},
	filter:function (a) {
		var val = this.$('.filter');
		this.collection.filter[val.attr('name')] = val.val();
		var $context = this;
		clearTimeout(this.timer)
		this.timer = setTimeout(function () {
			$context.Timer()
		}, 500)
		if (val.val().length >= 6 || val.val().length == 0) {

			this.collection.search();
			clearTimeout(this.timer)
		}
	}


});


/* mainApp
View  строящая список календаря используя данные коллекции
 -----------------------------------------------------------------------------*/
var mainApp = Backbone.View.extend({
	list:[],
	initialize:function () {//инициализация
		this.initRender();
		this.render('list');
		this.initHead();
		this.collection.on('reset', this.render, this);//навешивание обработчика событий от коллекции
		this.collection.on('add', this.render, this);
		this.collection.fetch();
	},

	events:{//DOM события
		'click .import':'toggleImport',
		'click .export':'toggleExport',
		'click .add-elem':'toggleAdd',
		'click .create':'createLine',
		'click .print':'togglePrint',
		'submit .import-frame form':'submitImport'
	},
	render:function (list) {//Отрисовка коллекции календаря и применение к ним фильтра
		var collection = this.collection;
		this.resetRender(this.listName);
		this.renderList(this.elem, collection, this.item, this.listName);
		this.collection.search()
		return this;
	},
	resetRender:function (list) {//Удаление старых view
		var length = this[list].length
		for (var i = 0; i < length; i++)
			this[list][i].remove();
		this[list] = [];
	},

	renderList:function (elem, collection, item, list) {// итерация по коллекции и создание под каждый элемент списка своей view инкапсулирующей логику
		if (!_.isEmpty(collection) && !_.isEmpty(collection.models))
			collection.each(function (num, i) {
				var view = new item({model:num, self:this});
				this[list][i] = view;
				this.$(elem).append(view.render().el);
			}, this);
		else {
			var view = new item({model:new Backbone.Model()});
			this.$(elem).append(view.render_not_item().el);
			this[list][0] = view;

		}
	},
	initRender:function () {
		this.elem = this.$('.calendar_list'),
			this.item = this._item,
			this.listName = 'list';
	},
	initHead:function () {
		this.$('.import-frame').hide();
		this.$('.export-frame').hide();
		this.$('.add-frame').hide();
		this.$(":date").dateinput();
		this.$(".time")
			.setMask("29:59")
				.keypress(mask);
	},
	toggleImport:function () {//Переключение вкладки импорта
		this.$('.import-frame').slideToggle('300')
		return false;
	},
	toggleAdd:function () {//Переключение вкладки добавления
		this.$('.add-frame').slideToggle('300')
		return false;
	},
	toggleExport:function () {//Переключение вкладки экспорта
		this.$('.export-input').html(htmlSpecialChars(this.collection.localStorage.export()))
		this.$('.export-frame').slideToggle('300')
		return false;
	},
	togglePrint:function () {//Переключение вкладки печати
		$('#search, header, .print-hide').toggle();
		$('.editing').removeClass('editing');
		$('.import-frame,.export-frame,.add-frame').hide();
	},

	createLine:function () {//Создание нового элемента списка
		var $self = this, $this, value, item = {};
		var frame = this.$('.add-frame')
		$('[name]', frame).each(function () {
			$this = $(this)
			item[$this.attr('name')] = $this.attr('value');
		})
		this.collection.create(item)
		frame.hide()
	},

	submitImport:function () {//Импорт
		var form = this.$('form', '.import-frame');
		var imp = $('textarea[name="import"]', form);
		this.collection.import(JSON.parse(imp.val()))
		imp.val('');
		this.$('.import-frame').slideUp()
		return false;
	},


	_item:Backbone.View.extend({// View  отвечающая за элементы списка

		template:_.template($('#item').html()),//Шаблоны
		template_not_item:_.template($('#not_item').html()),
		tagName:'tr',
		initialize:function (options) {
			this.model.on('destroy', this.lazy_remove, this);
			this.model.on('sync', this.render, this);
			this.model.on('hidden', this.hidden, this);//Событие модели срабатывающие при фильтрации

		},
		events:{
			"click .destroy":'destroy',
			"click .toggle":'toggle'
		},
		render_not_item:function () {//Пустой список
			if (!_.isEmpty(this.model)) {
				var item = this.model.toJSON();
				var template = $(this.template_not_item({data:item}))
				this.copyAttr(template, this.$el)
				this.$el.html(template.html())
				return this;
			}
		},

		render:function () {
			this._render_item();
			this.$(":date").dateinput();
			this.$(".time").setMask("29:59")
				.keypress(mask);
			return this
		},

		_render_item:function () {
			if (!_.isEmpty(this.model)) {
				var item = this.model.toJSON();
				var template = $(this.template({data:item}))
				this.copyAttr(template, this.$el)
				this.$el.html(template.html())
				return this;
			}
		},
		copyAttr:function (from, to) {
			var attributes = from.get(0).attributes
			var attr = {};
			_.each(attributes, function (item) {
				attr[item.nodeName] = item.value;
			}, this)
			to.attr(attr)
		},

		lazy_remove:function () {//Срабатывает когда модель удаляется из коллекции
			this.$el.slideUp('slow');
			this.model = null;
			this.$el.html('');
		},

		destroy:function () {//Удаление модели
			this.model.destroy({wait:true});
			return false;
		},
		toggle:function (e) {//Переключение режима редактирования и отображения
			if (!this.$el.hasClass('editing')) {
				this.$el.addClass('editing')
			} else {
				var $self = this,
					$this,
					value;
				this.$('[name]').each(function () {
					$this = $(this)
					$self.model.set($this.attr('name'), $this.attr('value'))

				})
				this.model.save()
				this.$el.removeClass('editing')
			}
		},
		hidden:function (is_hide) {//фильтрация
			this.$el.toggle(is_hide)
		}
	})

})
/* Прослойка над localstorage rest-api(дописанная методами import и export )
 -----------------------------------------------------------------------------*/
function S4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
;

function guid() {
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
;


var Store = function (name) {
	this.name = name;
	var store = localStorage.getItem(this.name);
	this.data = (store && JSON.parse(store)) || {};
};

_.extend(Store.prototype, {

	save:function () {
		localStorage.setItem(this.name, JSON.stringify(this.data));
	},
	create:function (model) {
		if (!model.id) model.id = model.attributes.id = guid();
		this.data[model.id] = model;
		this.save();
		return model;
	},
	reset:function (data) {
		this.data = data;
		this.save();
		return data;
	},
	update:function (model) {
		this.data[model.id] = model;
		this.save();
		return model;
	},
	find:function (model) {
		return this.data[model.id];
	},
	findAll:function () {
		return _.values(this.data);
	},
	destroy:function (model) {
		delete this.data[model.id];
		this.save();
		return model;
	},
	export:function () {
		var store = localStorage.getItem(this.name),
			schema = localStorage.getItem(this.name + '.schema'),
			data = {schema:[], data:[]};

		store = (store && JSON.parse(store)) || {};
		data.schema = (store && JSON.parse(schema)) || {};
		data.data = _.map(store, function (num) {
			return _.values(num);
		}, this)
		return JSON.stringify(data, {}, ' ')
	},
	import:function (data) {
		if (!(data && data.schema && data.data)) {
			conslole.log('ошибка формата данных')
			return false;
		}
		var list = data.data,
			tempItem = {},
			schema = data.schema
		lengthShema = schema.length,
			lengthData = list.length,
			listTemp = {};

		for (var i = 0; i < lengthData; i++) {
			tempItem = {}
			for (var j = 0; j < lengthShema; j++)
				tempItem[schema[j]] = list[i][j]
			if (!tempItem.id) tempItem.id = guid();
			listTemp[tempItem.id] = tempItem
		}
		this.saveImport(listTemp,schema)
	},
	saveImport:function(data,schema){
		this.data = data;
		localStorage.setItem(this.name, JSON.stringify(this.data));
		localStorage.setItem(this.name + '.schema', JSON.stringify(schema));
	}
});

/* Переопределени BacboneSync для работы с LocalStorage api
 -----------------------------------------------------------------------------*/
Backbone.sync = function (method, model, options) {

	var resp;
	var store = model.localStorage || model.collection.localStorage;

	switch (method) {
		case "read":
			options.import ? store.import(options.data) : '';
			resp = model.id ? store.find(model) : store.findAll();
			break;
		case "create":

			resp = store.create(model);
			break;
		case "update":
			resp = store.update(model);
			break;
		case "delete":
			resp = store.destroy(model);
			break;
		case "reset":
			resp = store.reset(model);
			break;
	}

	if (resp) {//callback
		options.success(resp);
	} else {
		options.error("Record not found");
	}
};
/* Модель
 -----------------------------------------------------------------------------*/
var Item = Backbone.Model.extend({
});
/* Коллекция
 -----------------------------------------------------------------------------*/
var ItemList = Backbone.Collection.extend({

	model:Item,
	filter:{all:''},
	localStorage:new Store("calendar-backbone"),
	import:function (data) {
		this.fetch({data:data, import:true})
	},
	comparator:function (model) {//Определение сортировки колллекции по дате
		var date = new Date(model.get('date') + model.get('time'))
		return date.getTime();
	},
	search:function () {//фильтр разбирающий строчку по пробелам и ищущий совпадения по каждому слову
		var filter = this.filter.all.split(' ');
		return _.each(this.models, function (num, key) {
			var is_find = _.any(filter, function (i) {
					if (_.isEmpty(i) && filter.length != 1)return false;
					var findString = num.get('date') + ' ' + num.get('presenter') + ' ' + num.get('title')
					return findString.indexOf(i) + 1;
				},
				this)
			is_find ? num.trigger('hidden', true) : num.trigger('hidden', false);//тригерит модель, и view  подписана на это событие
		}, this)
	}
});



/*Настройка  dateinput и jquery.meio.mask.js
 -----------------------------------------------------------------------------*/
$.tools.dateinput.localize("ru", {
	months:'Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь',
	shortMonths:'Янв,Фев,Мар,Апр,Май,Июн,Июл,Авг,Сен,Окт,Ноя,Дек',
	days:'воскресенье,понедельник,вторник,среда,четверг,пятница,суббота',
	shortDays:'Вс,Пн,Вт,Ср,Чт,Пт,Сб'
});
$.tools.dateinput.conf.lang = 'ru';
$.tools.dateinput.conf.format = 'dd/mm/yyyy';

function mask() {//Маска на время
	var currentMask = $(this).data('mask').mask;
	var newMask = $(this).val().match(/^2.*/) ? "23:59" : "29:59";
	if (newMask != currentMask) {
		$(this).setMask(newMask);
	}
}
/*vendor
 -----------------------------------------------------------------------------*/
// Задаем функцию.
// Первый параметр: строка
// Второй параметр: нужно ли отменить перевод
var htmlSpecialChars = function(string, reverse)
{

	// specialChars это список символов и их сущностей
	// specialChars["<"] = "&lt;";
	// x — простая переменная, используемая в циклах
	var specialChars = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;"
	}, x;

	// Если мы отменяем перевод
	if (typeof(reverse) != "undefined")
	{

		// Нужно создать временный массив
		reverse = [];

		// Помещаем каждый специальный символ в массив
		for (x in specialChars)
			reverse.push(x);

		// Создаем обратный массив
		// ["<", ">"] становится [">", "<"]
		reverse.reverse();

		// Для каждого специального символа:
		for (x = 0; x < reverse.length; x++)

			// Заменяем все экземпляры (g) сущности оригиналом
			// если x = 1, то
			// reverse[x] = reverse[1] = ">";
			// specialChars[reverse[x]] = specialChars[">"] = "&gt;";
			string = string.replace(
				new RegExp(specialChars[reverse[x]], "g"),
				reverse[x]
			);

		// Получаем оригинальную строку
		return string;
	}

	// Если нам нужно не получать оригинал, а перевести строку в сущности
	// Для каждого специального символа:
	for (x in specialChars)

		// Заменяем все экземпляры специального символа его сущностью
		// Запомните, в отличие от обратного алгоритма, где x была числом
		// здесь х это необходимый символ (&, <, > или ")
		string = string.replace(new RegExp(x, "g"), specialChars[x]);

	// Получаем переведенную строку.
	return string;
};

/*Формат данных для импорта
 -----------------------------------------------------------------------------*/
var a= {
	"schema":["date", "time", "title", "abstract", "presenter", "presentation", "id"],
"data":[
	["15/09/2012", "12:00", "Общий цикл разработки ", "первая лекция", "Михаил Трошев", "<a href='http://yadi.sk/d/VDsJ4ZUBiq6u'>Презентация лекции</a> <br><a href='http://static.video.yandex.ru/lite/ya-events/yb1ix4ck06.4829'>Видео</a><br><a href='http://yadi.sk/d/Lr0Y4WO606jTc'>Видео для скачивания</a>"],
	["15/09/2012", "13:00", "Системы ведения задач", "Task Tracker", "Сергей Бережной", "<a href='http://yadi.sk/d/D5xTwoIciq6c'>Презентация лекции</a>"],
	["15/09/2012", "14:00", "Системы ведения задач", "Wiki", "Сергей Бережной", "<a href='http://yadi.sk/d/7F9PuECdiq6G'>Презентация лекции</a>"],
	["18/09/2012", "19:00", "Командная строка Unix", "bash,dash,sh", "Виктор Ашик", "<a href='http://yadi.sk/d/3N0d6h9rlRA8'>Презентация лекции</a> <br><a href='http://static.video.yandex.ru/lite/ya-events/qxv95xwi4q.4820'>Видео</a><br><a href='http://yadi.sk/d/O5OBYxHwnGTw'>Видео для скачивания</a>"],
	["18/09/2012", "20:00", "Редакторы кода ", "Редакторы/Средства разработки", " Вячеслав Олиянчук", "<a href='https://github.com/yandex-shri/lectures/blob/master/05-editors.md'>Презентация лекции</a> <br><a href='http://static.video.yandex.ru/lite/ya-events/h4kt5t9a07.4101'>Видео</a><br><a href='http://yadi.sk/d/f3CYmlG3nGSC'>Видео для скачивания</a>"],
	["20/09/2012", "19:00", "Браузеры", "браузерные войны", "Георгий Мостоловица", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=171'>Браузеры</a>"],
	["20/09/2012", "20:00", "Системы контроля версий", "git,mercurial", "Сергей Сергеев", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=173'>Системы контроля версий</a>"],
	["22/09/2012", "12:00", "Тестирование", "Взрыв,кишкиб рас..", "Марина Широчкина", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=173'>Системы контроля версий</a>"],
	["22/09/2012", "13:00", "Развертывание верстки ", "deploy", "Павел Пушкарев", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=261'>Развертывание верстки</a>"],
	["22/09/2012", "14:00", "HTTP-протокол ", "", "Алексей Бережной", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=262'>HTTP-протокол</a>"],
	["24/09/2012", "18:00", "XSLT (факультативная)", "xslt", "Сергей Пузанков", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=404'>XSLT</a>"],
	["25/09/2012", "19:00", "Механизм работы браузера", "рендеринг", "Роман Комаров", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=492'>Механизм работы браузера</a>"],
	["25/09/2012", "20:00", "Кеширование на клиенте и сервере", "cookies", "Егор Львовский", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=493'>Кеширование на клиенте и сервере</a>"],
	["27/09/2012", "19:00", "Безопасность веб-приложений", "", "Тарас Иващенко", "<a href='http://clubs.ya.ru/4611686018427468886/replies.xml?item_no=548'>Безопасность веб-приложений</a>"],
	["27/09/2012", "20:00", "Языки программирования ", "lisp", "Алексей Воинов", "<a href='http://yadi.sk/d/LRpqvLuIv4UI'>Презентация лекции</a>"],
	["29/09/2012", "12:00", "JS. Базовые знания", "синтаксис", "Михаил Давыдов", "-"],
	["29/09/2012", "13:00", "Транспорт. AJAX", "ajax ...", "Михаил Давыдов", "-"],
	["29/09/2012", "14:00", "JS. Асинхронность", "node.js", "Михаил Давыдов", "-"],
	["2/10/2012", "19:00", "Отладка кода", "debug", "Алексей Андросов", "-"],
	["4/10/2012", "19:00", "Клиентская оптимизация", "", "Иван Карев", "-"],
	["4/10/2012", "20:00", "Profiler", "", "Михаил Корепанов", "-"],
	["6/10/2012", "12:00", "Регулярные выражения", "regexp", "Максим Ширшин", "-"],
	["6/10/2012", "13:00", "CSS", "Магия", "Михаил Трошев", "-"],
	["9/10/2012", "19:00", "Фреймворки. Обзор", "jquery ...", "Алексей Андросов", "-"],
	["9/10/2012", "20:00", "jQuery", "...", "Алексей Бережной", "-"],
	["11/10/2012", "19:00", "БЭМ (2 лекции)", "БЭМ", "Владимир Варанкин", "-"],
	["13/10/2012", "12:00", "Шаблонизаторы", "XSLT", "Сергей Бережной ", "-"],
	["13/10/2012", "13:00", "Дизайн", "дизайн", "Константин Горский", "-"],
	["13/10/2012", "14:00", "Дизайн глазами разработчика", "дизайн", "Михаил Трошев", "-"]
]
}





/**
 * Created with JetBrains PhpStorm.
 * User: Администратор
 * Date: 06.10.12
 * Time: 23:53
 * To change this template use File | Settings | File Templates.
 */


var mainApp = Backbone.View.extend({
	list:[],
	initialize:function () {
		this.initRender();
		this.render('list');
		this.initHead();
		this.collection.on('reset', this.render, this);
		this.collection.on('add', this.render, this);
		this.collection.fetch();
	},

	events:{
		'click .import': 'toggleImport',
		'click .export': 'toggleExport',
		'click .add-elem': 'toggleAdd',
		'click .create': 'createLine',
		'click .print': 'togglePrint',
		'submit .import-frame form': 'submitImport'
	},
	render:function (list) {
		var collection = this.collection;
		this.resetRender(this.listName);
		this.renderList(this.elem, collection, this.item, this.listName);
		this.collection.search()
		return this;
	},
	resetRender:function (list) {
		var length = this[list].length
		for (var i = 0; i < length; i++)
			this[list][i].remove();
		this[list] = [];
	},

	renderList:function (elem, collection, item, list) {
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
	initRender:function(){
		this.elem = this.$('.calendar_list'),
		this.item = this._item,
		this.listName = 'list';
	},
	initHead: function(){
		this.$('.import-frame').hide();
		this.$('.export-frame').hide();
		this.$('.add-frame').hide();
		this.$(":date").dateinput({lang:'ru'});
		this.$(".time").setMask("29:59")
			.keypress(function () {
				var currentMask = $(this).data('mask').mask;
				var newMask = $(this).val().match(/^2.*/) ? "23:59" : "29:59";
				if (newMask != currentMask) {
					$(this).setMask(newMask);
				}
			});
	},
	toggleImport : function(){
		this.$('.import-frame').slideToggle('300')
		return false;
	},
	toggleAdd : function(){
		this.$('.add-frame').slideToggle('300')
		return false;
	},
	createLine:function(){
		var $self = this,$this,value,item={};
		var frame=this.$('.add-frame')
		$('[name]',frame).each(function () {
			$this = $(this)
			item[$this.attr('name')]=$this.attr('value');
		})
		this.collection.create(item)
		frame.hide()
	},
	toggleExport : function(){
		this.$('.export-input').html(this.collection.localStorage.export())
		this.$('.export-frame').slideToggle('300')
		return false;
	},
	togglePrint:function(){
		$('#search, header, .print-hide').toggle();
		$('.editing').removeClass('editing');
		$('.import-frame,.export-frame,.add-frame').hide();
	},
	submitImport : function(){
		var form=this.$('form','.import-frame');
		var imp=$('textarea[name="import"]',form);
		this.collection.import(JSON.parse(imp.val()))
		imp.val('');
		this.$('.import-frame').slideUp()
		return false;
	},


	_item:Backbone.View.extend({

		template:_.template($('#item').html()),
		template_not_item:_.template($('#not_item').html()),
		tagName:'tr',
		initialize:function (options) {
			this.model.on('destroy', this.lazy_remove, this);
			this.model.on('sync', this.render, this);
			this.model.on('hidden', this.hidden, this);

		},
		events:{
			"click .destroy":'destroy',
			"click .toggle":'toggle'
		},
		render_not_item:function () {
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
			this.$(":date").dateinput({lang:'ru'});
			this.$(".time").setMask("29:59")
				.keypress(function () {
					var currentMask = $(this).data('mask').mask;
					var newMask = $(this).val().match(/^2.*/) ? "23:59" : "29:59";
					if (newMask != currentMask) {
						$(this).setMask(newMask);
					}
				});
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

		lazy_remove:function () {
			this.$el.slideUp('slow');
			this.model = null;
			this.$el.html('');
		},

		destroy:function () {
			this.model.destroy({wait:true});
			return false;
		},
		toggle:function (e) {
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
		hidden: function(is_hide){
			this.$el.toggle(is_hide)
		}
	})


})


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
		var a=this.collection.search();
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











// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Generate four random hex digits.
function S4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
;

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
;

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
var Store = function (name) {
	this.name = name;
	var store = localStorage.getItem(this.name);
	this.data = (store && JSON.parse(store)) || {};
};

_.extend(Store.prototype, {

	// Save the current state of the **Store** to *localStorage*.
	save:function () {
		localStorage.setItem(this.name, JSON.stringify(this.data));
	},

	// Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
	// have an id of it's own.
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

	// Update a model by replacing its copy in `this.data`.
	update:function (model) {
		this.data[model.id] = model;
		this.save();
		return model;
	},

	// Retrieve a model from `this.data` by id.
	find:function (model) {
		return this.data[model.id];
	},

	// Return the array of all models currently in storage.
	findAll:function () {
		return _.values(this.data);
	},

	// Delete a model from `this.data`, returning it.
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
		data.data=_.map(store,function(num){
			return _.values(num);
		},this)
		return JSON.stringify(data,{},' ')

	},
	import:function (data) {
		if (!(data && data.schema && data.data)) {
			conslole.log('ошибка формата данных')
			return false;
		}
		var lengthShema = 0,
			lengthData = 0,
			list = [],
			tempItem = {},
			schema = data.schema
		list = data.data,
			listTemp = {};


		lengthShema = schema.length;
		lengthData = list.length;
		for (var i = 0; i < lengthData; i++) {
			tempItem = {}
			for (var j = 0; j < lengthShema; j++) {
				tempItem[schema[j]] = list[i][j]

			}
			if (!tempItem.id) tempItem.id = guid();
			listTemp[tempItem.id] = tempItem
		}
		this.data = listTemp;
		localStorage.setItem(this.name, JSON.stringify(this.data));
		localStorage.setItem(this.name + '.schema', JSON.stringify(schema));
	}


});

$.tools.dateinput.localize("ru", {
	months:'Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь',
	shortMonths:'Янв,Фев,Мар,Апр,Май,Июн,Июл,Авг,Сен,Окт,Ноя,Дек',
	days:'воскресенье,понедельник,вторник,среда,четверг,пятница,суббота',
	shortDays:'Вс,Пн,Вт,Ср,Чт,Пт,Сб'
});
$.tools.dateinput.conf.lang = 'ru';
$.tools.dateinput.conf.format = 'dd/mm/yyyy';



var dataElem={
	"schema":["date","time","title","abstract","presenter","presentation","id"],
	"data":[
		["15/09/13","12:00","Общий цикл разработки ","","Михаил Трошев","Итак, первая лекция — «Общий цикл разработки», лектор Миша Трошев (mishanga).Презентация лекции: http://yadi.sk/d/VDsJ4ZUBiq6u Видео — http://static.video.yandex.ru/lite/ya-events/yb1ix4ck06.4829 Видео для скачивания — http://yadi.sk/d/Lr0Y4WO606jTc"],["15/09/12","","title","abstract","presenter","presentation1"],["10/16/12","","title","abstract","presenter","presentation2"],
		["10/16/12","","title","abstract","presenter","presentation3"],
		["10/16/12","","title","abstract","presenter","presentation4"],
		["10/16/12","","title ","abstract","presenter","presentation5"]
	]
}

// Override `Backbone.sync` to use delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
Backbone.sync = function (method, model, options) {

	var resp;
	var store = model.localStorage || model.collection.localStorage;

	switch (method) {
		case "read":
			options.import ? store.import(options.data) : '';
			options.exp=options.export ? store.export(options.data) : '';
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

	if (resp) {
		options.success(resp);
	} else {
		options.error("Record not found");
	}
};


var Item = Backbone.Model.extend({
	defaults:function () {
		return {

		};
	},
	initialize:function () {

	}
});

var ItemList = Backbone.Collection.extend({

	model:Item,
	filter:{all:''},
	localStorage:new Store("calendar-backbone"),
	import:function (data) {
		this.fetch({data:data, import:true})
	},
	import:function (data) {
		this.fetch({data:data, export:true})
	},
	comparator:function(model){
		var date=new Date(model.get('date')+model.get('time'))
			return date.getTime();
	},
	search:function () {
		var filter=this.filter.all.split(' ');
		return _.each(this.models,function(num,key){
			var is_find= _.any(filter,function(i){
					if(_.isEmpty(i)&&filter.length!=1)return false;
					var findString= num.get('date')+' '+num.get('presenter')+' '+num.get('title')
					return findString.indexOf(i) + 1;
				},
				this)
			is_find?num.trigger('hidden',true):num.trigger('hidden',false)
		},this)
	}


});










var calendarCollection = new ItemList;
var calendarView = new mainApp({el:document.getElementById('list'), collection:calendarCollection})
var filterView = new Filter({name:'all', el:document.getElementById('search'), collection:calendarCollection})
/**
 * Created with JetBrains PhpStorm.
 * User: Администратор
 * Date: 06.10.12
 * Time: 23:53
 * To change this template use File | Settings | File Templates.
 */




// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Generate four random hex digits.
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
var Store = function(name) {
    this.name = name;
    var store = localStorage.getItem(this.name);
    this.data = (store && JSON.parse(store)) || {};
};

_.extend(Store.prototype, {

    // Save the current state of the **Store** to *localStorage*.
    save: function() {
        localStorage.setItem(this.name, JSON.stringify(this.data));
    },

    // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
    // have an id of it's own.
    create: function(model) {
        if (!model.id) model.id = model.attributes.id = guid();
        this.data[model.id] = model;
        this.save();
        return model;
    },
    reset: function(data) {
        this.data = data;
        this.save();
        return data;
    },

    // Update a model by replacing its copy in `this.data`.
    update: function(model) {
        this.data[model.id] = model;
        this.save();
        return model;
    },

    // Retrieve a model from `this.data` by id.
    find: function(model) {
        return this.data[model.id];
    },

    // Return the array of all models currently in storage.
    findAll: function() {
        return _.values(this.data);
    },

    // Delete a model from `this.data`, returning it.
    destroy: function(model) {
        delete this.data[model.id];
        this.save();
        return model;
    },

    export: function(){
        var store = localStorage.getItem(this.name),
        schema = localStorage.getItem(this.name+'.schema'),
        data={schema: [], data:[]};

        store = (store && JSON.parse(store)) || {};
        data.schema = (store && JSON.parse(schema)) || {};

        var lengthData= store.length;
        for(var i=0;i<lengthData;i++){
            data.data.push(_.values(store[i]))
        }
        return JSON.stringify(data)

    },
    import: function(data){
        if(!(data && data.schema && data.data)){
            conslole.log('ошибка формата данных')
            return false;
        }
        var lengthShema= 0,
            lengthData= 0,
            data=[],
            tempItem={},
            schema=data.schema
            data=data.data;


        lengthShema= data.schema.length;
        lengthData= data.data.length;
        for(var i=0;i<lengthData;i++){
            tempItem={}
            for(var j=0;j<lengthShema;j++){
               tempItem[schema]=data[i][j]

            }
            tempItem.id=guid();
            data.push(tempItem)
        }
        this.data=data;
        localStorage.setItem(this.name, JSON.stringify(this.data));
        localStorage.setItem(this.name+'.schema', JSON.stringify(schema));
    }


});


var data=
{
    schema: ['date', 'time', 'title', 'abstract', 'presenter', 'presentation','id'],
    data:
        [
            ['10 октября 2011', 'time', 'title', 'abstract', 'presenter', 'presentation'],
            ['10 октября 2012', 'time', 'title', 'abstract', 'presenter', 'presentation1'],
            ['10 октября 2010', 'time', 'title', 'abstract', 'presenter', 'presentation2'],
            ['11 октября 2011', 'time', 'title', 'abstract', 'presenter', 'presentation3'],
            ['14 октября 2011', 'time', 'title', 'abstract', 'presenter', 'presentation4'],
            ['17 октября 2011', 'time', 'title', 'abstract', 'presenter', 'presentation5']

        ]
}



// Override `Backbone.sync` to use delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
Backbone.sync = function(method, model, options) {

    var resp;
    var store = model.localStorage || model.collection.localStorage;

    switch (method) {
        case "read":    resp = model.id ? store.find(model) : store.findAll(); break;
        case "create":  resp = store.create(model);                            break;
        case "update":  resp = store.update(model);                            break;
        case "delete":  resp = store.destroy(model);                           break;
        case "reset":  resp = store.reset(model);                           break;
    }

    if (resp) {
        options.success(resp);
    } else {
        options.error("Record not found");
    }
};



var mainApp=Backbone.View.extend({
    list : [],
    render: function(elem,collection,item,list) {
        var collection=this,
            elem=this.el;
        this.resetRender(list);
        this.renderList(elem,collection,item,list);
        $(window).trigger('resize');
        return this;
    },
    resetRender: function(list){
        var length = this[list].length
        for(var i=0;i<length;i++)
            this[list][i].remove();
        this[list]=[];
    },

    renderList: function(elem,collection,item,list){
        var coll = collection;
        if(!_.isEmpty(coll)&&!_.isEmpty(coll.models))
            coll.each(function(num,i){
                var    view = new item({model: num, self : this});
                this[list][i]=view;
                this.$(elem).append(view.render().el);
            },this);
        else
        {

            var view = new item({model: new TiragSales.Models.orgs()});
            this.$(elem).append(view.render_not_item().el);
            this[list][0]=view;
        }
    },



    _item:  {

    template: JST['sales/payms/assign_payms'],
    template_not_item: JST['sales/payms/not/item_payms'],
    tagName:  "tr",

    _initialize: function(options){
        this.model.on('sync',this.render,this);
        this.self=this.options.self;
    },
    events: {
    },
    render_not_item: function() {
        if(!_.isEmpty(this.model)){
            var item =this.model.toJSON();
            var template=$(this.template_not_item({data : item}))
            this.copyAttr(template,this.$el)
            this.$el.html(template.html())
            return this;
        }
    },

    render: function(){
        this._render_item()
        return this
    },

    _render_item: function() {
        if(!_.isEmpty(this.model)){
            var item =this.model.toJSON();
            var template=$(this.template({data : item}))
            this.copyAttr(template,this.$el)
            this.$el.html(template.html())
            return this;
        }
    },
    copyAttr: function(from,to){
        var attributes = from.get(0).attributes
        var  attr={};
        _.each(attributes,function(item){
            attr[item.nodeName]=item.value;
        },this)
        to.attr(attr)
    }
}


})


TiragSales.Views.Filter = Backbone.View.extend(TiragSales.Views.init).extend({
    template: JST['sales/module/filter'],
    timer : 0,
    events: {
        "keyup .js-filter": 'filter',
        "click .js-button-click": 'Timer'
    },
    name: 'filter',
    initialize: function(options) {
        !options.name||(this.name=options.name);
        if((options!=undefined)&&(options.filter!=undefined))
            this.filter_param=options.filter;
        this.proto();
        this.render();
    },
    render:function(){
        this.$el.append(this.template({name:this.name,filter: this.filter_param}));
        return this;
    },
    Timer: function(){
        this.collection.fetch();
        clearTimeout(this.timer)
    },
    filter: function(a){
        var val=this.$('.js-filter');
        this.collection.filter[val.attr('name')]=val.val();
        var $context=this;
        clearTimeout(this.timer)
        this.timer = setTimeout(function(){$context.Timer()}, 500)
        if(val.val().length>=6||val.val().length==0){

            this.collection.fetch();
            clearTimeout(this.timer)
        }
    }


});






TiragSales.Views.delete_item= {
    _initialize: function(){
        this.model.on('remove',this.lazy_remove,this);
    },

    events: {
        "click .js-delete": 'delete'
    },

    lazy_remove: function(){
        this.$el.slideUp('slow');
        this.$el.html('');
        this.self.render()
    },

    delete: function(){

        this.model.destroy({url:this.model.collection.url_delete(this.model.get('id'))});
        this.model=null;
        return false;
    }

}











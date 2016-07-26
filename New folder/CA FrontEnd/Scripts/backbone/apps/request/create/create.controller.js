App.module("RequestApp.Create", function (Create, App, Backbone, Marionette, $, _) {
    Create.Controller = App.Controllers.Base.extend({
        initialize: function () {
            App.execute('show:broadcast');

            if (this.options.collection) {
                this.collection = this.options.collection;
            } else {
                this.collection = App.request('requestTypeList:entities');
            }

            this.layoutView = this.getLayoutView();
            this.listenTo(this.layoutView, 'link:click', this.onLinkClick);
            //this.listenTo(this.layoutView, 'show', this.showRegions);

            if (this.options.collection) {
                this.show(this.layoutView, { loading: false });
            } else {
                this.listenTo(this.collection, 'add remove reset', _.bind(function () {
                    if (this.collection.length === 1) {
                        this.layoutView.$el.addClass('off');
                        var url;
                        _.each(App.requests, _.bind(function (value, key) {
                            if (value == this.collection.models[0].get('SRDInstanceId')) url = key;
                        }, this));
                        if (!url) url = '404';
                        this.onLinkClick('/request/create/' + url);
                    }
                }, this));
                this.show(this.layoutView, { loading: { entities: this.collection } });
            }
        },

        //showRegions: function () {

        //},

        onLinkClick: function (href) {
            var action = href[0] == '/' && href.replace('/', '') || href;
            action = action.split('/').join(':');
            App.execute(action);
            App.Analytics.newRequestPick(action);
        },

        getLayoutView: function () {
            return new Create.LayoutView({ collection: this.collection });
        }

    });
});
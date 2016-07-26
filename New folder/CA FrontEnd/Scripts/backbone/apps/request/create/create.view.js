App.module("RequestApp.Create", function (Create, App, Backbone, Marionette, $, _) {

    Create.TypeItem = App.Views.ItemView.extend({
        template: 'request/create/type-item',
        className: 'cf hr-top',
        initialize: function () {
            _.each(App.requests, _.bind(function (value, key) {
                if (value == this.model.get('SRDInstanceId')) this.model.set('url', key);
            }, this));
            if (!this.model.get('url')) this.model.set('url', '500');
        },
    });

    Create.NoItems = App.Views.ItemView.extend({
        template: 'request/create/no-items'
    });

    Create.LayoutView = App.Views.CompositeView.extend({
        template: "request/create/layout",
        className: "section",
        childViewContainer: '.request-create-list-types',
        childView: Create.TypeItem,
        emptyView: Create.NoItems,

        events: {
            'click a': 'onLinkClick'
        },

        onLinkClick: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var href = $(e.target).attr('href');
            this.trigger('link:click', href);
        }
    });
});
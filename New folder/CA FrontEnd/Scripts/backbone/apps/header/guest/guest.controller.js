App.module("HeaderApp.Guest", function (Guest, App, Backbone, Marionette, $, _) {
    Guest.Controller = App.Controllers.Base.extend({

        initialize: function () {
            this.layoutView = this.getLayoutView();
            this.show(this.layoutView, { loading: false });
            this.listenTo(this.layoutView, 'header-link:click', _.bind(function () {
                App.execute('account:login');
            }));
        },

        getLayoutView: function () {
            return new Guest.Layout();
        }

    });
});
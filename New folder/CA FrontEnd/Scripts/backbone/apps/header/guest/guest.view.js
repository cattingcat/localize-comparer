App.module("HeaderApp.Guest", function (Guest, App, Backbone, Marionette, $, _) {

    Guest.Layout = App.Views.LayoutView.extend({
        template: "header/guest/layout",
        className: "head pd",
        triggers: {
            'click .header-link': 'header-link:click'
        }
    });

});
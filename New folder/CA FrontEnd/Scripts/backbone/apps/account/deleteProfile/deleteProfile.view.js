App.module("AccountApp.Delete", function (Delete, App, Backbone, Marionette, $, _) {
    Delete.ErrorView = App.Views.LayoutView.extend({
        template: 'account/deleteProfile/error'
    });

    Delete.SuccessView = App.Views.LayoutView.extend({
        template: 'account/deleteProfile/success'
    });

    Delete.Process = App.Views.ItemView.extend({
        template: 'account/deleteProfile/sync',
        serializeData: function () {
            return this.options;
        }
    });
});
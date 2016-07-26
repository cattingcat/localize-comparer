App.module("AccountApp.DeleteCompany", function (DeleteCompany, App, Backbone, Marionette, $, _) {
    DeleteCompany.ErrorView = App.Views.ItemView.extend({
        template: 'account/deleteCompany/error'
    });

    DeleteCompany.SuccessView = App.Views.ItemView.extend({
        template: 'account/deleteCompany/success'
    });

    DeleteCompany.Process = App.Views.ItemView.extend({
        template: 'account/deleteCompany/sync',
        serializeData: function () {
            return this.options;
        }
    });
});
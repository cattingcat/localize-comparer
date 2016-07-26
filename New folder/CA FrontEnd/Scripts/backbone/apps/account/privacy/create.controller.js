App.module("AccountApp.Privacy", function (Privacy, App, Backbone, Marionette, $, _) {
    Privacy.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.layoutView = this.getLayoutView();
            this.show(this.layoutView, { loading: false });
        },

        getLayoutView: function () {
            return new Privacy.LayoutView();
        }

    });
});
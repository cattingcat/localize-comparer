App.module("ErrorApp.Show", function (Show, App, Backbone, Marionette, $, _) {
    Show.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.layoutView = this.getLayoutView();
            this.listenTo(this.layoutView, 'back:to:main', this.backToMainPage);
            this.show(this.layoutView, { loading: false });
        },

        backToMainPage: function () {
            App.execute('request:list');
        },

        getLayoutView: function () {
            if (this.options.type == 'notFound') {
                return new Show.NotFound();
            } else if (this.options.type == 'forbidden') {
                return new Show.Forbidden();
            } else if (this.options.type == "internalError") {
                return new Show.InternalError();
            }
            return new Show.NotFound();
        }

    });
});
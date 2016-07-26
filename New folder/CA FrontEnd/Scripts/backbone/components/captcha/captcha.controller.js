App.module("Components.Captcha", function (Captcha, App, Backbone, Marionette, $, _) {
    Captcha.Controller = App.Controllers.Base.extend({
        initialize: function (options) {

            this.model = new App.Entities.CaptchaStsModel(null, options);

            this.layout = this.getLayoutView(options);
            this.layout.switchLoading(true);

            this.listenTo(this.model, 'change:image change:isNecessary', this.onImageChange);
            this.listenTo(this.layout, 'refresh render', this.onRefresh);
        },

        onError: function () {
            App.error('Captcha isn\'t fetched');
            this.layout.switchLoading(false);
        },

        onImageChange: function () {
            this.model.set('captcha', '');
            this.layout.refreshImage();
            this.layout.switchLoading(false);
        },

        onRefresh: function () {
            this.layout.switchLoading(true);
            this.model.generateNewCaptcha({
                success: _.bind(this.onImageChange, this),
                error: _.bind(this.onError, this)
            });
        },

        getLayoutView: function (options) {
            return new Captcha.LayoutView({ model: this.model });
        }
    });
    
    App.reqres.setHandler("captcha:sts:view", function (options) {
        var controller = new Captcha.Controller(options);
        return controller.layout;
    });
});
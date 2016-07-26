App.module("AccountApp.Privacy", function (Privacy, App, Backbone, Marionette, $, _) {

    Privacy.LayoutView = App.Views.LayoutView.extend({
        template: "account/privacy/layout",
        className: 'section'
        //regions: {
        //    captchaRegion: '.captcha-region',
        //    buttonLoadingRegion: '.button-loading-region'
        //}
    });

});
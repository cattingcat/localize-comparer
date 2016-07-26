App.module("FooterApp", function (FooterApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var API = {
        show: function () {
            return new FooterApp.Show.Controller({ region: App.footerRegion });
        }
    };

    App.addInitializer(function () {
        API.show();
    });
});
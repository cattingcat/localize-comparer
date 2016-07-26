App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.CaptchaStsModel = Entities.CaptchaModel.extend({
        url: function () {
            return App.stsServer.getUrl() + '/api/Captcha/Get?randId=' + this.randId + '&type=' + this.captchaType;
        },
        crossDomain: function() {
            return App.stsServer.isCrossDomain();
        }
    });

    var API = {
        getCaptchaStsEntity: function (options) {
            var model = new Entities.CaptchaStsModel(null, options);
            model.fetch();
            return model;
        }
    };

    App.reqres.setHandler("captcha:sts:entity", function (options) {
        return API.getCaptchaStsEntity(options);
    });

});
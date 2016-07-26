App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    var API = {
        getTextResource: function (key) {
            return Globalize.formatMessage(key);
        }
    };

    App.reqres.setHandler('resource:text', function (key) {
        return API.getTextResource(key);
    });

});
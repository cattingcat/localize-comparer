App.module("HeaderApp", function (HeaderApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var API = {
        show: function () {
            var currentRole = App.request('auth:role');
            if (currentRole != 'Anonymous') {
                return new HeaderApp.Authorized.Controller({ region: App.headerRegion });
            } else {
                return new HeaderApp.Guest.Controller({ region: App.headerRegion });
            }
        }
    };

    HeaderApp.show = API.show;

    App.vent.on('auth:loggedIn', API.show);
    App.vent.on('auth:loggedOut', API.show);
});
App.module("LicenseApp", function (LicenseApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var RouteController = App.Routing.RouteController.extend({
        controllerMenuRoute: 'license/list',
        roles: ['CA User', 'CA User Show Requests', 'CA User Manage Requests', 'Main CA User'],
        list: {
            action: function () {
                Helpers.loadLangFile('license', function () {
                    new LicenseApp.List.Controller({ region: App.mainRegion });
                });
            }
        }
    });

    LicenseApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "license/list": "list"
        }
    });

    App.addInitializer(function () {
        LicenseApp.RouteController = new RouteController();
        return new LicenseApp.Router({
            controller: LicenseApp.RouteController
        });
    });

    App.commands.setHandler('license:list', function () {
        App.navigate('license/list');
        LicenseApp.RouteController.executeAction('list');
    });
});
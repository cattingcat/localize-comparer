App.module("ProfileApp", function (ProfileApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var RouteController = App.Routing.RouteController.extend({
        controllerMenuRoute: 'profile/show',
        roles: ['Authorized'],
        show: {
            action: function () {
                Helpers.loadLangFile('user', function () {
                    return new ProfileApp.Show.Controller({ region: App.mainRegion });
                });
            }
        }
    });

    ProfileApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "profile/show": "show"
        }
    });

    App.addInitializer(function () {
        ProfileApp.RouteController = new RouteController();
        return new ProfileApp.Router({
            controller: ProfileApp.RouteController
        });
    });

    App.commands.setHandler('profile:show', function () {
        App.navigate('profile/show');
        ProfileApp.RouteController.executeAction('show');
    });

});
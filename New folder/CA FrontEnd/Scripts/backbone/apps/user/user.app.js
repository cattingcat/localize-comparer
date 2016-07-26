App.module("UserApp", function (UserApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var RouteController = App.Routing.RouteController.extend({
        controllerMenuRoute: 'user/list',
        roles: ['Main CA User', 'TA Main CA User'],
        list: {
            action: function () {
                Helpers.loadLangFile('user', function () {
                    new UserApp.List.Controller({ region: App.mainRegion });
                });
            }
        },
        show: {
            action: function (username) {
                Helpers.loadLangFile('user', function () {
                    new UserApp.Show.Controller({ region: App.mainRegion, username: username });
                });
            }
        }
    });

    UserApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "user/list": "list",
            "user/show/:username/": "show"
        }
    });


    App.addInitializer(function () {
        UserApp.RouteController = new RouteController();
        return new UserApp.Router({
            controller: UserApp.RouteController
        });
    });


    App.commands.setHandler('user:list', function () {
        App.navigate('user/list');
        UserApp.RouteController.executeAction('list');
    });

    App.commands.setHandler('user:show', function (username) {
        App.navigate('user/show/' + username + '/');
        UserApp.RouteController.executeAction('show', username);
    });

});
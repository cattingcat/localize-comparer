App.module("DocumentApp", function (DocumentApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var RouteController = App.Routing.RouteController.extend({
        controllerMenuRoute: 'document/list',
        roles: ['Authorized'],
        list: {
            action: function () {
                Helpers.loadLangFile('document', function () {
                    new DocumentApp.List.Controller({ region: App.mainRegion });
                });
            }
        }
    });

    DocumentApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "document/list": "list"
        }
    });

    App.addInitializer(function () {
        DocumentApp.RouteController = new RouteController();
        return new DocumentApp.Router({
            controller: DocumentApp.RouteController
        });
    });

    App.commands.setHandler('document:list', function () {
        App.navigate('document/list');
        DocumentApp.RouteController.executeAction('list');
    });
});
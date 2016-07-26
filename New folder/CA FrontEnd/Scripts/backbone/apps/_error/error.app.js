App.module("ErrorApp", function (ErrorApp, App, Backbone, Marionette, $, _) {
    "use strict";
    
    var RouteController = App.Routing.RouteController.extend({
        fileNotFound: function () {
            App.Analytics.fileNotFoundError();
            return new ErrorApp.Show.Controller({ region: App.mainRegion, type: 'notFound' });
        },
        notFound: function () {
            return new ErrorApp.Show.Controller({ region: App.mainRegion, type: 'notFound' });
        },
        forbidden: function () {
            return new ErrorApp.Show.Controller({ region: App.mainRegion, type: 'forbidden' });
        },
        internalError: function () {
            return new ErrorApp.Show.Controller({ region: App.mainRegion, type: 'internalError' });
        },
        customError: function (options) {
            App.mainRegion.reset();
            var view = new App.ErrorApp.Show.CustomError(options);
            App.mainRegion.show(view);
        }
    });

    ErrorApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "error/notfound": "notFound",
            "error/forbidden": "forbidden",
            "error/internalError": "internalError",
            "*fileNotFound": "fileNotFound",
            "*notFound": "notFound"
        }
    });

    App.addInitializer(function () {
        ErrorApp.RouteController = new RouteController();
        return new ErrorApp.Router({
            controller: ErrorApp.RouteController
        });
    });

    App.commands.setHandler('error:notFound', function () {
        App.navigate('error/notFound');
        ErrorApp.RouteController.executeAction('notFound');
    });

    App.commands.setHandler('error:forbidden', function () {
        App.navigate('error/forbidden');
        ErrorApp.RouteController.executeAction('forbidden');
    });

    App.commands.setHandler('logout:message', function (options) {
        App.execute('auth:logout');

        var errorView = new App.AccountApp.Login.ErrorView({
            model: new Backbone.Model({
                errorTitle: Globalize.formatMessage('modals/' + options + '/title'),
                errorDescription: Globalize.formatMessage('modals/' + options + '/message'),
                errorOkBtn: Globalize.formatMessage('modals/close')
            })
        });
        var errorModalView = App.request('modal:wrapper', { contentView: errorView });
        App.modalRegion.show(errorModalView);
    });

    App.commands.setHandler('replace:main', function (options) {
        options = options || {};
        ErrorApp.RouteController.executeAction('customError', options);

        // В случае ошибки временно отключаем возможность показа перекрывающих вьюшек
        var tmp = App.mainRegion.show;
        App.mainRegion.show = function (v) { };
        _.delay(function () { App.mainRegion.show = tmp; }, 200);
    });
});
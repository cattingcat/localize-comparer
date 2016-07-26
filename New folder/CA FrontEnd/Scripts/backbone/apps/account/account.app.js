App.module("AccountApp", function (AccountApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var RouteController = App.Routing.RouteController.extend({
        roles: ['Anonymous'],

        // Страница входа в СА
        loginRoute: {
            action: function () {
                var currPage = App.mainRegion.currentView;
                if (currPage && currPage.className == "page-login") return;
                return new AccountApp.Login.Controller({ region: App.mainRegion });
            }
        },

        // Соглашие о конфиденциальности
        privacyRoute: {
            roles: ['Authorized', 'Anonymous'],
            action: function () {
                return new AccountApp.Privacy.Controller({ region: App.mainRegion });
            }
        },

        // Модальное окно для восстановления забытого пароля
        forgotRoute: {
            action: function () {
                this.loginRoute.action();
                return new AccountApp.Forgot.Controller({ region: App.modalRegion });
            }
        },

        // Регистрация пользователя
        createRoute: {
            action: function () {
                this.loginRoute.action();
                return new AccountApp.Create.Controller({ region: App.modalRegion });
            }
        },

        // Ссылка на удаление аккаунта
        deleteRoute: {
            roles: ['Authorized', 'Anonymous'],
            action: function (username, timestamp, token) {
                App.execute('main:page');
                return new AccountApp.Delete.Controller({
                    region: App.modalRegion,
                    username: username,
                    timestamp: timestamp,
                    token: token,

                    authorized: App.AuthInfo.hasTokens()
                });
            }
        },

        // ссылка на сброс пароля
        resetPasswordRoute: {
            roles: ['Authorized', 'Anonymous'],
            action: function (username, timestamp, token) {
                App.execute('main:page');
                var checkUrl = '/api/Password/GetPasswordResetLinkStatus',
                    submitUrl = '/api/Password/ResetPassword',
                    errorStringsPath = 'account/resetPassword/';

                return new AccountApp.ChangePass.Controller({
                    region: App.modalRegion,
                    username: username,
                    timestamp: timestamp,
                    token: token,

                    checkUrl: checkUrl,
                    submitUrl: submitUrl,
                    globPath: errorStringsPath,

                    analyticsCategory: 'Password recovery'
                });
            }
        },

        // Ссылка на активацию учетной записи
        activateRoute: {
            roles: ['Authorized', 'Anonymous'],
            action: function (username, timestamp, token) {
                App.execute('main:page');
                var checkUrl = '/api/User/GetActivateStatus',
                    submitUrl = '/api/User/Activate',
                    errorStringsPath = 'account/activate/';

                return new AccountApp.ChangePass.Controller({
                    region: App.modalRegion,
                    username: username,
                    timestamp: timestamp,
                    token: token,

                    checkUrl: checkUrl,
                    submitUrl: submitUrl,
                    globPath: errorStringsPath,

                    analyticsCategory: 'Registration'
                });
            }
        },

        // ссылка на удаление компании
        companyDelete: {
            roles: ['Authorized', 'Anonymous'],
            action: function (username, timestamp, token) {
                App.execute('main:page');
                return new AccountApp.DeleteCompany.Controller({
                    username: username,
                    timestamp: timestamp,
                    token: token,
                    region: App.modalRegion,

                    authorized: (App.request('auth:role') != 'Anonymous')
                });
            }
        },
    });

    AccountApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "account/login": "loginRoute",
            "account/forgot": "forgotRoute",
            "account/create": "createRoute",

            "account/privacy-statement": "privacyRoute",

            "account/resetpassword/:username/:timestamp-:token": "resetPasswordRoute",
            "account/resetpassword/:username/:timestamp-:token/": "resetPasswordRoute",

            "account/activate/:username/:timestamp-:token": "activateRoute",
            "account/activate/:username/:timestamp-:token/": "activateRoute",

            "account/delete/:username/:timestamp-:token": "deleteRoute",
            "account/delete/:username/:timestamp-:token/": "deleteRoute",

            "company/delete/:username/:timestamp-:token": "companyDelete",
            "Company/Delete/:username/:timestamp-:token": "companyDelete"
        }
    });


    App.addInitializer(function () {
        AccountApp.RouteController = new RouteController();
        return new AccountApp.Router({
            controller: AccountApp.RouteController
        });
    });


    // Вызывается при логауте
    App.commands.setHandler('account:login', function () {
        App.navigate('account/login');
        if (!App.mainRegion.currentView ||
            App.mainRegion.currentView.className != "page-login") {
            AccountApp.RouteController.executeAction('loginRoute');
        }
    });

    // Вызывается при клике по ссылке на форме входа
    App.commands.setHandler('account:forgot', function () {
        App.navigate('account/forgot');
        AccountApp.RouteController.executeAction('forgotRoute');
    });

    // Вызывается при клике по ссылке на форме входа
    App.commands.setHandler('account:create', function () {
        App.navigate('account/create');
        AccountApp.RouteController.executeAction('createRoute');
    });

    // Вызывается, если при входе в СА, если выяснилось что срок действия пароля истек
    App.commands.setHandler('account:resetPassword', function (username, timastamp, token) {
        App.navigate('account/resetpassword/' + username + '/' + timastamp + '-' + token);
        AccountApp.RouteController.executeAction('resetPasswordRoute', username, timastamp, token);
    });

    App.commands.setHandler('account:refreshPassword', function (options) {
        App.execute('main:page');
        var errorStringsPath = 'account/resetPassword/';

        return new AccountApp.RefreshPass.Controller({
            region: App.modalRegion,

            username: options.login,
            onceToken: options.onceToken,

            globPath: errorStringsPath
        });
    });
});
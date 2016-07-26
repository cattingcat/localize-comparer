App.module("AuthApp", function (AuthApp, App, Backbone, Marionette, $, _) {
    "use strict";

    /* manipulation with access-token and refresh-token */
    var API = {
        start: function () {
            App.log('AuthApp', 'start call');

            var authModel = App.request('auth:entity');

            if (App.request('auth:isAuthorized')) {
                API.ajaxSetup(authModel.get('access_token'));

            } else if (authModel.hasToken()) {
                App.log('AuthApp', 'start call (unathorized and no tokens), logout without request');

                App.execute('auth:logout', { noRequest: true });
            }
        },

        login: function (options) {
            var sessionId = App.ClientSession.getId();

            var momentStart = moment();

            App.log('AuthApp', 'login call, $.ajax(/Token), client_id: ' + sessionId);

            var headers = {
                Prefer: 'return-content'
            };

            if (App.sendRequestIdFromUi) {
                headers[App.requestIdHeader] = App.Entities.generateGuid();
            }

            $.ajax({
                type: 'POST',
                url: App.stsServer.getUrl() + '/Token',
                crossDomain: App.stsServer.isCrossDomain(),
                data: _.extend({
                    grant_type: 'password',
                    client_id: sessionId
                }, options.data),
                headers: headers,
                success: function (data) {
                    App.log('AuthApp', 'login call, $.ajax(/Token) call successed, refresh AuthModel, ajaxSetup, thigger LoggedIn event');

                    // Setup AuthModel
                    var authModel = App.request('auth:entity');
                    authModel.set(_.extend(data, { date: moment(), requestStart: momentStart }));
                    App.AuthInfo.set(data);

                    // Setup AJAX header
                    API.ajaxSetup(authModel.get('access_token'));

                    // Прерываем выполнение входа, т.к. пароль устарел и его нужно обновить
                    if (data.isStsToken === 'True') {
                        App.warn('Password expired!');
                        authModel.set({ role: 'Anonymous' });
                        if (options.error) return options.error(data);
                    }

                    // Trigger loggedIn event
                    App.vent.trigger('auth:loggedIn');

                    // Check language in session store
                    var lang = data.language;
                    var settingsModel = App.request('settings:entity');
                    var oldLang = settingsModel.get('language').value;
                    if (lang && lang != oldLang) {
                        settingsModel.changeLang(lang, { noRequest: true });
                        return App.execute('page:reload');
                    }

                    if (options.success) options.success();
                },
                error: function (resp) {
                    App.log('AuthApp', 'login call, $.ajax(/Token) call failed', resp);

                    if (options.error) options.error(resp);
                }
            });
        },

        logout: function (options) {
            options = options || {};
            App.log('AuthApp', 'logout call');
            App.execute('hub:stop');

            var authModel = App.request('auth:entity'),
                isAuth = authModel.isAuthorized();

            // Устанавливаем запрет на обновление токена
            authModel.set({ failedRefreshToken: true });

            if (!options.noRequest && isAuth) {
                App.log('AuthApp', 'logout: sending logout request (/api/Account/Logout)');
                $.ajax({
                    type: 'POST',
                    url: App.stsServer.getUrl() + '/api/User/Logout',
                    crossDomain: App.stsServer.isCrossDomain(),
                    complete: function () {
                        App.log('AuthApp', 'logout: done logout request');
                        if (options.complete) options.complete();
                    }
                });
            } else {
                App.log('AuthApp', 'logout: without request');
            }

            // Очищаем токены только после запроса логаута.
            App.AuthInfo.logout();

            if (isAuth) {
                authModel.clear();
                _.delay(function () {
                    App.execute('account:login');
                }, 100);
            } else {
                if (options.complete) options.complete();
            }

            // Переходим на страницу входа только после очистки токенов.
            //  чтобы не инициировать события смены роутинга
            App.execute('account:login');
            App.vent.trigger('auth:loggedOut');
        },

        refreshToken: function () {
            App.log('AuthApp', 'refreshToken call');
            var sessionId = App.ClientSession.getId();

            // Если уже есть запрос нового токена - возвращаем промис на него
            if (App.refershTokenDfd) return App.refershTokenDfd;

            var authModel = App.request('auth:entity'),
                refreshToken = authModel.get('refresh_token');

            if (!refreshToken || authModel.get('failedRefreshToken')){
                App.error('AuthApp', 'refreshToken: no refresh_token');
                return $.Deferred().reject({ responseJSON: { Code: 'UnknownError' } });
            }

            App.log('AuthApp', 'refreshToken: ', refreshToken);

            var headers = { Prefer: 'return-content' };
            if (App.sendRequestIdFromUi) {
                headers[App.requestIdHeader] = App.Entities.generateGuid();
            }

            var momentStart = moment();

            App.refershTokenDfd = $.ajax({
                type: 'POST',
                url: App.stsServer.getUrl() + '/Token',
                crossDomain: App.stsServer.isCrossDomain(),
                data: {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: sessionId
                },
                headers: headers,
                success: function (data) {
                    App.log('AuthApp', 'refreshToken call success, ajaxSetup');

                    authModel.set(_.extend(data, { date: moment(), requestStart: momentStart }));
                    App.AuthInfo.set(data);

                    if (data.isStsToken === 'True') {
                        App.warn('Refresh token: Password expired!');
                        authModel.set({ role: 'Anonymous' });
                    }

                    API.ajaxSetup(data.access_token);
                },
                error: function (resp) {
                    App.error('AuthApp', 'refreshToken: redirrect to login page', resp);

                    // Устаналиваем флаг, что при обновлении токена произошла ошибка. 
                    authModel.set({ failedRefreshToken: true });
                    App.execute('account:login');
                },
                complete: function (resp, code) {
                    App.refershTokenDfd = null;
                }
            });

            return App.refershTokenDfd;
        },

        ajaxSetup: function (token) {
            App.log('AuthApp', 'ajaxSetup call (set headers Prefer, Authorization) ', { token: token });

            $.ajaxSetup({
                headers: {
                    'Prefer': 'return-content',
                    "Authorization": "Bearer " + token
                }
            });
            App.signalR = App.signalR || {};
            App.signalR.qs = { "Bearer": token };
        },

        setupToken: function () {
            var authModel = App.request('auth:entity');

            // Обновляем информацию о пользователе
            App.AuthInfo.set(authModel.attributes)

            API.ajaxSetup(authModel.get('access_token'));
        }
    };

    App.commands.setHandler('auth:login', function (options) {
        API.login(options);
    });

    App.commands.setHandler('auth:logout', function (options) {
        API.logout(options);
    });

    App.reqres.setHandler('auth:refreshToken', function (options) {
        return API.refreshToken(options);
    });

    App.reqres.setHandler('auth:setupToken', function () {
        return API.setupToken();
    });

    // Run auth app when application initialized
    App.addInitializer(function () {
        API.start();
    });

    // show message after logout
    App.vent.on('logout:user', function (options) {
        App.execute('logout:message', options);
    });
});

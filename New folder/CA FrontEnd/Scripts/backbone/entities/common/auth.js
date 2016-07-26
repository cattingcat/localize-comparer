App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    /* access-token and refresh token storage */
    Entities.AuthModel = Entities.Model.extend({
        initialize: function () {
            this.listenTo(this, 'change', this.save);
        },

        isAuthorized: function () {
            var res = this.hasToken();

            App.log('Entities.AuthModel', 'isAuthorized:' + res);

            return res;
        },

        hasValidToken: function () {
            var res = this.hasToken() && !this.isTokenExpired();

            App.log('Entities.AuthModel', 'hasValidToken call with result: ' + res);

            return res;
        },

        isTokenExpired: function () {
            var date = this.get('date'),
                requestDuration = (date - this.get('requestStart')) / 1000; // Длительность запроса токена

            var actual = (moment() - date) / 1000, // Сколько секунд токен используется
                expiresIn = (this.get('expires_in') - App.tokenExpiration - requestDuration), // Скоько секунд токен должен использоваться
                res = (actual > expiresIn); // Если время использования токена больше чем его срок жизни(минус запас до истечения) то токен считаем невалидным

            App.log('Entities.AuthModel', 'isTokenExpired cal with result: ' + res + ', actual: ' + actual + ', expiresIn: ' + expiresIn);

            return res;
        },

        setTokenIsExpired: function () {
            App.log('Entities.AuthModel', 'setTokenIsExpired');
            this.set({ expires_in: 0 }, { silent: true });
            this.save();
        },

        hasToken: function () {
            var res = (!!this.get('access_token') && !!this.get('refresh_token'));

            App.log('Entities.AuthModel', 'hasToken call with res: ' + res);

            return res;
        },

        getStore: function () {
            var storeData = store.get('auth'),
                data = storeData && JSON.parse(storeData);

            return data || {};
        },

        load: function () {
            var data = this.getStore();

            if (!_.isEmpty(data)) {
                this.set(data, { silent: true });
                this.set({
                    date: moment(data.date), requestStart: moment(data.requestStart)
                }, { silent: true });

            } else {
                App.warn('Auth store empty');
                this.clear({ silent: true });
            }
        },

        save: function () {
            // Save AuthModel to local storage
            store.set('auth', JSON.stringify(this.toJSON()));

            App.Analytics.setUserRole(this.get('role') || 'Anonymous');
        }
    });

    var API = {
        getAuthEntity: function (options) {
            if (!App.authModel) {
                App.authModel = new Entities.AuthModel();
                App.authModel.load();
                App.Analytics.setUserRole(App.authModel.get('role') || 'Anonymous');
            } else {
                App.authModel.load();
            }
            return App.authModel;
        },

        isAuthorized: function () {
            return this.getAuthEntity().isAuthorized();
        },
        hasToken: function () {
            return this.getAuthEntity().hasToken();
        },
        hasValidToken: function () {
            return this.getAuthEntity().hasValidToken();
        },
        clearToken: function () {
            return this.getAuthEntity().setTokenIsExpired();
        },
        role: function () {
            return this.getAuthEntity().get('role') || 'Anonymous';
        }
    };

    App.reqres.setHandler("auth:entity", function (options) {
        return API.getAuthEntity(options);
    });

    App.reqres.setHandler('auth:isAuthorized', function (options) {
        return API.isAuthorized(options);
    });

    App.reqres.setHandler('auth:role', function () {
        return API.role();
    });

    App.reqres.setHandler('auth:hasToken', function (options) {
        return API.hasToken(options);
    });

    App.reqres.setHandler('auth:hasValidToken', function (options) {
        return API.hasValidToken(options);
    });

    App.commands.setHandler('auth:clearToken', function () {
        return API.clearToken();
    });
});
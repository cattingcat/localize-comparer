App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    'use strict';
    Entities.AuthInfo = Entities.Model.extend({
        initialize: function () {
            var data = store.get('Entities.AuthInfo');
            if (data) this.set(data, { silent: true });
            this.on('change', this.onChange);
        },
        onChange: function (model, opts) {
            store.set('Entities.AuthInfo', this.attributes);
        },
        onPushNotif: function () {
            // TODO Martynov: SignalR method
        },

        logout: function () {
            store.clear('Entities.AuthInfo');
            this.clear({ silent: true });
            $.ajaxSetup({
                headers: { Authorization: null }
            });
        },

        hasTokens: function () {
            var access = this.get('access_token'),
                refresh = this.get('refresh_token');

            return !!access && !!refresh;
        },

        isUnknownComp: function () {
            return this.get('isUnknownCompany') != 'False';
        },
        isMain: function () {
            return this.get('role').indexOf('Main') != -1;
        },
        isUser: function () {
            return _.contains(['CA User', 'TA CA User'], this.get('role'));
        },
        isTA: function () {
            return this.get('role').indexOf('TA') != -1;
        }
    });

    App.AuthInfo = new App.Entities.AuthInfo();
});
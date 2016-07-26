App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    'use strict';

    Entities.AnswersModel = Entities.Model.extend({
        auth: true,
        noExceptHandler: true,
        url: '/api/Request/GetNumberOfPendingAnswer'
    });

    Entities.RequestCounter = Entities.Model.extend({
        defaults: {
            pendingCount: 0
        },
        initialize: function () {
            // update counter when address has changed
            this.listenTo(App.vent, 'route', this.routeChange);
            this.listenTo(App.vent, 'change:request:count', this.onPushNotif);
            
            this.answersModel = new Entities.AnswersModel();

            this.getStored();
        },
        refresh: function (options) {
            options = options || {};
            if (this.xhr) return;

            this.xhr = this.answersModel.fetch({
                success: _.bind(function (model, resp) {
                    this.set({ pendingCount: resp });
                    this.trigger('change', this);

                    this.setStore(resp);

                    if (options.success) options.success(model, resp);
                },this),
                error: function (a, b) {
                    App.error('Error while pending count request', a, b);

                    if (options.error) options.error(a, b);
                },
                complete: _.bind(function (resp) {
                    this.xhr = null;
                }, this)
            });
        },
        routeChange: function () {
            if (App.request('auth:isAuthorized')) this.refresh();
        },
        onPushNotif: function () {
            // TODO Martynov: SignalR method
        },
        getStoreId: function () {
            return 'request-count';
        },
        setStore: function (requestCount) {
            store.set(this.getStoreId(), requestCount);
        },
        getStored: function () {
            var requestCount = store.get(this.getStoreId());
            this.set({ pendingCount: requestCount });
        }
    });

    App.RequestCounter = new App.Entities.RequestCounter();
});
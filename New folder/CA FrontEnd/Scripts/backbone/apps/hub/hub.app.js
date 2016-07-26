App.module("HubApp", function (HubApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var API = {
        initSignalR: function () {
            if (!App.enableSignalR)
                return;

            var signal = App.signalR = App.signalR || {};
            signal.connection.hub.qs = signal.qs;
            signal.connection.hub.start().done(_.bind(function (connection) { // { transport: ['webSockets'] }
                signal.started = true;
                signal.countErrors = 0;
                console.log("SignalR: connected - transport = " + ($.connection.hub.transport ? $.connection.hub.transport.name : 'NOTHING') + '; ID=' + $.connection.hub.id);               
            }, this)).fail(_.bind(function () {
                if (signal.countErrors != signal.maxErrors) {
                    signal.countErrors++;
                    console.log('Not connected: ' + signal.countErrors);
                    _.delay(_.bind(function () {
                        this.start();
                    }, this), 1000);
                } else {
                    console.log('Stop trying - max errors = ' + signal.maxErrors);
                }
            }, this));
        },
        start: function () {
            if (!App.enableSignalR)
                return;

            var signal = App.signalR = App.signalR || {};
            if (!signal.onceInit) {
                signal.connection = $.connection;
                signal.proxy = signal.connection.pushHub;
                signal.proxy.client.triggerEvent = this.triggerEvent;
                signal.connection.logging = true;
                signal.onceInit = true;
                signal.maxErrors = 10;
                signal.countErrors = 0;

                signal.connection.hub.error(_.bind(function (error) {
                    console.log(error.message);
                    if (error && error.message && error.message == "Long polling request failed.") {
                        App.request("auth:refreshToken");
                    }
                }, this));

            }
            if (!this.started) {
                if (App.request('auth:hasToken')) {
                    if (App.request('auth:hasValidToken')) {
                        App.request('auth:setupToken');
                        API.initSignalR();
                    } else {
                        var tokenDfd = App.request('auth:refreshToken');
                        tokenDfd.done(function () {
                            API.initSignalR();
                        }).fail(function () {
                            App.execute('auth:logout');
                        });
                    }
                } else {
                    App.execute('account:login');
                }
            }
        },
        restart: function () {
            if (!App.enableSignalR)
                return;

            this.stop();
            this.start();
        },
        stop: function () {
            if (!App.enableSignalR)
                return;

            var signal = App.signalR = App.signalR || {};
            signal.started = false;
            if (!signal.connection) signal.connection = $.connection;
            signal.connection.hub.stop();
        },
        triggerEvent: function (event, options) {
            if (!App.enableSignalR)
                return;

            // Global SirnalR event trigger
            App.vent.trigger(event, options);
        }
    };

    App.commands.setHandler('hub:start', function (options) {
        API.start();
    });

    App.commands.setHandler('hub:restart', function (options) {
        API.restart();
    });

    App.commands.setHandler('hub:stop', function (options) {
        API.stop();
    });
});

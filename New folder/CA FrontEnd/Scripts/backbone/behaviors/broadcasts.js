App.module("Behaviors.Broadcasts", function (Broadcasts, App, Backbone, Marionette, $, _) {
    "use strict";
    this.startWithParent = false;

    Broadcasts.Broadcasts = Marionette.Behavior.extend({
        onShow: function () {
            API.showBroadcast({ once: true });
        },

        onDestroy: function () {
            API.hideBroadcast();
            API.xhr && API.xhr.abort();
        }
    });


    var API = {
        hideBroadcast: function () {
            App.notifRegion.reset();
            API.xhr && API.xhr.abort();
        },
        showBroadcast: function (options) {
            options = options || {};
            this.xhr && this.xhr.abort();
            if (options.once) {
                // hide broadcast when route changed
                App.vent.once('route', API.hideBroadcast);
            }

            if (App.AuthInfo.isTA()) return;

            var dfd = $.Deferred(),
                promise = dfd.promise();

            this.notifications = new App.Entities.NotificationCollection();
            //Берем бродкасты из локального хранилища
            this.notifications.getStore();
            this.notificationCtrl = new App.Components.Notif.Controller({
                collection: this.notifications
            });
            //Устанавливаем промис контроллеру, для отправки collapse и hide после попытки получения бродкастов 
            //(во избежании гонок, когда пользователь сразу скрывает сообщение, а в это время уже получаем список в котором это сообщение открыто и происходит не правильная запись сотояния в локальное хранилище)
            this.notificationCtrl.setPromise(promise);
            
            this.xhr = this.notifications.fetch({
                success: _.bind(function () {
                    // Иногда запрос завершается после того как пользователь был разлогинен
                    if (App.request('auth:isAuthorized')) {
                        //Обновляем локальное хранилище с бродкастами
                        this.notifications.setStore();
                    }
                }, this),
                complete: _.bind(function (resp) {
                    //Резолвим запросы контроллера и удалем промис.
                    dfd.resolve(resp);
                    this.notificationCtrl.setPromise(null);
                }, this)
            });
        }
    }

    App.commands.setHandler('show:broadcast', function () {
        API.showBroadcast({once: true});
    });

    App.vent.on('auth:loggedOut', API.hideBroadcast);
});
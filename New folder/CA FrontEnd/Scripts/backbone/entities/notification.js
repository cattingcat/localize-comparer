App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.NotificationCollapsedModel = Entities.Model.extend({
        url: function () {
            var guid = this.get('id');
            var status = this.get('collapsed');
            var str = 'broadcastId=' + guid + '&' + 'broadcastStatusCollapsed=' + status;
            return '/api/Broadcast/SetStatusCollapsed?' + str;
        }
    });

    Entities.NotificationNeverShowModel = Entities.Model.extend({
        url: function () {
            return '/api/Broadcast/SetStatusNeverShow?broadcastId=' + this.get('id');
        }
    });

    Entities.NotificationModel = Entities.Model.extend({});

    Entities.NotificationCollection = Entities.Collection.extend({
        noExceptHandler: true,
        url: '/api/Broadcast/GetList',
        model: Entities.NotificationModel,
        getStoreId: function () {
            return 'broadcast-collection';
        },
        setStore: function () {
            store.set(this.getStoreId(), JSON.stringify(this));
        },
        getStore: function () {
            this.reset();
            var storeNotifications = store.get(this.getStoreId());
            if (storeNotifications) {
                this.add(JSON.parse(storeNotifications));
            }
        }
    });
});
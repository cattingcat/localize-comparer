App.module("Components.Notif", function (Notif, App, Backbone, Marionette, $, _) {

    Notif.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.notifications = options.collection;
            this.layoutView = this.getLayoutView();

            App.notifRegion.show(this.layoutView);

            this.listenTo(this.layoutView, 'childview:notification:collapse', this.changeCollapse);
            this.listenTo(this.layoutView, 'childview:notification:hide', this.hideNotif);
        },

        setPromise: function (promise) {
            this.promise = promise;
        },

        changeCollapse: function (item, options) {
            //ждем пока произойдет попытка получения бродкастов
            if (this.promise) {
                this.promise.then(_.bind(function() {
                    this.collapse(item, options);
                }, this));
            } else {
                this.collapse(item, options);
            }
        },

        collapse: function(item, options) {
            var notification = this.notifications.get(options.id);
            if (notification) {
                notification.set({ IsCollapsed: options.collapsed }, { silent: true });
                var changeStat = new App.Entities.NotificationCollapsedModel(options);
                changeStat.save({}, { success: _.bind(this.successHandler, this), error: _.bind(this.errorHandler, this) });
                if (options.collapsed) {
                    App.Analytics.broadcastEvent('Hide', notification.get('Summary'));
                } else {
                    App.Analytics.broadcastEvent('Open', notification.get('Summary'));
                }
                
            }
        },

        hideNotif: function (item, options) {
            //ждем пока произойдет попытка получения бродкастов
            if (this.promise) {
                this.promise.then(_.bind(function () {
                    this.hide(item, options);
                }, this));
            } else {
                this.hide(item, options);
            }
        },

        hide: function (item, options) {
            var notification = this.notifications.get(options.id);
            if (notification) {
                this.notifications.remove(notification);
                var changeStat = new App.Entities.NotificationNeverShowModel(options);
                changeStat.save({}, { success: _.bind(this.successHandler, this), error: _.bind(this.errorHandler, this) });

                App.Analytics.broadcastEvent('Close', notification.get('Summary'));
            }
        },

        errorHandler: function (model, resp) {
            var msg = this.getResponseMsg(resp);
            if ((msg == 'UserNotFound' || msg == 'UserNotCorp') && !App.enableSignalR) {
                App.execute('logout:message', 'AccountProblems');
            }
        },

        successHandler: function () {
            //Если запись прошла успешно, сохраняем в локальное хранилище
            this.notifications.setStore();
        },

        getLayoutView: function () {
            return new Notif.List({ collection: this.notifications });
        }
    });

});
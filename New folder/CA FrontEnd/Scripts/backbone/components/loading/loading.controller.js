App.module("Components.Loading", function (Loading, App, Backbone, Marionette, $, _) {
    "use strict";

    Loading.SPINNER = 'spinner';
    Loading.OPACITY = 'opacity';

    Loading.LoadingController = App.Controllers.Base.extend({
        initialize: function (options) {
            var view = options.view,
                config = options.config,
                loadingView;
            _.isBoolean(config) && (config = {});

            _.defaults(config, {
                loadingType: Loading.SPINNER,
                entities: this.getEntities(view),
                debug: false
            });

            switch (config.loadingType) {
                case Loading.SPINNER:
                    loadingView = this.getLoadingView();
                    this.show(loadingView);
                    break;
                default:
                    throw new Error("Invalid loadingType");
            };

            this.showRealView(view, loadingView, config);
        },

        showRealView: function (realView, loadingView, config) {
            App.execute('when:fetched', config.entities, function (resp) {
                if (!resp) App.execute('auth:logout');
                this.fetched(realView, loadingView, config);
            }, this);

            App.execute('when:error', config.entities, function (resp) {
                if (!resp) App.execute('auth:logout');
                this.error(realView, loadingView, config, resp);
            }, this);
        },

        error: function (realView, loadingView, config, resp) {
            var errorHandler = config.errorHandler;

            if (errorHandler && errorHandler(this.region, resp) || errorHandler === false)
                return;

            if (this.checkForbidden(resp)) {
                App.execute('error:forbidden');
            } else {
                var ctrl = new App.ErrorApp.Show.Controller({
                    region: this.region,
                    type: 'internalError'
                });
            }
        },

        fetched: function (realView, loadingView, config) {
            realView.trigger('before:show');
            if (this.region == null || this.region.currentView != loadingView) {
                console.warn('Loading view was replaced');
            } else {
                this.show(realView);
            }
        },


        checkForbidden: function (resp) {
            var ret = this.getResponseMsg(resp);

            return (resp.status == 403 || ret == "AccessDenied");
        },

        getEntities: function (view) {
            return _.chain(view).pick('model', 'collection').toArray().compact().value();
        },

        getLoadingView: function () {
            if (this.options.config.modal) {
                var loading = App.request('loading:view', {
                    spinner: { color: '#fff' }
                });
                return App.request('modal:wrapper', { contentView: loading });
            } else {
                return new Loading.LoadingView();
            }
        }
    });

    App.commands.setHandler('show:loading', function (view, options) {
        return new Loading.LoadingController({
            view: view,
            region: options.region,
            config: options.loading
        });
    });

    App.reqres.setHandler('loading:view', function (options) {
        return new Loading.LoadingView(options);
    });
});
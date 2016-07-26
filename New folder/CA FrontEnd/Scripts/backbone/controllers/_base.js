App.module("Controllers", function (Controllers, App, Backbone, Marionette, $, _) {

    var base = Marionette.Controller.prototype;

    Controllers.Base = Marionette.Controller.extend({
        constructor: function(options) {
            options || (options = {});
            this.region = options.region || App.request("default:region");
            base.constructor.call(this, options);
            this._instance_id = _.uniqueId("controller");
            App.execute("register:instance", this, this._instance_id);
        },

        destroy: function() {
            delete this.region;
            delete this.options;
            App.execute("unregister:instance", this, this._instance_id);
            base.destroy.apply(this, arguments);
        },

        show: function(view, options) {
            options || (options = {});

            _.defaults(options, {
                loading: false,
                region: this.region
            });

            this._setMainView(view);
            this._manageView(view, options);
        },

        showError: function (title, text, options) {
            if (_.isObject(title)) options = title;
            options = options || {};

            if (options.errorView) {
                this.show(options.errorView, { loading: false });
                return;
            }

            if (!title || !text) {
                App.warn('Incorrect Controller.showError call: ', title, text);
            }
            var errorView = new App.ErrorApp.Show.CustomError({
                title: title,
                text: text
            });

            this.show(errorView, { loading: false });
        },

        showModalError: function (title, text, options) {
            if (_.isObject(title)) options = title;
            options = options || {};

            if (options.errorView) {
                this.errorView = options.errorView;

            } else if (this.getErrorView) {
                this.errorView = this.getErrorView(new Backbone.Model({
                    errorTitle: title,
                    errorDescription: text
                }));

            } else {
                this.errorView = new App.ErrorApp.Show.ModalError({
                    title: title,
                    text: text
                });
            }

            this.modalWrapper = App.request('modal:wrapper', { contentView: this.errorView });

            if (options.region) {
                options.region.show(this.modalWrapper);
            } else {
                this.show(this.modalWrapper, { loading: false });
            }
        },

        showModalSuccess: function (title, text, options) {
            if (!title) {
                App.warn('Incorrect Controller.showError call: ', title);
            }

            this.succView = new App.ErrorApp.Show.CustomSuccess({
                title: title,
                text: text
            });

            this.modalWrapper = App.request('modal:wrapper', { contentView: this.succView });

            App.modalRegion.show(this.modalWrapper);
        },

        getResponseMsg: function (resp) {
            var ret = App.responseCode(resp);
            //В случае инфраструктурных ошибок (сеть, отсутствие файла) в response.statusText приходит 'error', мапим на 'UnknownError'
            if (ret === 'error') {
                return 'UnknownError';
            }
            return ret;
        },

        getState: function () {
            if (this.getStoreId && StorageQueue.check('save-store')) {
                StorageQueue.del('save-store');
                var id = this.getStoreId(),
                    state = store.get(id);
                store.remove(id);
                return state;
            }

            return null;
        },

        saveState: function (state) {
            if (this.getStoreId) {
                var id = this.getStoreId(),
                    oldState = store.get(id) || {};

                state = _.extend(oldState, state);
                return store.set(id, state);
            }
        },

        applyState: function (hasStateCallback, noStateCallback) {
            this.state = this.getState();
            if (this.state) {
                hasStateCallback.call(this, this.state);
            } else {
                this.state = {};
                if (noStateCallback) noStateCallback.call(this, this.state);
            }
        },

        glob: _.bind(Globalize.formatMessage, Globalize),

        _setMainView: function (view) {
            if (!this._mainView) {
                this._mainView = view;
                this.listenTo(view, 'destroy', this.destroy);
            }
        },

        _manageView: function (view, options) {
            if (options.loading) {
                App.execute('show:loading', view, options);
            } else {
                options.region.show(view, { forceShow: true });
            }
        }
    });

});

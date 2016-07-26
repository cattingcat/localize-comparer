App.module("LicenseApp.Compatible", function (Compatible, App, Backbone, Marionette, $, _) {
    Compatible.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.collection = new App.Entities.CompatibleApplicationCollection([], { licenseId: this.options.licenseId });

            this.layoutView = this.getLayoutView();
            this.loadingView = this.getLoadingView();

            this.modalWrapper = App.request('modal:wrapper', { contentView: this.loadingView });

            this.show(this.modalWrapper, { loading: false });

            this.collection.fetch();
            App.execute('when:fetched', [this.collection], this.onFetched, this);
            App.execute('when:error', [this.collection], this.onError, this);
        },

        onFetched: function (model, resp) {
            this.applicationListView = this.getApplicationListView();
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.layoutView });
            this.show(this.modalWrapper, { loading: false });

            this.layoutView.applicationListRegion.show(this.applicationListView);
        },

        onError: function (model, resp) {
            var code = this.getResponseMsg(resp),
                msgTitle = Globalize.formatMessage('license/compatible/errors/' + code);

            App.Analytics.licenseApplicationListError(resp);

            var msg = {
                title: msgTitle.title(),
                message: msgTitle.message()
            };

            var modalView = this.getErrorView(msg);

            this.modalWrapper = App.request('modal:wrapper', { contentView: modalView });
            this.show(this.modalWrapper, { loading: false });
        },

        getLoadingView: function () {
            return App.request('loading:view', {
                spinner: { color: '#000' }
            });
        },
        getApplicationListView: function () {
            return new Compatible.ApplicationList({ collection: this.collection });
        },
        getLayoutView: function () {
            return new Compatible.LayoutView({ model: new Backbone.Model({ name: this.options.name }) });
        },

        getErrorView: function (opts) {
            return new Compatible.ErrorView(opts);
        },
        getSyncView: function (opts) {
            return new Compatible.SyncView(opts);
        }

    });
});
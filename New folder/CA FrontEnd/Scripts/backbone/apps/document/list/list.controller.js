App.module("DocumentApp.List", function (List, App, Backbone, Marionette, $, _) {
    List.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.contracts = App.request('contract:entities');
            this.layoutView = new List.LayoutView();

            this.contracts.setDefaultErrorHandler(_.bind(this.errorHandler, this));

            this.listenTo(this.layoutView, 'show', this.showRegions);
            this.show(this.layoutView, { loading: { entities: this.contracts, errorHandler: _.bind(this.loadingErrorHandler, this) } });
        },

        loadingErrorHandler: function (region, resp) {
            return this.errorHandler(this.contracts, resp);
        },

        errorHandler: function (model, resp) {
            var loc = App.ErrorLocalizer.getModalText('document/list/errors', resp);

            App.Analytics.contractsError(resp);

            var errorView = new App.ErrorApp.Show.MainRegionError({
                regionTitle: this.glob('document/list/tabs/contracts'),
                title: loc.title,
                text: loc.text
            });
            App.mainRegion.show(errorView);
        },

        showCollection: function () {
            this.contractListView = new List.ContractList({ collection: this.contracts });
            this.listenTo(this.contractListView, 'childview:contract:view', this.onContractView);
            this.layoutView.contractListRegion.show(this.contractListView);
        },

        showLoading: function () {
            var loadingView = App.request('loading:view', {
                spinner: { color: '#000' }
            });
            this.layoutView.contractListRegion.show(loadingView);
        },

        showRegions: function () {
            this.showCollection();

            this.pagerView = App.request('pager:view', { collection: this.contracts });
            this.layoutView.pagerRegion.show(this.pagerView);

            this.listenTo(this.contracts, 'request', this.showLoading);
            this.listenTo(this.contracts, 'reset add remove', this.showCollection);
        }
    });
});
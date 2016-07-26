App.module("RequestApp.List", function (List, App, Backbone, Marionette, $, _) {
    'use strict';

    List.Controller = App.Controllers.Base.extend({
        initialize: function () {
            App.execute('show:broadcast');

            this.applyState(function (state) {
                var collState = state.collectionState,
                    filter = collState && collState.filter;

                this.requests = App.request('request:entities', { state: collState });
                this.filterModel = App.request('request:filter:entity', filter);
            }, function () {
                this.requests = App.request('request:entities');
                this.filterModel = App.request('request:filter:entity');
            });

            this.requests.setDefaultErrorHandler(_.bind(this.errorHandler, this));

            this.isSimpleUser = App.AuthInfo.isUser();

            this.layoutView = this.getLayoutView();

            this.listenTo(this.layoutView, 'show', this.showRegions);

            this.show(this.layoutView, {
                loading: {
                    entities: [this.requests],
                    errorHandler: _.bind(this.loadingErrorHandler, this)
                }
            });
        },

        onRoleChange: function (auth) {
            App.mainRegion.reset();
            App.execute('request:list');
        },

        loadingErrorHandler: function (region, resp) {
            return this.errorHandler(this.requests, resp);
        },

        errorHandler: function (model, resp) {
            var loc = App.ErrorLocalizer.getModalText('request/list/errors', resp);

            App.Analytics.requestListError(resp);

            var errorView = new App.ErrorApp.Show.MainRegionError({
                regionTitle: this.glob('request/list/tabs/requests'),
                title: loc.title,
                text:loc.text
            });
            App.mainRegion.show(errorView);

            return true;
        },

        showCollection: function () {
            this.requestListView = this.getRequestListView();
            this.listenTo(this.requestListView, 'childview:request:view', this.onRequestView);
            this.listenTo(this.requestListView, 'childview:request:create', this.onRequestCreate);
            this.layoutView.requestListRegion.show(this.requestListView);

            var hideFilter = !this.isDirtyFilter() && !this.requests.any();
            this.layoutView.switchFilters(!hideFilter);
            this.layoutView.switchPagination(true);
        },

        isDirtyFilter: function () {
            var filt = this.requests.state.filter;
            if (!filt) return false;
            if (filt.Status && filt.Status != 'All') return true;
            if (!this.isSimpleUser && filt.IncidentSubmitterAlgorithm != 'Default') return true;
            return false;
        },

        showLoading: function () {
            var filterState = _.pick(this.requests.state,
                ['currentPage', 'filter']);
            this.state.collectionState = filterState;
            this.saveState(this.state);

            var loadingView = this.getLoadingView();
            this.layoutView.requestListRegion.show(loadingView);
            this.layoutView.switchPagination(false);
        },

        showRegions: function () {
            this.showCollection();

            this.pagerView = this.getPagerView();
            this.layoutView.pagerRegion.show(this.pagerView);

            this.listenTo(this.requests, 'request', this.showLoading);
            this.listenTo(this.requests, 'reset', this.showCollection);
            this.listenTo(this.filterModel, 'change', this.onFilterChange);
            this.listenTo(App.AuthInfo, 'change:role', this.onRoleChange);
        },

        onRequestCreate: function () {
            App.execute('request:create');
        },

        onRequestView: function (view, options) {
            var id = view.model.get('InstanceId');
            if (id) {
                App.Analytics.requestEvent(view.model, 'Open');
                App.execute('request:view', id);
            } else {
                App.warn('Request without InstanceId');
            }
        },

        getStoreId: function () {
            return 'request_list';
        },

        onFilterChange: function () {
            var filter = {};
            var status = this.filterModel.get('Status'),
                author = this.filterModel.get('IncidentSubmitter'),
                algo;
            
            switch(author) {
                case 'All':
                    algo = 'Default';
                    author = null;
                break;
                case 'ByDeletedUsers':
                    algo = author;
                    author = null;
                break;
                default:
                    if (author) {
                        algo = 'ByName';
                    } else {
                        if (this.isSimpleUser) {
                            algo = 'ByName';
                            author = App.AuthInfo.get('username');
                        } else {
                            algo = 'Default';
                        }
                    }
                    break;
            }

            if (status) {
                filter.Status = status;
                App.Analytics.requestEvent(null, 'Filter', status);
            }
            filter.IncidentSubmitter = author;
            filter.IncidentSubmitterAlgorithm = algo;

            this.requests.setFilter(filter, { reset: true, error:_.bind(this.errorHandler, this) });
        },

        getLoadingView: function () {
            return App.request('loading:view', {
                spinner: { color: '#000' }
            });
        },

        getLayoutView: function () {
            return new List.LayoutView({
                model: this.filterModel,
                requests: this.requests
            });
        },

        getPagerView: function () {
            return App.request('pager:view', { collection: this.requests });
        },

        getRequestListView: function () {
            return new List.RequestList({
                collection: this.requests,
                isSimpleUser: this.isSimpleUser
            });
        }
    });
});
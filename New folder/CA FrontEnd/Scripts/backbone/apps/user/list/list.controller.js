App.module("UserApp.List", function (List, App, Backbone, Marionette, $, _) {
    List.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.applyState(function (state) {
                var collState = state.collectionState,
                    filter = collState && collState.filter;

                this.users = App.request('user:entities', { state: collState });
                this.filterModel = App.request('user:filter:entity', filter);
            }, function () {
                this.users = App.request('user:entities');
                this.filterModel = App.request('user:filter:entity');
            });

            this.users.setDefaultErrorHandler(_.bind(this.errorHandler, this));

            this.filters = App.request('user:filters:entities');

            this.authModel = App.request('auth:entity');

            this.layoutView = new List.LayoutView({
                model: this.filterModel,
                filters: this.filters
            });

            this.listenTo(this.layoutView, 'show', this.showRegions);
            this.listenTo(this.layoutView, 'sort:direction:change', this.onSortDirectionChange);

            this.show(this.layoutView, { loading: {
                entities: [this.users, this.filters],
                errorHandler: _.bind(this.loadingErrorHandler, this)
            }});
        },

        loadingErrorHandler: function (region, resp) {
            return this.errorHandler(this.users, resp);
        },
        errorHandler: function (model, resp) {
            var loc = App.ErrorLocalizer.getModalText('user/list/errors', resp);

            App.Analytics.usersError(resp);

            var errorView = new App.ErrorApp.Show.MainRegionError({
                regionTitle: this.glob('user/list/header'),
                title: loc.title,
                text: loc.text
            });
            App.mainRegion.show(errorView);

            return true;
        },

        showRegions: function () {
            this.showCollection();

            var pagerView = App.request('pager:view', { collection: this.users });
            this.layoutView.pagerRegion.show(pagerView);

            this.listenTo(this.filterModel, 'change', this.onFilterChange);

            this.listenTo(this.users, 'request', this.showLoading);
            this.listenTo(this.users, 'reset add remove', this.showCollection);
        },

        showCollection: function () {
            this.userListView = new List.UserList({ collection: this.users });
            this.listenTo(this.userListView, 'childview:user:view', this.onUserView);
            this.layoutView.userListRegion.show(this.userListView);
            this.layoutView.switchPagination(true);
        },

        showLoading: function () {
            var filterState = _.pick(this.users.state,
               ['currentPage', 'filter']);
            this.state.collectionState = filterState;
            this.saveState(this.state);

            var loadingView = App.request('loading:view', {
                spinner: { color: '#000' }
            });
            this.layoutView.userListRegion.show(loadingView);
            this.layoutView.switchPagination(false);
        },

        onUserView: function (view, options) {
            var currentEmail = this.authModel.get('username').toLowerCase(),
                clickedEmail = view.model.get('UserLogin').toLowerCase();

            App.Analytics.usersEvent('User profile | Open');

            if (currentEmail == clickedEmail) {
                App.execute('profile:show');
            } else {
                App.execute('user:show', clickedEmail);
            }
        },

        onSortDirectionChange: function (isDesc) {
            var order = isDesc ? 'LastNameDesc' : 'LastNameAsc';
            this.users.setFilter('sort', order, { reset: true });
            this.filterModel.set('sort', order, { quite: true });
            App.Analytics.usersEvent('User | Sort', 'Surname');
        },

        onFilterChange: function () {
            var filter = {},
                country = this.filterModel.get('country'),
                org = this.filterModel.get('organization');
            if (country || country == '') {
                filter.countryFilter = country;
                if (country != '') {
                    App.Analytics.usersEvent('User | Filter', 'Country');
                }
            }
            if (org || org == '') {
                filter.organizationFilter = org;
                if (org != '') {
                     App.Analytics.usersEvent('User | Filter', 'Filial');
                }
            }
            this.users.setFilter(filter, { reset: true });
        },

        getStoreId: function () {
            return 'user_list_store_id';
        }
    });
});
App.module("LicenseApp.List", function (List, App, Backbone, Marionette, $, _) {
    List.Controller = App.Controllers.Base.extend({
        initialize: function () {
            App.execute('show:broadcast');

            this.applyState(function (state) {
                var collState = state.collectionState,
                    addLic = state.addLicense,
                    filter = collState && collState.filter;

                this.expandedItems = state.openedIndexes;

                this.licenses = App.request('license:entities', { state: collState });
                this.addLicense = App.request('license:add:model:instance', addLic);
                this.filterModel = new Backbone.Model(filter);
            }, function () {
                this.licenses = App.request('license:entities');
                this.addLicense = App.request('license:add:model:instance');
                this.filterModel = new Backbone.Model();
            });

            this.licenses.setDefaultErrorHandler(_.bind(this.errorHandler, this));

            this.layoutView = new List.LayoutView({ model: this.filterModel });
            this.listenTo(this.layoutView, 'show', this.showRegions);
            this.listenTo(this.layoutView, 'before:show', this.beforeShow);
            this.listenTo(this.layoutView, 'sort:direction:change', this.onSortDirectionChange);

            this.listenTo(this.addLicense, 'change:ActivationCode', this.onChangeLicense);

            this.show(this.layoutView, { loading: { entities: this.licenses, errorHandler: _.bind(this.loadingErrorHandler, this) } });
        },

        loadingErrorHandler: function (region, resp) {
            return this.errorHandler(this.licenses, resp);
        },

        errorHandler: function (model, resp) {
            var loc = App.ErrorLocalizer.getModalText('license/list/errors', resp);

            App.Analytics.licenseListError(resp);

            var errorView = new App.ErrorApp.Show.MainRegionError({
                regionTitle: this.glob('license/list/title'),
                title: loc.title,
                text: loc.text
            });
            App.mainRegion.show(errorView);
        },

        beforeShow: function () {
            if (!this.expandedItems) return;

            _.each(this.expandedItems, _.bind(function (index) {
                var model = this.licenses.at(index);
                if (model) model.set({ expand: true });
            }, this));
        },

        showRegions: function () {
            this.showCollection();

            var pagerView = App.request('pager:view', { collection: this.licenses });
            this.layoutView.pagerRegion.show(pagerView);

            this.licenseAddView = new List.LicenseAdd({ model: this.addLicense });
            this.layoutView.licenseAddRegion.show(this.licenseAddView);

            this.listenTo(this.licenseAddView, 'code:send', this.onSendCode);
            this.listenTo(this.filterModel, 'change', this.onFilterChange);
            this.listenTo(this.licenses, 'request', this.showLoading);
            this.listenTo(this.licenses, 'reset', this.showCollection);
        },

        showLoading: function () {
            // page or filtering change
            var filterState = _.pick(this.licenses.state,
                ['currentPage', 'filter']);
            this.state.collectionState = filterState;
            this.saveState(this.state);

            var loadingView = App.request('loading:view', {
                spinner: { color: '#000' }
            });
            this.layoutView.licenseListRegion.show(loadingView);
        },

        showCollection: function () {
            var authModel = App.request('auth:entity');
            this.licenseListView = new List.LicenseList({
                collection: this.licenses,
                authModel: authModel
            });
            this.listenTo(this.licenseListView, 'childview:compatible:show', this.onCompatibleShow);
            this.listenTo(this.licenseListView, 'childview:license:remove', this.onLicenseRemove);
            this.listenTo(this.licenseListView, 'state:changed', this.expandStateChanged);
            this.layoutView.licenseListRegion.show(this.licenseListView);
        },

        expandStateChanged: function (openedViews) {
            this.state.openedIndexes = openedViews;
            this.saveState(this.state);
        },

        onLicenseRemove: function (view, options) {
            App.request('confirm:view', {
                title: this.glob('license/list/remove/confirm-title'),
                text: this.glob('license/list/remove/confirm-text', options.model.get('SaleListName')),
                acceptButtonText: this.glob('license/list/remove/confirm-button'),
                success: _.bind(function () {
                    var removeLicense = App.request('license:remove:model:instance');

                    removeLicense.set('LicenseId', options.model.get('ReconciliationID'));
                    removeLicense.save(null, {
                        success: _.bind(function (model, resp) {
                            this.licenses.state.currentPage = 1;
                            this.licenses.fetch();

                            App.Analytics.licenseEvent('Delete', options.model.get('Status'));

                            // Update broadcasts
                            App.execute('show:broadcast');
                        }, this),
                        error: _.bind(function (model, resp) {
                            App.Analytics.licenseDeleteError(resp);
                            var loc = App.ErrorLocalizer.getModalText('license/remove/errors', resp);
                            this.showModalError(loc.title, loc.text, { region: App.modalRegion });
                        }, this)
                    });
                }, this)
            });
        },

        onChangeLicense: function (model, code) {
            this.state.addLicense = { ActivationCode: code };
            this.saveState(this.state);
        },

        onSendCode: function () {
            if (!this.addLicense.isValid(true)) return;
            var view = this.licenseAddView;
            view.switchLoading(true);
            view.switchErrorMsg(false);
                
            this.addLicense.save(null, {
                success: _.bind(function (model, resp) {

                    if (model.has('KeyFile')) {
                        App.Analytics.licenseAddEvent('Success| Key file');
                    } else {
                        App.Analytics.licenseAddEvent('Success| Code');
                    }

                    view.fieldValidation = false;
                    this.noFilterRequest = true;

                    this.filterModel.set({
                        sort: 'EndDateAsc',
                        status: 'All'
                    });

                    model.unset('ActivationCode');
                    model.unset('KeyFile');

                    view.switchLoading(false, true);

                    this.licenses.fetch();
                    this.noFilterRequest = false;
                    view.fieldValidation = true;

                    if (resp.IsUserSuccessMoved) {
                        var successUserMovedView = new List.SuccessUserMovedView({ model: this.addLicense });
                        this.listenTo(successUserMovedView, 'success:click', _.bind(this.onPageReload, this));
                        var modalWrapper = App.request('modal:wrapper', { contentView: successUserMovedView });
                        modalWrapper.on('modal:hide', _.bind(this.onPageReload, this));
                        App.modalRegion.show(modalWrapper);
                    }

                    App.execute('show:broadcast');
                }, this),
                error: _.bind(function (model, resp) {
                    view.switchLoading(false);
                    model.unset('KeyFile');

                    App.Analytics.licenseAddError(resp);

                    if (resp.isValidationError) return;

                    var msg = App.ErrorLocalizer.getErrorText('license/add/errors', resp);
                    view.switchErrorMsg(msg.text);
                }, this)
            });
        },

        onPageReload: function () {
            App.execute('auth:clearToken');
            App.execute('page:reload');
        },

        onSortDirectionChange: function (isDesc) {
            var opts =  { reset: true, noRequest: this.noFilterRequest };

            if (isDesc) {
                this.filterModel.set('sort', 'EndDateDesc', { silent: true });
                this.licenses.setFilter('sort', 'EndDateDesc', opts);

                App.Analytics.licenseEvent('Sort', 'Descending');
            } else {
                this.filterModel.set('sort', 'EndDateAsc', { silent: true });
                this.licenses.setFilter('sort', 'EndDateAsc', opts);

                App.Analytics.licenseEvent('Sort', 'Ascending');
            }
        },

        onFilterChange: function () {
            var filterStatus = this.filterModel.get('status');
            this.licenses.setFilter('filter', filterStatus,
                { reset: true, noRequest: this.noFilterRequest });

            App.Analytics.licenseEvent('Filter', filterStatus);
        },

        onCompatibleShow: function (view, options) {
            var licId = options.model.get('ReconciliationID'),
                name = options.model.get('SaleListName');

            new App.LicenseApp.Compatible.Controller({
                name: name,
                licenseId: licId,
                region: App.modalRegion
            });

            App.Analytics.licenseEvent('Application list');
        },

        getStoreId: function () {
            return 'license_list_store_id';
        }
    });
});
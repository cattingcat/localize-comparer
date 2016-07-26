App.module("RequestApp.List", function (List, App, Backbone, Marionette, $, _) {
    'use strict';

    List.LayoutView = App.Views.LayoutView.extend({
        template: "request/list/layout",
        className: "section",
        regions: {
            'requestListRegion': '.request-list-region',
            'pagerRegion': '.pager-region'
        },
        bindings: {
            '.request-status': 'Status',
            '.request-author': 'IncidentSubmitter'
        },
        ui: {
            filterBlock: '.request-list-filter-block'
        },

        switchPagination: function (state) {
            this.$('.pager-region').toggleClass('off', !state);
        },

        switchFilters: function (state) {
            this.ui.filterBlock.toggleClass('off', !state);
        },

        refreshFilters: function (options) {
            var authors = options.Authors,
                special = options.SpecialAuthorFilterValues;

            var authorsSelect = this.$('.request-author');
        },

        serializeData: function () {
            var base = App.Views.LayoutView.prototype.serializeData.apply(this, arguments),
                requestEntity = this.options.requests;

            var showByDeleted = true;
            if (requestEntity.filters) {
                // authors filter will be renderen in template
                this.authors = requestEntity.filters.Authors;
                var special = requestEntity.filters.SpecialAuthorFilterValues;
                showByDeleted = _.contains(special, 'ByDeletedUsers');
            }

            return _.extend(base, {
                authors: this.authors || false,
                showByDeleted: showByDeleted
            });
        },

        onRender: function () {
            this.stickit();
        }
    });

    List.RequestItem = App.Views.ItemView.extend({
        template: "request/list/request",
        bindings: {
            '.request-number': 'IncidentNumber',
            '.request-status': {
                observe: 'UserfriendlyStatus',
                onGet: function (val) {
                    return Globalize.formatMessage('request/statuses/' + val);
                }
            },
            '.request-create-date': {
                observe: 'CreateDate',
                onGet: function (val) {
                    var localeDate = App.toLocalDate(val);
                    return Globalize.formatDate(localeDate, { datetime: "short" });
                }
            }
        },
        events: {
            'click': 'onItemClick'
        },
        onItemClick: function (ev) {
            if (ev) ev.preventDefault();
            // Различаем событие клика и событие выбора текста
            if (!getSelection().toString())
                this.trigger('request:view');
        },
        onRender: function () {
            this.stickit();
        },
        serializeData: function () {
            var retVal = App.Views.ItemView.prototype.serializeData.apply(this);
            var color = Helpers.getColorByStatus(retVal.UserfriendlyStatus);

            retVal.statusBorderClass = 'bg-' + color;
            retVal.statusTextClass = 'clr-' + color;

            return retVal;
        }
    });

    List.NoRequest = App.Views.ItemView.extend({
        template: 'request/list/no-request',
        triggers: {
            'click .create-request': 'request:create'
        }
    });

    List.NoFilteredRequest = App.Views.ItemView.extend({
        template: 'request/list/no-filtered-request'
    });

    List.RequestList = App.Views.CollectionView.extend({
        childView: List.RequestItem,
        getEmptyView: function () {
            var filter = this.collection.state.filter;
            if (filter) {
                var defaultStatus = !filter.Status || filter.Status == 'All',
                    defaultAlgo = this.options.isSimpleUser || filter.IncidentSubmitterAlgorithm == 'Default';
                if (defaultStatus && defaultAlgo) filter = null;
            }

            if (!filter) {
                return List.NoRequest;
            } else {
                return List.NoFilteredRequest;
            }
        }
    });
});
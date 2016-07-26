App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.Collection = Backbone.Collection.extend({
        sync: function (method, entity, options) {
            if (this.auth === false) {
                options = options || {};
                options.auth = false;
            }
            return Backbone.Collection.prototype.sync.call(this, method, entity, options);
        }
    });

    var _extend = Entities.Collection.extend;

    Entities.PageableCollection = Entities.Collection.extend({
        queryParams: {
            pageSize: 'top',
            skip: 'skip',
            sortKey: 'orderBy',
            order: 'order',
            filter: 'filter',
            directions: {
                "asc": "asc",
                "desc": "desc"
            }
        },

        state: {
            pageSize: 10,
            skip: function () {
                return (this.currentPage -1) * this.pageSize;
            },
            currentPage: 1,
            sortKey: null,
            order: null,
            filter: null,
            lastPage: null,
            totalPages: null,
            totalRecords: null
        },

        constructor: function (models, options) {
            options || (options = {});
            this.configureQueryParams(options.queryParams || {});
            this.configureState(options.state || {});
            Entities.Collection.apply(this, arguments);
            //this.configureFilter(options.filter || {});
        },

        setDefaultErrorHandler: function (errorHandler) {
            this.errorHandler = errorHandler;
        },

        configureQueryParams: function (queryParams) {
            this.queryParams = this.deepClone(_.defaults(
                {},
                queryParams,
                this.queryParams
            ));
        },

        configureState: function (state) {
            this.state = this.deepClone(_.defaults(
                {},
                state,
                this.state
            ));
        },

        deepClone: function (obj) {
            return $.extend(true, {}, obj);
        },

        fetch: function (options) {
            options || (options = {});
            options.reset = true;


            if (this.fetch_xhr) {
                var state = this.fetch_xhr.state();
                if (state == "pending") {
                    this.fetch_xhr.abort();
                }
            }
            options.error = options.error || this.errorHandler;

            if (options.error) {
                var base = options.error;
                var errorWrapper = function (jqXHR, textStatus, errorThrown) {
                    if (textStatus.statusText == "abort") {
                        App.log('Old pageable collection request aborted');
                        return;
                    }

                    base(jqXHR, textStatus, errorThrown);
                }

                options.error = errorWrapper;
            }

            if (options.state) {
                _.extend(this.state, options.state);
            }

            options.data = options.type == 'POST' ? options.data : _.extend(this.prepareData(), options.data || {});

            this.fetch_xhr = Entities.Collection.prototype.fetch.call(this, options);
            return this.fetch_xhr;
        },


        prepareData: function (options) {
            options || (options = {});
            var queryParams = options.queryParams || this.queryParams;
            var state = options.state || this.state;
            var internal = ['pageSize', 'sortKey', 'order', 'filter', 'skip'];
            var data = {};
            _.each(internal, function (param) {
                var paramName, value;
                if (_.isFunction(queryParams[param])) {
                    value = queryParams[param](state);
                    paramName = param;
                } else {
                    value = _.result(state, param);
                    paramName = queryParams[param];
                    if (param == "order") {
                        value = queryParams.directions[value];
                    }
                }
                if (!_.isNull(value) && !_.isUndefined(value)) {
                    data[paramName] = value;
                }
            }, this);
            var extra = _.omit(queryParams, internal, 'directions');
            _.each(extra, function (value, key) {
                data[key] = _.isFunction(value) ? value(state) : value;
                if (_.isUndefined(data[key]) || _.isNull(data[key])) {
                    delete data[key];
                }
            }, this);
            if (this.state.filter) {
                data = _.omit(data, 'filter');
                _.extend(data, this.state.filter);
            }

            return _.pick(data, function (val, key) { return !!val; });
        },

        parse: function (resp) {
            var state = _.clone(this.state);

            this.updateState(this.parseState(resp, state));
            return this.parseRecords(resp);
        },

        parseState: function (resp, state) {
            return {
                totalRecords: resp.Count
            };
        },

        parseRecords: function (resp) {
            return resp.Items;
        },

        updateState: function (state) {
            state.totalPages = Math.ceil(state.totalRecords / this.state.pageSize);
            state.lastPage = state.totalPages;
            this.state = _.extend({}, this.state, state);
        },

        getPage: function (index, options) {
            if (!this.setPage(index)) {
                return false;
            }
            return this.fetch(options);
        },

        setPage: function (index) {
            var shortCuts = {
                first: 1,
                prev: this.state.currentPage - 1,
                next: this.state.currentPage + 1,
                last: this.state.lastPage
            };
            if (_.has(shortCuts, index)) {
                index = shortCuts[index];
            }
            if (index > this.state.lastPage || index < 1) {
                return false;
            }
            this.state.currentPage = index;
            this.trigger('collection:setpage', index);
            return true;
        },

        hasPrevious: function () {
            return this.state.currentPage > 1;
        },

        hasNext: function () {
            return this.state.currentPage < this.state.lastPage;
        },

        getFirstPage: function (options) {
            return this.getPage("first", options);
        },

        getPreviousPage: function (options) {
            return this.getPage("prev", options);
        },

        getNextPage: function (options) {
            return this.getPage("next", options);
        },

        getLastPage: function (options) {
            return this.getPage("last", options);
        },

        getFilter: function () {
            return this.state.filter;
        },

        setFilter: function (key, value, options) {
            this.state.filter = this.state.filter || {};
            if (_.isObject(key)) {
                var obj = key;
                var self = this;
                options = value;
                _.each(obj, function (value, key) {
                    self.state.filter[key] = value;
                });
            } else {
                this.state.filter[key] = value;
            }

            var noRequest = (options || {}).noRequest;

            this.state.currentPage = 1;
            if (!noRequest) {
                return this.fetch(options);
            }
        },

        setSorting: function (sortKey, order, options) {
            if (this.state.sortKey != sortKey || this.state.order != order) {
                this.state.sortKey = sortKey;
                this.state.order = order || this.state.order;
                //return this.fetch(options);
                return true;
            }
            return false;
        },

        getSortColumn: function () {
            return this.state.sortKey;
        },

        getSortOrder: function () {
            return this.state.order;
        }
    }, {
        extend: function (protoProps, staticProps) {
            var select = ['queryParams', 'state'];
            var parent = this;
            _.each(select, function (prop) {
                protoProps[prop] = _.defaults({}, protoProps[prop] || {}, parent.prototype[prop]);
            });
            return _extend.apply(this, arguments);;
        }
    });


});
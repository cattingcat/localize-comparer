App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    function unescapeNewLines(str) {
        return str
            .replace(/\n/g, "<br />")
            .replace(/&#10;/g, "<br />");
    }

    // Base model for requests models whith analytics
    Entities.RequestModelBase = Entities.Model.extend({
        initialize: function () {
            this.on('change', this.onChange);
            this.on('validated:invalid', this.onValidationInvalid);
        },
        onChange: function (model, opts) {
            if (!model.analyticsInitiate && opts.stickitChange && opts.stickitChange.observe != 'AttachedFiles') {
                App.Analytics.newRequestEvent(model, 'Initiate');
                model.analyticsInitiate = true;
            }
        },
        onValidationInvalid: function (model, errors) {
            App.Analytics.newRequestValidationError(model, errors);
        }
    });

    // Base model for support requests models
    Entities.SupportModelBase = Entities.RequestModelBase.extend({
        validationGlobPath: 'request/errors/',
        initialize: function () {
            Entities.RequestModelBase.prototype.initialize.call(this);
        }
    });

    // Base model for worklog collection
    Entities.WorkLogCollection = Entities.Collection.extend({});


    // Manage requests models:
    Entities.CommentModel = Entities.RequestModelBase.extend({
        url: "/api/Request/AddComment",
        analyticsRequestType: "Request | Send answer",
        initialize: function () {
            Entities.RequestModelBase.prototype.initialize.call(this);
            var validationGlobPath = 'request/errors/';
            this.validation = this.getValidationRules(this.url, validationGlobPath);

            // TODO Martynov: Удалить после валидации файлов
            this.extendValidation({
                AttachedFiles: function (value, attr, val, model, computed) {
                    if (value && _.isArray(value) && value.length > 3)
                        return Globalize.formatMessage('request/errors/maxFiles3');
                }
            });
        }
    });
    Entities.CloseRequestModel = Entities.Model.extend({
        url: '/api/Request/CloseRequest'
    });

    Entities.RequestFilterModel = Entities.Model.extend({});
    Entities.RequestInfoModel = Entities.Model.extend({});

    Entities.RequestModel = Entities.Model.extend({
        idAttribute: 'InstanceId',
        analyticsRequestType: "Request",
        url: function () {
            var id = this.get('IncidentNumber');
            if (id) return '/api/Request/GetDetails?number=' + id;

            return '/api/Request/GetDetailsById?id=' + this.get('InstanceId');
        },
        parse: function (val) {
            if (!val.Details) App.error('Request withoud Details!');
            val.Details = unescapeNewLines(val.Details);

            if (val.Worklog.IsSuccess === 'True') {
                var wlColl = val.Worklog.Result;
                _.each(wlColl, function (item) {
                    item.Description = unescapeNewLines(item.Description);
                });
                val.Worklog = new Entities.WorkLogCollection(wlColl);
                val.IsWorklogSuccess = true;
            }

            return val;
        }
    });

    // Request list Models:
    Entities.Requests = Entities.PageableCollection.extend({
        url: '/api/Request/GetList',
        parse: function (resp) {
            var requests = _.pick(resp, ['Count', 'Requests']),
                filters = _.pick(resp, ['SpecialAuthorFilterValues', 'Authors']);

            this.filters = filters;

            return Entities.PageableCollection.prototype.parse.call(this, requests);
        },
        parseRecords: function (resp) {
            return resp.Requests;
        },
        initialize: function () {
            Entities.PageableCollection.prototype.initialize.call(this);
            this.on('collection:setpage', App.Analytics.requestPageEvent);
        }
    });

    Entities.RequestFilterModel = Entities.Model.extend({
    });

    // Request types model:
    Entities.RequestTypeList = Entities.Collection.extend({
        url: '/api/Request/GetRequestTypeList'
    });


    var API = {
        getRequestEntities: function (options) {
            var collection = new Entities.Requests();

            var filter = {
                IncidentSubmitterAlgorithm: 'Default',
                Status: 'All'
            };

            collection.setFilter(filter, { noRequest: true });

            collection.fetch(options);
            return collection;
        },
        getRequestFilter: function (options) {
            return new Entities.RequestFilterModel(options);
        },
        getRequestInfo: function (options) {
            return new Entities.RequestInfoModel(options);
        },

        getRequestEntity: function (id) {
            var model = new Entities.RequestModel({ });

            if (id.indexOf('INC') != -1) {
                model.set({ IncidentNumber: id }, { silent: true });
            } else {
                model.set({ InstanceId: id }, { silent: true });
            }

            model.fetch();
            return model;
        },
        getCommentModelInstance: function (options) {
            return new Entities.CommentModel();
        },
        getCloseRequestInstance: function (options) {
            return new Entities.CloseRequestModel(options);
        },

        getRequestTypeList: function (options) {
            var collection = new Entities.RequestTypeList();
            collection.fetch(options);
            return collection;
        }
    };


    App.reqres.setHandler('request:entities', function (options) {
        return API.getRequestEntities(options);
    });
    App.reqres.setHandler('request:filter:entity', function (options) {
        return API.getRequestFilter(options);
    });
    App.reqres.setHandler('request:info:entity', function (options) {
        return API.getRequestInfo(options);
    });

    App.reqres.setHandler('request:entity', function (id) {
        return API.getRequestEntity(id);
    });
    App.reqres.setHandler('close:request:model', function (options) {
        return API.getCloseRequestInstance(options);
    });
    App.reqres.setHandler('request:comment:instance', function (options) {
        return API.getCommentModelInstance(options);
    });

    App.reqres.setHandler('requestTypeList:entities', function (options) {
        return API.getRequestTypeList(options);
    });
});
App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.CaInitiate = Entities.Model.extend({
        url: '/api/Request/CaRequestInitiate'
    });

    // Other requests
    Entities.CSRModel = Entities.RequestModelBase.extend({
        url: "/api/Request/CsrRequestSubmit",
        analyticsRequestType: "CSR",
        fileAttribute: 'KeyFile',
        initialize: function () {
            Entities.RequestModelBase.prototype.initialize.call(this);
            var validationGlobPath = 'request/errors/';
            this.validation = this.getFileValidationRules(this.url, validationGlobPath);
        }
    });

    Entities.CAModel = Entities.SupportModelBase.extend({
        url: "/api/Request/CAQuestionSubmit",
        analyticsRequestType: "'CA Question",
        initialize: function () {
            Entities.SupportModelBase.prototype.initialize.call(this);
            var validationGlobPath = 'request/errors/';
            this.validation = this.getValidationRules(this.url, validationGlobPath);

            /* TODO Martynov: Разобраться с валидацией файлов */
            this.extendValidation({
                AttachedFiles: function (value, attr, val, model, computed) {
                    if (value && _.isArray(value) && value.length > 3) return Globalize.formatMessage('request/errors/maxFiles3');
                }
            });
        }
    });

    Entities.FeedbackInitiate = Entities.Model.extend({
        url: '/api/Request/FeedbackInitiate'
    });

    Entities.FeedbackModel = Entities.SupportModelBase.extend({
        url: "/api/Request/FeedbackSubmit",
        initialize: function () {
            Entities.SupportModelBase.prototype.initialize.call(this);
            var validationGlobPath = 'request/feedback/errors/';
            this.validation = this.getValidationRules(this.url, validationGlobPath);
        }
    });



    App.reqres.setHandler('request:ca:model:instance', function (options) {
        return new Entities.CAModel();
    });

    App.reqres.setHandler('request:ca:initiate', function (options) {
        var initiate = new Entities.CaInitiate();
        initiate.fetch();
        return initiate;
    });


    App.reqres.setHandler('request:feedback:model', function (options) {
        return new Entities.FeedbackModel();
    });

    App.reqres.setHandler('request:feedback:initiate', function (options) {
        var initiate = new Entities.FeedbackInitiate();
        initiate.fetch();
        return initiate;
    });


    App.reqres.setHandler('request:csr:model', function (options) {
        return new Entities.CSRModel();
    });
});
App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    // Support request initiates:
    Entities.SupportMSAInitiate = Entities.Model.extend({
        url: '/api/Request/MsaSupportRequestInitiate'
    });

    Entities.SupportTAInitiate = Entities.Model.extend({
        url: '/api/Request/TaSupportRequestInitiate'
    });

    Entities.SupportInitiate = Entities.Model.extend({
        url: '/api/Request/TechSupportRequestInitiate'
    });


    // Requests models for Tech support (Simple support / TA / MSA)
    Entities.SupportModel = Entities.SupportModelBase.extend({
        url: "/api/Request/TechSupportRequestSubmit",
        analyticsRequestType: "Tech Support",
        initialize: function () {
            Entities.SupportModelBase.prototype.initialize.call(this);
            this.validation = this.getValidationRules(this.url, this.validationGlobPath);

            // Некоторые поля не отправляются на сервер, поэтому валидируются исключеительно на клиенте
            this.extendValidation({
                ProductType: {
                    RequiredRule: true,
                    msg: Globalize.formatMessage('request/errors/ProductTypeRequired')
                },
                Type: {
                    RequiredRule: true,
                    msg: Globalize.formatMessage('request/errors/TypeRequired')
                }
            });

            // TODO Martynov: выкинуть, когда сделаем валидацию файлов
            this.extendValidation({
                AttachedFiles: function (value, attr, val, model, computed) {
                    if (value && _.isArray(value) && value.length > 3) return Globalize.formatMessage('request/errors/maxFiles3');
                }
            });
        }
    });

    Entities.SupportTAModel = Entities.SupportModelBase.extend({
        url: "/api/Request/TaSupportRequestSubmit",
        analyticsRequestType: "TA",
        initialize: function () {
            Entities.SupportModelBase.prototype.initialize.call(this);
            // У TA-запросов свой путь локализации, т.к. у них нет подтипа и версия продукта допускает ввод
            this.validation = this.getValidationRules(this.url, 'request/support-ta/errors/');

            // TODO Martynov: выкинуть, когда сделаем валидацию файлов
            this.extendValidation({
                AttachedFiles: function (value, attr, val, model, computed) {
                    if (value && _.isArray(value) && value.length > 3) return Globalize.formatMessage('request/errors/maxFiles3');
                }
            });
        }
    });

    Entities.SupportMSAModel = Entities.SupportModelBase.extend({
        url: "/api/Request/MsaSupportRequestSubmit",
        analyticsRequestType: "MSA",
        initialize: function () {
            Entities.SupportModelBase.prototype.initialize.call(this);
            this.validation = this.getValidationRules(this.url, this.validationGlobPath);

            // Некоторые поля не отправляются на сервер, поэтому валидируются исключеительно на клиенте
            this.extendValidation({
                ProductType: {
                    RequiredRule: true,
                    msg: Globalize.formatMessage('request/errors/ProductTypeRequired')
                },
                Type: {
                    RequiredRule: true,
                    msg: Globalize.formatMessage('request/errors/TypeRequired')
                }
            });

            //TODO Martynov: Выкинуть эту валидацию, когда сделаем ее унифицированно
            this.extendValidation({
                AttachedFiles: function (value, attr, val, model, computed) {
                    if (value && _.isArray(value) && value.length > 3) return Globalize.formatMessage('request/errors/maxFiles3');
                }
            });
        }
    });


    var API = {
        getSupportModelInstance: function (options) {
            return new Entities.SupportModel();
        },
        getTASupportModelInstance: function (options) {
            return new Entities.SupportTAModel();
        },
        getMSASupportModelInstance: function (options) {
            return new Entities.SupportMSAModel();
        },

        getSupportInitiate: function () {
            var initiate = new Entities.SupportInitiate();
            initiate.fetch();
            return initiate;
        },
        getTASupportInitiate: function () {
            var initiate = new Entities.SupportTAInitiate();
            initiate.fetch();
            return initiate;
        },
        getMSASupportInitiate: function () {
            var initiate = new Entities.SupportMSAInitiate();
            initiate.fetch();
            return initiate;
        }
    };


    // Return model for SRD Instance ID
    App.reqres.setHandler('request:model:instance', function (options) {
        switch (options.Id) {
            case App.requests['support']: return API.getSupportModelInstance();
            case App.requests['support-ta']: return API.getTASupportModelInstance();
            case App.requests['support-msa']: return API.getMSASupportModelInstance();
            default: return App.error('Wrong SRD Instance Id');
        }
    });

    // Return initiate model for SRD Instance id
    // TODO Martynov: Когда удалим общий request:initiate - переименовать этот нормально
    App.reqres.setHandler('request:initiate', function (options) {
        switch (options.Id) {
            case App.requests['support']: return API.getSupportInitiate();
            case App.requests['support-ta']: return API.getTASupportInitiate();
            case App.requests['support-msa']: return API.getMSASupportInitiate();
            default: return App.error('Wrong SRD Instance Id');
        }
    });
});
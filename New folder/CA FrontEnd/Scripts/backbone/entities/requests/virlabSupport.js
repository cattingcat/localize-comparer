App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    // Initiate for AMR/Virlab/AmrMsa requests
    Entities.VirlabInitiateModel = Entities.Model.extend({
        url: "/api/Request/AmrRequestInitiate"
    });

    // AMR/Virlab/Suspect file requests
    Entities.VirlabModel = Entities.RequestModelBase.extend({
        url: "/api/Request/AmrRequestSubmit",
        analyticsRequestType: "VirLab",
        initialize: function () {
            Entities.RequestModelBase.prototype.initialize.call(this);
            var validationGlobPath = 'request/errors/';
            this.validation = this.getValidationRules(this.url, validationGlobPath);

            // TODO Martynov: выкинуть, когда сделаем валидацию файлов
            this.extendValidation({
                AttachedFiles: function (value, attr, val, model, computed) {
                    if (value && _.isArray(value) && value.length > 3) return Globalize.formatMessage('request/errors/maxFiles3');
                }
            });
        }
    });

    Entities.VirlabMsaModel = Entities.VirlabModel.extend({
        url: "/api/Request/AmrMsaRequestSubmit",
        analyticsRequestType: "CA Question",
        initialize: function () {
            Entities.VirlabModel.prototype.initialize.call(this);
        }
    });


    var API = {
        getVirlabInitiate: function (options) {
            var model = new Entities.VirlabInitiateModel();
            model.fetch();
            return model;
        },
        getVirlabModelInstance: function (options) {
            return new Entities.VirlabModel();
        },
        getVirlabMsaModelInstance: function (options) {
            return new Entities.VirlabMsaModel();
        }
    };


    App.reqres.setHandler('virlab:initiate', function (options) {
        return API.getVirlabInitiate();
    });

    App.reqres.setHandler('request:virlab:instance', function (options) {
        switch (options.srdId) {
            case App.requests['virlab']: return API.getVirlabModelInstance(options);
            case App.requests['virlab-msa']: return API.getVirlabMsaModelInstance(options);
            default: return App.error('Wrong SRD Instance Id');
        }
    });
});
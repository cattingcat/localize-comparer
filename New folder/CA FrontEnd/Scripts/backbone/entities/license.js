App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.LicenseCollection = Entities.PageableCollection.extend({ url: '/api/License/GetList' });

    Entities.LicenseRemoveModel = Entities.Model.extend({ url: '/api/License/Delete' });

    Entities.LicenseAddModel = Entities.Model.extend({
        url: '/api/License/Add',
        fileAttribute: 'KeyFile',
        initialize: function () {
            var globPath = 'license/add/errors/';
            this.validation = this.getValidationRules(this.url, globPath);
            
            this.extendValidation({
                ActivationCodeOrFileRequired: {
                    fn: function (value, attr, val, model, computed) {
                        if (!val.KeyFile && !val.ActivationCode)
                            return Globalize.formatMessage('license/add/errors/ActCodeOrKeyFileRequired');
                    }
                }
            });

            var fileValidation = this.getFileValidationRules(this.url, globPath);
            this.extendValidation(fileValidation);
            
            this.on('validated:invalid', this.onValidationInvalid);
        },
        onValidationInvalid: function (model, errors) {
            App.Analytics.licenseAddValidationError(model, errors);
        }
    });


    var API = {
        getLicenseEntities: function (options) {
            var collection = new Entities.LicenseCollection();
            collection.fetch(options);
            return collection;
        },
        getLicenseAddModelInstance: function (options) {
            return new Entities.LicenseAddModel(options);
        },
        getLicenseRemoveModelInstance: function (options) {
            return new Entities.LicenseRemoveModel();
        }
    };


    App.reqres.setHandler('license:entities', function (options) {
        return API.getLicenseEntities(options);
    });

    App.reqres.setHandler('license:add:model:instance', function (options) {
        return API.getLicenseAddModelInstance(options);
    });

    App.reqres.setHandler('license:remove:model:instance', function (options) {
        return API.getLicenseRemoveModelInstance(options);
    });
});
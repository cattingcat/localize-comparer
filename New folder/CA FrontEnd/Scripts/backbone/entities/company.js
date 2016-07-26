App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.LogoRemoveModel = Entities.Model.extend({ url: '/api/Company/LogoDelete' });

    Entities.LogoLinkModel = Entities.Model.extend({ url: '/api/Company/GetLogo' });

    Entities.LogoAddModel = Entities.Model.extend({
        url: '/api/Company/LogoUpload',
        fileAttribute: 'logoImage',
        initialize: function () {
            var validationGlobPath = 'profile/companyLogo/errors/';
            this.validation = this.getFileValidationRules(this.url, validationGlobPath);
            this.on('validated:invalid', App.Analytics.companyLogoValidationError);
        }
    });

    Entities.FilialsCollection = Entities.Collection.extend({
        url: '/api/Company/GetCompanyOrganizations'
    });


    App.reqres.setHandler('organizations:entities', function (options) {
        var collection = new Entities.FilialsCollection();
        collection.fetch(options);
        return collection;
    });
});
App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.CompatibleApplicationCollection = Entities.Collection.extend({
        url: function () {
            return '/api/License/GetCompatibleApplicationList?reconciliationId=' + this.licenseId;
        },
        initialize: function (models, options) {
            options = options || {};
            this.licenseId = options.licenseId;
        }
    });

    var API = {
        getCompatibleApplicationEntities: function (licenseId) {
            var collection = new Entities.CompatibleApplicationCollection([], { licenseId: licenseId });
            collection.fetch();
            return collection;
        }
    };

    App.reqres.setHandler('compatibleApplication:entities', function (licenseId) {
        return API.getCompatibleApplicationEntities(licenseId);
    });

});
App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.FileAgreementModel = Entities.Model.extend({
        url: '/api/FileAgreement/Get'
    });

    Entities.FileAgreementAcceptModel = Entities.Model.extend({
        url: '/api/FileAgreement/Accept'
    });

    App.reqres.setHandler('fileAgreement:entity', function (options) {
        return new Entities.FileAgreementModel();
    });

    App.reqres.setHandler('fileAgreementAccept:entity', function (options) {
        return new Entities.FileAgreementAcceptModel();
    });
});
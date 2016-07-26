App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.FileModel = Entities.Model.extend({ });

    Entities.FileStorageDeleteModel = Entities.Model.extend({
        url: function () { return this.get('DeleteUrl'); }
    });

    Entities.FileCollection = Entities.Collection.extend({
        model: Entities.FileModel
    });



    App.reqres.setHandler("file:collection:instance", function (options) {
        return new Entities.FileCollection();
    });

    App.reqres.setHandler("file:delete:model", function (options) {
        return new Entities.FileStorageDeleteModel(options);
    });
});
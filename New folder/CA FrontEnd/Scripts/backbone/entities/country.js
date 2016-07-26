App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.CountryCollection = Entities.Collection.extend({
        auth: false,
        url: '/api/Country/GetList',
        parse: function (val) {
            this.selected = val.Selected;
            var removeUnknown = _.findIndex(val.Items, function (item) {
                return item.ISOCode == "ZY";
            });
            if (removeUnknown >= 0) {
                val.Items.splice(removeUnknown, 1);
            }
            return val.Items;
        }
    });

    var API = {
        getCountryEntities: function (options) {
            var collection = new Entities.CountryCollection();
            collection.fetch();
            return collection;
        }
    };

    App.reqres.setHandler('country:entities', function (options) {
        return API.getCountryEntities(options);
    });

});
App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    App.commands.setHandler("when:fetched", function (entities, callback, context) {
        var xhrs = _.chain([entities]).flatten().pluck("_fetch").value();
        $.when.apply($, xhrs).done(function (resp) {
            callback.call(context || this, resp);
        });
    });

    App.commands.setHandler("when:error", function (entities, callback, context) {
        var xhrs = _.chain([entities]).flatten().pluck("_fetch").value();
        $.when.apply($, xhrs).fail(function (resp) {
            var args = _.flatten([resp]);
            callback.apply(context || this, args);
        });
    });
});
App.module("Behaviors", function (Behaviors, App, Backbone, Marionette, $, _) {
    "use strict";

    Marionette.Behaviors.behaviorsLookup = function (options, key) {
        return Behaviors[key];
    }

});
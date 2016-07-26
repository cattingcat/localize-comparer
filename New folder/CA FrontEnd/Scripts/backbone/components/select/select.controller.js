App.module("Components.Select", function (Select, App, Backbone, Marionette, $, _) {
    'use strict';

    Select.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            if (options && options.isInput) {
                this.layout = new Select.LayoutInput(this.options);
            } else if(options) {
                this.layout = new Select.Layout(this.options);
            } else {
                App.error('Request select-view without options');
            }
        }
    });

    App.reqres.setHandler("select:view", function (options) {
        var controller = new Select.Controller(options);
        return controller.layout;
    });
});
App.module("Behaviors.Checkboxes", function (Checkboxes, App, Backbone, Marionette, $, _) {
    "use strict";

    this.startWithParent = false;

    Checkboxes.Checkboxes = Marionette.Behavior.extend({
        defaults: {
            fields: []
        },

        getFieldSelector: function (fieldName) {
            return _.findKey(this.view.bindings, function (item) {
                if (_.isString(item)) return item == fieldName;
                return item.observe == fieldName;
            });
        },

        initiListener: function (fields, parentName) {
            _.each(fields, _.bind(function (field, fieldName) {

                this.listenTo(this.view.model, 'change:' + fieldName, _.bind(function (model, value, options) {
                    if (parentName && value === true) {
                        this.view.model.set(parentName, value);
                    }
                    if (value === false && !_.isString(field)) {
                        _.each(field, _.bind(function (fieldChild, fieldChildName) {
                            this.view.model.set(fieldChildName, value);
                        }, this));
                    }
                    _.each(fields, _.bind(function (fieldOther, fieldOtherName) {
                        this.view.model.set(fieldOtherName, value);
                    }, this));
                }, this));

                if (!_.isString(field)) {
                    this.initiListener(field, fieldName);
                }

            }, this));
        },

        initializeCheckboxes: function () {

            this.initiListener(this.options.fields, null);

        },

        onRender: function () {
            this.initializeCheckboxes();
        }

    });

});
App.module("Behaviors.Comboboxes", function (Comboboxes, App, Backbone, Marionette, $, _) {
    "use strict";

    this.startWithParent = false;

    Comboboxes.Comboboxes = Marionette.Behavior.extend({
        defaults: {
            fields: []
        },

        getFieldSelector: function (fieldName) {
            return _.findKey(this.view.bindings, function (item) {
                if (_.isString(item)) return item == fieldName;
                return item.observe == fieldName;
            });
        },

        findInner: function (fields, name, isFirst) {

            var value;
            _.each(fields, _.bind(function (field, fieldName) {

                if (_.isString(fieldName) && fieldName == name) {
                    value = field;
                } else if (!_.isString(field)) {
                    this.findInner(field, name, isFirst);
                }

            }, this));

            if (value) {
                this.disableInner(value, isFirst);
            }
        },

        disableInner: function (fields, isFirst) {

            _.each(fields, _.bind(function (field, fieldName) {

                if (!_.isString(field)) {
                    this.disableInner(field);
                }

                if (_.isString(fieldName)) {
                    var selector = this.$(this.getFieldSelector(fieldName));
                    if (selector.is('select')) {
                        selector = selector.parents('span');
                    }

                    selector.removeClass('inp-err');
                    selector.toggleClass('disabled-box', !isFirst)
                        .find('select, input')
                        .attr('disabled', !isFirst);
                }

            }, this));

        },

        changeField: function (model) {
            var key = _.findKey(model.changed, function (item) {
                return !_.isNull(item); // && !_.isUndefined(item)
            });

            var isFirst = true;
            if (_.isUndefined(model.changed[key])) isFirst = false;

            this.findInner(this.options.fields, key, isFirst);
        },

        initializeComboboxes: function () {
            this.listenTo(this.view.model, 'change', _.bind(this.changeField, this));
            this.disableInner(this.options.fields, true);
        },

        onRender: function () {
            this.initializeComboboxes();
        }
    });

});
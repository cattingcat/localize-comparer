(function (root, $, _, Backbone, Stickit) {
    'use strict';

    Stickit.addHandler({
        selector: '.select2',       
        events: ['change'],

        getVal: function ($el, event, opts) {
            var value = opts.selView.getValue();

            if (opts.wholeModel) {
                if (_.isObject(value)) return value;

                // model as a value
                var criteria = {};
                criteria[opts.valueField] = value;
                return opts.collection.findWhere(criteria);
            } else {
                // string as a value
                return value;
            }
        },

        update: function ($el, val, m, opts) {
            if (!opts.selView) {
                App.warn('update value before view init');
                return;
            }

            opts.selView.setValue(val);
        },

        initialize: function ($el, model, opts) {
            if (!opts.valueField) {
                opts.valueField = opts.textField;
                opts.wholeModel = true;
            }

            var view = App.request('select:view', {
                collection: opts.collection,
                textField: opts.textField,
                valueField: opts.valueField,
                wholeModel: opts.wholeModel,
                placeholder: opts.placeholder
            });
            opts.selView = view;

            // insert view to binding-component
            $el.html(view.render().el);

            // Initial value
            var initialVal = model.get(opts.observe)
            view.setValue(initialVal);

            // register validation callback
            this.listenTo(view, 'change', _.bind(function (val) {
                /*if (model.preValidate && (model.isValid(opts.observe) || opts.validateOnFocusOut !== false)) {
                    model.preValidate(opts.observe, model.get(opts.observe));
                }*/

                model.inputValidation(opts.observe, val, {
                    input: true
                });
            }, this));

            $el.on('valid', function () {
                $(this).removeClass('inp-err');
            });

            $el.on('invalid', function () {
                if (!$el.hasClass('disabled-box')) {
                    $el.addClass('inp-err');
                }
            });
        }
    });

    Stickit.addHandler({
        selector: '.select2-input',
        events: ['change'],

        getVal: function ($el, event, opts) {
            var value = opts.selView.getValue();

            if (opts.wholeModel) {
                var val = opts.collection.find(function (model) {
                    return model.get(opts.textField) == value;
                });

                if (!val) {
                    var model = new Backbone.Model({});
                    model.set(opts.textField, value);
                    return model;
                }

                return val;
            }

            return value;
        },
        
        update: function ($el, val, m, opts) {
            if (opts.selView) {
                var value = val instanceof Backbone.Model ? val.toJSON() : val;
                opts.selView.setValue(value);
            }
        },

        initialize: function ($el, model, opts) {
            if (!opts.valueField) {
                opts.valueField = opts.textField;
                opts.wholeModel = true;
            }
            
            // Request select-view
            var view = App.request('select:view', {
                collection: opts.collection,
                textField: opts.textField,
                valueField: opts.valueField,
                defaultValue: opts.defaultValue,
                placeholder: opts.placeholder,
                wholeModel: opts.wholeModel,
                isInput: true
            });
            opts.selView = view;

            $el.html(view.render().el);

            // setup initial value:
            var initialVal = model.get(opts.observe);
            view.setValue(initialVal);

            this.listenTo(model, 'change:' + opts.observe, _.bind(function () {
                if (model.preValidate && (model.isValid(opts.observe) || opts.validateOnFocusOut !== false)) {
                    model.preValidate(opts.observe, model.get(opts.observe));
                }
            }, this));

            $el.on('valid', function () {
                $(this).removeClass('inp-err');
            });

            $el.on('invalid', function () {
                $(this).addClass('inp-err');
            });
        }
    });

})(this, $, _, Backbone, Backbone.Stickit)
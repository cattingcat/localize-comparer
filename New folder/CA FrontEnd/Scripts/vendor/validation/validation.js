/// <reference path="../../libs/backbone-validation/backbone-validation.js" />

(function ($, _, Validation) {
    "use strict";
    var trim = String.prototype.trim ?
      function (text) {
          return text === null ? '' : String.prototype.trim.call(text);
      } :
      function (text) {
          var trimLeft = /^\s+/,
              trimRight = /\s+$/;

          return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
      };
    // Determines whether or not not a value is empty
    var hasValue = function (value) {
        return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === ''));
    };

    _.extend(Validation.messages, {
        min: 'Поле \"{0}\" должно быть больше или равно {1}',
        max: 'Поле \"{0}\" должно быть меньше или равно {1}',
        range: 'Поле \"{0}\" должно быть от {1} до {2} включительно',
        rangeLength: ' Поле \"{0}\" должно быть от {1} до {2} символов',
        equalTo: '\"{1}\" и \"{0}\" должны совпадать',
        required: 'Поле \"{0}\" обязательно для заполнения',
        minLength: 'Минимальная длина поля \"{0}\": {1}',
        maxLength: 'Максимальная длина поля \"{0}\": {1}',
        lessThan: "Поле \"{0}\" должно быть меньше поля \"{1}\"",
        lessEqThan: "Поле \"{0}\" должно быть меньше или равно полю \"{1}\"",
        greaterThan: "Поле \"{0}\" должно быть больше поля \"{1}\"",
        greaterEqThan: "Поле \"{0}\" должно быть больше или равно полю \"{1}\"",
        requiredCollection: "Необходимо минимум одно значение",
        pattern: 'Поле \"{0}\" заполнено некорректно'
    }); // Backbone.Validation Messages
    
    var msg = Validation.messages

    _.extend(Validation.validators, {
        // INN validation
        inn: function (value, attr, val, model, computed) {
            value = "" + value;
            var numbers = _.map(value, function (v) { return parseInt(v); });
            if (numbers.length == 12) {
                var k1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0],
                    k2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8],
                    s1 = 0, s2 = 0;
                for (var i = 0; i < 11; i++) {
                    s1 += numbers[i] * k1[i];
                    s2 += numbers[i] * k2[i];
                }
                s1 = (s1 % 11) % 10; s2 = (s2 % 11) % 10;
                if (s1 == numbers[10] && s2 == numbers[11]) {
                    return;
                }
                return "Ошибка ввода ИНН"
            } else if (numbers.length == 10) {
                var k = [2, 4, 10, 3, 5, 9, 4, 6, 8], s = 0;
                for (var i = 0; i < 9; i++) {
                    s += numbers[i] * k[i];
                }
                s = (s % 11) % 10;
                if (s == numbers[9]) {
                    return;
                }
                return "Ошибка ввода ИНН"
            }
            return "ИНН должен содержать 10 или 12 цифр"

        },
        // Required Collection. Validates if collection contains at least one item
        requiredCollection: function (value, attr, val, model, computed) {
            if (!(value && value.length)) {
                return this.format(msg.requiredCollection, this.formatLabel(attr, model));
            }
        },
        // Less Than Validator. Validates if attribute value less than specified attribute
        lessThanDateTime: function (value, attr, val, model, computed) {
            if (value >= computed[val]) {
                return this.format(msg.lessThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },
        // Less or Equal Than Validator. Validates if attribute value less or equal to specified attribute
        lessEqThanDateTime: function (value, attr, val, model, computed) {
            if (value > computed[val]) {
                return this.format(msg.lessEqThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },
        // Greater Than Validator. Validates if attribute value greater then specified attribute
        greaterThanDateTime: function (value, attr, val, model, computed) {
            if (value <= computed[val]) {
                return this.format(msg.greaterThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },
        // Greater or Equal Than Validator. Validates if attribute value greater or equal to specified attribute
        greaterEqThanDateTime: function (value, attr, val, model, computed) {
            if (value < computed[val]) {
                return this.format(msg.greaterEqThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },

        // Less Than Validator. Validates if attribute value less than specified attribute
        lessThan: function (value, attr, val, model, computed) {
            if (parseFloat(value) >= parseFloat(computed[val])) {
                return this.format(msg.lessThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },
        // Less or Equal Than Validator. Validates if attribute value less or equal to specified attribute
        lessEqThan: function (value, attr, val, model, computed) {
            if (parseFloat(value) > parseFloat(computed[val])) {
                return this.format(msg.lessEqThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },
        // Greater Than Validator. Validates if attribute value greater then specified attribute
        greaterThan: function (value, attr, val, model, computed) {
            if (parseFloat(value) <= parseFloat(computed[val])) {
                return this.format(msg.greaterThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },
        // Greater or Equal Than Validator. Validates if attribute value greater or equal to specified attribute
        greaterEqThan: function (value, attr, val, model, computed) {
            if (parseFloat(value) < parseFloat(computed[val])) {
                return this.format(msg.greaterEqThan, this.formatLabel(attr, model), this.formatLabel(val, model));
            }
        },

        // Server Validation. Handles server validation response on model.save(). 
        // ** the model *must* be validated on client *before* calling save() method
        ServerValidation: function (value, attr, customValue, model) {
            var ServerValidationResult = model._ServerValidationResult;
            if (!ServerValidationResult) {
                model._ServerValidationResult = {};
                model.on('error', function (model, xhr, options) {
                    var resp = xhr.responseJSON || {},
                        modelState = resp.modelState || resp.ModelState;
                    if (modelState) {
                        var res = {};
                        _.each(modelState, function (val, key) {
                            var tst = /\w+\.(\w+)/.exec(key);
                            if (tst && tst.length == 2) {
                                key = tst[1];
                            }
                            var newkey = key[0].toLowerCase() + key.substr(1);
                            res[key] = val[0];
                            res[newkey] = val[0];
                        })
                        model._ServerValidationResult = res;
                        model.validate();
                        //model.isValid(_.keys(res));
                    }
                })
                return;
            }
            if (!ServerValidationResult[attr] || !customValue) {
                return;
            }
            var serverError = ServerValidationResult[attr];
            var state = model.toJSON();
            ServerValidationResult[attr] = false;
            model._ServerValidationResult = ServerValidationResult;
            if (typeof customValue == "function") {
                return customValue(value, serverError, state);
            } else if (typeof customValue == "object" && customValue[serverError]) {
                return customValue[serverError];
            } else if (typeof customValue == "string") {
                return customValue;
            } else {
                return serverError;
            }
        }, // Server Validation.

        // Pattern validator
        // Validates that the value has to match the pattern specified.
        // Can be a regular expression or the name of one of the built in patterns
        pattern: function (value, attr, pattern, model) {
            var custmsg = false;
            if (_.isArray(pattern)) {
                custmsg = pattern[1];
                pattern = pattern[0];
            }
            if (!hasValue(value) || !value.toString().match(Validation.patterns[pattern] || pattern)) {
                return this.format(custmsg || msg.pattern, this.formatLabel(attr, model), pattern);
            }
        },

        // Mock Validator to store help message
        helpText: function (value, attr, customValue, model) {
            return;
        }
    }); // Custom Backbone.Valudation Validators


    // Backbone.Validation configuration
    Backbone.Validation.configure({
        labelFormatter: 'label'
    });

    // Custom Backbone.Validation patterns
    _.extend(Backbone.Validation.patterns, {
        myInt: /^-?\d+$/,
        myPosInt: /^\d+?$/,
        myReal: /^-?\d+(\.?\d+)?$/,
        myPosReal: /^\d+(\.\d+)?$/
    }); // Custom Backbone.Validation patterns

    Validation.bindWithStickit = function (view) {
        this.bind.apply(this, arguments);
        Validation.bindToStickit(view);
    };

    Validation.bindToStickit = function (view) {
        Validation.transformBindings(view);
        view.listenTo(view.model, 'change', function (m, o) {
            if (o.stickit) {
                m.validate(m.changed);
            }
        });
    };

    Validation.transformBindings = function (view) {
        var bindings = {};
        _.each(view.bindings, function (val, selector) {
            if (_.isString(val)) {
                bindings[selector] = {
                    observe: val,
                    setOptions: { stickit: true }
                };
            } else {
                bindings[selector] = val;
                if (!val.setOptions) {
                    bindings[selector].setOptions = { stickit: true };
                }
            }
        });
        view.bindings = bindings;
    };


})($, _, Backbone.Validation);
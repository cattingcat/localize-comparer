App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    // Validation for email list separated by semicolon
    _.extend(Backbone.Validation.validators, {
        MultiEmailRule: function (value, attr, opts, model) {
            // Empty value is valid
            if (!value) return false;
            var ctx = model.validationContext || {};
            if (ctx.input && ctx.valid) return;

            // Digits, Objects, Arrays, etc - are invalid.
            if (!_.isString(value)) return true;

            var arr = value.split(';');
            var re = Backbone.Validation.patterns.email,
                err = _.any(arr, function (i) { return i && !re.test(i.trim()); });

            return err;
        },
        EmailRule: function (value, attr, opts, model) {
            var ctx = model.validationContext || {};
            if (ctx.input && ctx.valid) return;

            if (value && !Backbone.Validation.patterns.email.test(value.trim()))
                return true;
        },
        RequiredRule: function (value, attr, opts, model) {
            var error = Backbone.Validation.validators.required(value, attr, opts, model);
            var ctx = model.validationContext || {};
            if (ctx &&(ctx.input || ctx.blur)) return;

            return error;
        },
        MaxByteLengthRule: function (value, attr, opts, model) {
            if (!value || !_.isString(value)) return;
            var maxLen = +opts.ByteLength,
                actualLen = unescape(encodeURIComponent(value)).length;

            // Нельзя сделать  "return (actualLen > maxLen)" так как
            //  бэкбон по разному обрабатывает false и undefined
            //  в случае false - дальнейшие правила игнорируются
            if (actualLen > maxLen) return true;
        },
        PasswordRule: function (value, attr, opts, model) {
            var ctx = model.validationContext || {};
            if (ctx.input && ctx.valid) return;

            var passwRegex = new RegExp(App.passwordRegex.replace('S', '\\S'));
            if (value && !passwRegex.test(value))
                return true;
        },
        MaxLengthRule: function (value, attr, opts, model) {
            if (!value || !_.isString(value)) return;

            var maxLen = +opts.Length;

            if (value.length > maxLen) return true;
        },
        MinLengthRule: function (value, attr, opts, model) {
            var ctx = model.validationContext || {};
            if (ctx.input && ctx.valid) return;

            if (!value || !_.isString(value)) return;

            var minLen = +opts.Length;

            if (value.length < minLen) return true;
        },
        NotEqualToRule: function (value, attr, opts, model) {
            var path = opts.OtherProperty.split('.'),
                val = model;

            _.each(path, function (i) {
                if (val.get) {
                    val = val.get(i);
                } else {
                    val = val[i];
                }
            });

            if (value == val) return true;
        },
        FromListRule: function (value, attr, opts, model) {
            var item = _.find(opts.Items, function (i) {
                return i.indexOf(value) != -1
            });
            if (item) {
                model.set(attr, item);
                return;
            } else {
                return true;
            }
        },
        TextMaxLengthLimitRule: function (value, attr, opts, model) {
            if (value && value.length > opts.Length) return true;
        },
        ActivationCodeRule: function (value, attr, opts, model, state) {
            var ctx = model.validationContext || {};
            if (ctx.input && ctx.valid || !value) return;

            // license-key shouldn't contain IOL0 and _
            var rg = /^((?![iol0_]).)*$/i; 

            if (!rg.exec(value)) return true;
        },
        HttpFileCountRule: function (value, attr, opts, model, state) {
            if (!value) return;

            if (_.isArray(value) && value.langth > opts.MaxCount) return true;
        },
        HttpFileSizeRule: function (value, attr, opts, model, state) {
            if (!value) return;
            if (value.size > opts.MaxSize) return true;
        },
        KeyFileRule: function (value, attr, opts, model, state) {
            // Фиктивное правило. Такой код приходит с бэкэнда
        },
        LogoFileNameRule: function (value, attr, opts, model, state) {
            if (!value || !value.name) return;

            var extension = _.last(value.name.split('.')).toLowerCase(),
                alailableExt = App.logo.fileNameExtensions;

            var hasExt = _.any(alailableExt, function (i) {
                return i.trim().toLowerCase() === extension;
            });

            if (!hasExt) return true;
        },
        ImageContentRule: function (value, attr, opts, model, state) {
            // Фиктивное правило. Такой код приходит с бэкэнда
        },
        ServerRule: function (value, attr, opts, model, state) {
            var result = model._ServerValidationResult;

            if (!result) {
                model._ServerValidationResult = {};
                model._ServerValidationResultForAnalytics = {};
                model.on('error', function (model, xhr, options) {
                    var resp = xhr.responseJSON || {},
                        modelState = resp.modelState || resp.ModelState;

                    if (!modelState) return;

                    var validationErrors = {};
                    _.each(modelState, function (val, key) {
                        // для каждого поля из ModelState соответствует строка вида: 
                        //   "RangeRule|Minimum:5_Maximum:30|SomeMessage"

                        var fieldName = _.last(key.split('.')),
                            rule = _.first(val).split('|'),
                            ruleName = rule[0],
                            ruleOpts = rule[1],
                            msg = rule[2];

                        if (fieldName == 'File') fieldName = model.fileAttribute;

                        // Парсим опции "Minimum:5_Maximum:30"
                        var options = {};
                        if (ruleOpts) {
                            ruleOpts = ruleOpts.split('_');
                            _.each(ruleOpts, function (i) {
                                var tmp = i.split(':'),
                                    key = tmp[0],
                                    val = tmp[1];

                                options[key] = val;
                            });
                        }

                        validationErrors[fieldName] = { name: ruleName, options: options, msg: msg };
                    });

                    model._ServerValidationResult = validationErrors;

                    App.warn('Server validation failed: ', validationErrors);

                    model.validate();
                });

                return;
            }

            var serverError = result[attr];

            if (serverError) {
                model._ServerValidationResultForAnalytics[attr] = result[attr];
                delete result[attr];
                var key = attr + '.' + serverError.name,
                    msg = Globalize.formatMessage(opts.globPath + key, serverError.options);

                App.warn('Server validation!');

                if (_.isString(msg)) return msg;

                return Globalize.formatMessage('errors/server-validation', {
                    property: attr,
                    rule: serverError.name
                });
            }
        }
    });

    Entities.Model = Backbone.Model.extend({
        idAttribute: "Id",

        destroy: function (options) {
            options || (options = {});

            _.defaults(options, {
                wait: true
            });

            Backbone.Model.prototype.destroy.call(this, options);
        },

        sync: function (method, entity, options) {
            if (this.auth === false) {
                options = options || {};
                options.auth = false;
            }
            return Backbone.Model.prototype.sync.call(this, method, entity, options);
        },

        inputValidation: function (property, value, options) {
            var lastValid = options && options.valid;
            this.validationContext = options;

            if (_.isUndefined(lastValid)) lastValid = true;

            this._fromInput = !!lastValid;
            this.preValidate(property, value);
            delete this._fromInput;
            delete this.validationContext;
        },

        extendValidation: function (obj) {
            this.validation = _.extend(this.validation, obj);
        },

        // Конвертация правила из settings в правило и соответствующую ему строку локализации
        mapRules: function (propertyName, settingRules, localizationRegionPath) {
            return _.map(settingRules, function (r) {
                // Имя правила, например: requiredRule, MaxByteLengthRule итд...
                //  и опции, например: сами значение максимальных длинн и тд
                var ruleName = _.first(_.keys(r)),
                    ruleOpts = r[ruleName];

                var localizeKey = propertyName + '.' + ruleName;

                // Формируем сообщение об ошибке на основании имени поля и кода ошибки
                var localizationStr = Globalize.formatMessage(localizationRegionPath + localizeKey, ruleOpts);

                if (!_.isString(localizationStr)) {
                    App.warn('Localization not found: ', localizeKey);
                    localizationStr = 'Localize: ' + localizeKey;
                }

                r.msg = localizationStr;

                return r;
            });
        },

        getValidationRules: function (submitUrl, globalizePath) {
            // Объект-описатель валидации для модели, передающейся по заданному URL
            var modelDescriptor = _.findWhere(validationDtoSettings, { url: submitUrl });

            if (!modelDescriptor) return {};

            var self = this;
            // Формируем описание валидации для каждого свойства модели
            var properties = _.map(modelDescriptor.properties, function (i) {
                var obj = {},
                    propName = i.propertyName;

                var rules = self.mapRules(propName, i.rules, globalizePath);

                // Для каждого свойства модели, создаем правило для серверной валидации
                var serverValidationRule = { ServerRule: { globPath: globalizePath } };
                rules.push(serverValidationRule);

                obj[i.propertyName] = rules;

                return obj;
            });

            var baseSave = this.save;
            this.save = function (attrs, options, xhr) {
                var baseErrorHandler = options.error;
                function errorHandlerWrapper(model, resp) {
                    if (resp && resp.responseJSON && resp.responseJSON.ModelState) {
                        App.log('Server validation errorHandlerWrapper called');
                        resp.isValidationError = true;
                    }
                    // Исключение было обработано в AJAX-перехватчике
                    if (resp.handled) return;

                    return baseErrorHandler.call(this, model, resp);
                }

                options.error = errorHandlerWrapper;
                return baseSave.call(this, attrs, options, xhr);
            };

            return _.extend.apply(_, properties);
        },

        getFileValidationRules: function (submitUrl, validationGlobPath) {
            var descr = _.findWhere(validationFileSettings, { url: submitUrl });

            var rules = this.mapRules(this.fileAttribute, descr.rules, validationGlobPath);

            rules.push({ ServerRule: { globPath: validationGlobPath } });

            var res = {};
            res[this.fileAttribute] = rules;

            return res;
        }
    });
});
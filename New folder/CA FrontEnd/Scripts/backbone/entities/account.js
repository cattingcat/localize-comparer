App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.RegisterModel = Entities.Model.extend({
        url: '/api/Account/Register',
        auth: false,
        fileAttribute: 'KeyFile',
        defaults: { Country: 'RU' },
        initialize: function () {
            var validationGlobPath = 'account/create/errors/';
            this.validation = this.getValidationRules(this.url, validationGlobPath);
            var fileValidation = this.getFileValidationRules(this.url, validationGlobPath);
            this.extendValidation(fileValidation);

            this.validation.ActivationCode.push({
                // —ложна€ валидаци€ дл€ кода активации, т.к. можно прикрепить лицензию либо 
                //  через файл, либо через код
                fn: function (value, attr, val, model, computed) {
                    if (!val.KeyFile && !value && !this._fromInput) {
                        return Globalize.formatMessage('account/create/errors/ActCodeOrKeyFileRequired');
                    }
                }
            });
            this.on('change', this.onChange);
            this.on('validated:invalid', this.onValidationInvalid);
        },
        onChange: function (model, opts) {
            if (!model.analyticsInitiate) {
                App.Analytics.registrationStep1Event('Initiate');
                model.analyticsInitiate = true;
            }
        },
        onValidationInvalid: function (model, errors) {
            App.Analytics.registrationStep1ValidationError(model, errors);
        }
    });

    // ћодель ссылки на активацию, сброс парол€ и тд
    //  ѕозвол€ет определить валидна ли ссылка и нужен ли логаут
    Entities.LinkModel = Entities.Model.extend({
        auth: false,
        initialize: function (options) {
            this.url = App.stsServer.getUrl() + options.url;
            this.unset('url');
        },
        checkLink: function (options) {
            return this.save(null, {
                success: options.success,
                error: function (model, resp, opts) {
                    if (resp && resp.responseJSON && resp.responseJSON.Code == "HasActiveSessions") {
                        return options.requestLogout(model, resp, opts);
                    }

                    return options.error(model, resp, opts);
                }
            });
        }
    });

    // ћодель дл€ передачи нового парол€ на сервер
    Entities.PasswordModel = Entities.Model.extend({
        auth: false,
        initialize: function (options) {
            this.url = options.url;
            this.unset('url');
            var validationGlobPath = 'account/changePass/errors/';
            this.validation = this.getValidationRules(this.url, validationGlobPath);

            this.url = App.stsServer.getUrl() + this.url;

            // ѕоле подтверждени€ парол€ провер€етс€ только на клиенте.
            this.extendValidation({
                ConfirmPassword: [{
                    RequiredRule: true,
                    msg: Globalize.formatMessage(validationGlobPath + 'ConfirmPassword.RequiredRule')
                }, {
                    fn: function (value, attr, opts, model, state) {
                        if (!opts.Password || !value) return;
                        var ctx = this.validationContext || {};
                        if (ctx.input && ctx.valid) return;

                        if (opts.Password != opts.ConfirmPassword)
                            return Globalize.formatMessage(validationGlobPath + 'ConfirmPassword.EqualRule');
                    }
                }]
            });
            this.on('change', this.onChange);
            this.on('validated:invalid', this.onValidationInvalid);
        },
        onChange: function (model, opts) {
            if (!model.analyticsInitiate) {
                App.Analytics.changePasswordStep2Event(this.analyticsCategory, 'Initiate');
                model.analyticsInitiate = true;
            }
        },
        onValidationInvalid: function (model, errors) {
            App.Analytics.changePasswordStep2ValidationError(this.analyticsCategory, model, errors);
        }
    });


    // ћодель дл€ передачи нового парол€, если пароль истек
    Entities.RefreshPasswordModel = Entities.Model.extend({
        initialize: function (options) {
            var validationGlobPath = 'account/changePass/errors/';
            var relUrl = '/api/Password/SetExpiredPassword';
            this.validation = this.getValidationRules(relUrl, validationGlobPath);
            this.url = App.stsServer.getUrl() + relUrl;

            // ѕоле подтверждени€ парол€ провер€етс€ только на клиенте.
            this.extendValidation({
                ConfirmPassword: [{
                    RequiredRule: true,
                    msg: Globalize.formatMessage(validationGlobPath + 'ConfirmPassword.RequiredRule')
                }, {
                    fn: function (value, attr, opts, model, state) {
                        if (!opts.Password || !value) return;
                        var ctx = this.validationContext || {};
                        if (ctx.input && ctx.valid) return;

                        if (opts.Password != opts.ConfirmPassword)
                            return Globalize.formatMessage(validationGlobPath + 'ConfirmPassword.EqualRule');
                    }
                }]
            });
        }
    });

    Entities.AccountLoginModel = Entities.Model.extend({
        initialize: function () {
            this.validation = {
                authError: {
                    fn: function (value, attr, val, model, computed) {
                        if (value) return value;
                    }
                }
            };
            this.on('change', this.onChange);
            this.on('validated:invalid', this.onValidationInvalid);
        },
        defaults: {
            type: 'Login'
        },
        // TODO Martynov: –азобратьс€ зачем тут така€ обработка ошибок, переделать при рефакторинге авторизации
        save: function (options) {
            options = options || {};
            options.data = this.toJSON();
            options.emulateJSON = true;
            options.error = function (model, result) {
                model.set('authError', result.responseJSON.error_description);
                model.validate();
                model.set('password', '');
                model.set('authError', '');
            };
            Entities.Model.prototype.save.call(this, null, options);
        },
        onChange: function (model, opts) {
            if (!model.analyticsInitiate) {
                App.Analytics.signInEvent('Initiate', null, true);
                model.analyticsInitiate = true;
            }
        },
        onValidationInvalid: function (model, errors) {
            App.Analytics.signInValidationError(model, errors);
        }
    });

    Entities.AccountForgotModel = Entities.Model.extend({
        auth: false,
        relUrl:'/api/Password/ForgotPassword',
        url: function() {
            return App.stsServer.getUrl() + this.relUrl;
        },
        crossDomain: function() {
            return App.stsServer.isCrossDomain();
        },
        initialize: function () {
            var validationGlobPath = 'account/forgot/errors/';
            this.validation = this.getValidationRules(this.relUrl, validationGlobPath);

            this.on('change', this.onChange);
            this.on('validated:invalid', this.onValidationInvalid);
        },
        onChange: function (model, opts) {
            if (!model.analyticsInitiate) {
                App.Analytics.passwordRecoveryStep1Event('Initiate', true);
                model.analyticsInitiate = true;
            }
        },
        onValidationInvalid: function (model, errors) {
            App.Analytics.passwordRecoveryStep1ValidationError(model, errors);
        }
    });
    Entities.AccountDeleteModel = Entities.Model.extend({
        auth: false,
        relUrl: '/api/User/DeleteMyProfile',
        url: function() {
            return App.stsServer.getUrl() + this.relUrl;
        },
        crossDomain: function () {
            return App.stsServer.isCrossDomain();
        }
    });

    Entities.DeleteCompanyModel = Entities.Model.extend({
        auth: false,
        url: '/api/Company/Delete'
    });


    var API = {
        getRegisterModel: function (options) {
            return new Entities.RegisterModel(options);
        },

        getAccountLoginModelInstance: function (options) {
            return new Entities.AccountLoginModel();
        },
        getAccountForgotModel: function (options) {
            return new Entities.AccountForgotModel();
        },
        getAccountPasswordModelInstance: function (options) {
            return new Entities.AccountPasswordModel();
        },
        getAccountDeleteModelInstance: function (options) {
            return new Entities.AccountDeleteModel(options);
        },
        getDeleteCompanyModelInstance: function (options) {
            return new Entities.DeleteCompanyModel(options);
        }
    };


    App.reqres.setHandler("account:create:model", function (options) {
        return API.getRegisterModel(options);
    });

    App.reqres.setHandler("account:login:model:instance", function (options) {
        return API.getAccountLoginModelInstance(options);
    });

    App.reqres.setHandler("account:forgot:model", function (options) {
        return API.getAccountForgotModel(options);
    });

    App.reqres.setHandler("account:password:model:instance", function (options) {
        return API.getAccountPasswordModelInstance(options);
    });

    App.reqres.setHandler("account:delete:model", function (options) {
        return API.getAccountDeleteModelInstance(options);
    });

    App.reqres.setHandler("company:delete:model", function (options) {
        return API.getDeleteCompanyModelInstance(options);
    });
});
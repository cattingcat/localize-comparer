App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    //Entities.AccountForgotModel = Entities.Model.extend({
    //    auth: false,
    //    //url: '/api/Account/ForgotPassword',
    //    url: function() {
    //        return App.stsServer.getUrl() + '/api/Password/ForgotPassword';
    //    },
    //    crossDomain: function() {
    //        return App.stsServer.isCrossDomain();
    //    },
    //    initialize: function () {
    //        var validationGlobPath = 'account/forgot/errors/';
    //        this.validation = this.getValidationRules(this.url, validationGlobPath);
    //    }
    //});

    //Entities.AccountPasswordModel = Entities.Model.extend({
    //    auth: false,

    //    // TODO Martynov: Переделать когда решится серверная валидация паролей
    //    initialize: function () {
    //        this.validation = {
    //            password: [{
    //                required: true,
    //                msg: Globalize.formatMessage('account/activate/errors/PasswordIsRequired')
    //            },
    //            {
    //                pattern: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,}$/,
    //                msg: Globalize.formatMessage('account/activate/errors/SimplePassword')
    //            },
    //            {
    //                ServerValidation: function (value, serverError, state) {
    //                    var moduleName = state.resetPassword ? 'resetPassword' : 'activate';
    //                    return Globalize.formatMessage('account/' + moduleName + '/errors/' + serverError);
    //                }
    //            }],
    //            confirmPassword: [{
    //                required: true,
    //                msg: Globalize.formatMessage('account/activate/errors/PasswordConfirmationIsRequired')
    //            },
    //            {
    //                fn: function (value, attr, val, model, computed) {
    //                    if (val.password != val.confirmPassword) return Globalize.formatMessage('account/activate/errors/PasswordNotEqualConfirmation');
    //                    if (val.error) return val.error;
    //                }
    //            },
    //            {
    //                pattern: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,}$/,
    //                msg: Globalize.formatMessage('account/activate/errors/SimplePassword')
    //            },
    //            {
    //                ServerValidation: function (value, serverError, state) {
    //                    var moduleName = state.resetPassword ? 'resetPassword' : 'activate';
    //                    return Globalize.formatMessage('account/' + moduleName + '/errors/' + serverError);
    //                }
    //            }],
    //            token: [{
    //                ServerValidation: function (value, serverError, state) {
    //                    var moduleName = state.resetPassword ? 'resetPassword' : 'activate';
    //                    return Globalize.formatMessage('account/' + moduleName + '/errors/' + serverError);
    //                }
    //            }],
    //            email: [{
    //                ServerValidation: function (value, serverError, state) {
    //                    var moduleName = state.resetPassword ? 'resetPassword' : 'activate';
    //                    return Globalize.formatMessage('account/' + moduleName + '/errors/' + serverError);
    //                }
    //            }],
    //            captcha: [{
    //                ServerValidation: function (value, serverError, state) {
    //                    return Globalize.formatMessage('captcha/errors/' + serverError);
    //                }
    //            }],
    //        }
    //    }
    //});

    //Entities.AccountTokenCheckActivationModel = Entities.Model.extend({
    //    //url: '/api/Account/GetActivateStatus',
    //    url: function() {
    //        return App.stsServer.getUrl() + '/api/User/GetActivateStatus';
    //    },
    //    crossDomain: function() {
    //        return App.stsServer.isCrossDomain();
    //    },
    //    auth: false
    //});

    //Entities.AccountTokenCheckResetPasswordModel = Entities.Model.extend({
    //    //url: '/api/Account/GetPasswordResetLinkStatus',
    //    url: function() {
    //        return App.stsServer.getUrl() + '/api/Password/GetPasswordResetLinkStatus';
    //    },
    //    crossDomain: function() {
    //        return App.stsServer.isCrossDomain();
    //    },
    //    auth: false
    //});

    //var API = {
    //    getAccountForgotModelInstance: function (options) {
    //        return new Entities.AccountForgotModel();
    //    },
    //    getAccountTokenCheckInstance: function (options) {
    //        if (options.resetPassword) {
    //            var tokenCheckModel = new Entities.AccountTokenCheckResetPasswordModel(options.model);
    //        } else {
    //            var tokenCheckModel = new Entities.AccountTokenCheckActivationModel(options.model);
    //        }
    //        tokenCheckModel.save(null, {
    //            success: options.success,
    //            error: options.error,
    //        })
    //        return tokenCheckModel;
    //    },
    //    getAccountPasswordModelInstance: function (options) {
    //        return new Entities.AccountPasswordModel();
    //    }
    //};

    //App.reqres.setHandler("account:forgot:model:instance", function (options) {
    //    return API.getAccountForgotModelInstance(options);
    //});

    //App.reqres.setHandler("account:token:check:instance", function (options) {
    //    return API.getAccountTokenCheckInstance(options);
    //});

    //App.reqres.setHandler("account:password:model:instance", function (options) {
    //    return API.getAccountPasswordModelInstance(options);
    //});

});
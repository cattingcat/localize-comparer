App.module("UserComponent", function (UserComponent, App, Backbone, Marionette, $, _) {
    'use strict';

    UserComponent.Controller = App.Controllers.Base.extend({
        getGlobalizeKeys: function (resp) {
            if (!resp || !resp.responseJSON || !resp.responseJSON.Type) {
                App.error('Wrong error response from server');
                return false;
            }

            var code = this.getResponseMsg(resp),
                type = resp.responseJSON.Type;

            var priorityList = [type + '_' + code, type, code];

            return priorityList;
        },

        commonErrorHandler: function (resp) {
            var globalizeKeys = this.getGlobalizeKeys(resp);

            var title, text;

            _.forEach(globalizeKeys, _.bind(function (key) {
                if (!title || !text || !_.isString(title) || !_.isString(text)) {
                    title = this.glob(this.globalizePath + key + '/Title');
                    text = this.glob(this.globalizePath + key + '/Text');
                }
            }, this));

            if (!_.isString(title) || !_.isString(text)) {
                App.error('Localization strings not found: ', globalizeKeys);
                return false;
            }

            this.showError(title, text);

            return true;
        }
    });
});
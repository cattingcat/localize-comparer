App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.UserInfoModel = Entities.Model.extend({
        url: '/api/Account/UserInfo',
        parse: function (val) {
            if (val !== true) {
                this.checkLanguage(val.Language);
            }
            return val;
        },
        checkLanguage: function (language) {
            var settingsModel = App.request('settings:entity');
            if (settingsModel.get('language').value != language) {
                var newLang = _.findWhere(App.supportedLanguages, { value: language });
                //settingsModel.set('language', newLang);
                App.vent.trigger('change:language', language);
            }
        }
    });

    Entities.UserInfoResetPasswordModel = Entities.Model.extend({
        url: '/api/Account/ChangeMyPassword'
    });

    Entities.ProfileDeleteModel = Entities.Model.extend({
        url: '/api/Account/DeleteMyProfileInitiate'
    });

    Entities.CompanyDeleteModel = Entities.Model.extend({
        url: '/api/Company/DeleteInitiate'
    });


    var API = {
        getUserInfoEntity: function (options) {
            var model = new Entities.UserInfoModel();
            model.fetch(options);
            return model;
        },
        getUserInfoResetPasswordModelInstance: function (options) {
            return new Entities.UserInfoResetPasswordModel();
        },
        getProfileDeleteModelInstance: function (options) {
            return new Entities.ProfileDeleteModel();
        },
        getCompanyDeleteModelInstance: function (options) {
            return new Entities.CompanyDeleteModel();
        }
    };


    App.reqres.setHandler("userInfo:entity", function (options) {
        return API.getUserInfoEntity(options);
    });

    App.reqres.setHandler("userInfo:reset:password:model:instance", function (options) {
        return API.getUserInfoResetPasswordModelInstance(options);
    });

    App.reqres.setHandler("profile:remove:model:instance", function (options) {
        return API.getProfileDeleteModelInstance(options);
    });

    App.reqres.setHandler("company:remove:model:instance", function (options) {
        return API.getCompanyDeleteModelInstance(options);
    });
});
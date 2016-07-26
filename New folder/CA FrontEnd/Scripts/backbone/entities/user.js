App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    // Ïðèâèëåãèè äðóãîãî ïîëüçîâàòåëÿ
    Entities.UserPermissionsModel = Entities.Model.extend({
        url: '/api/User/UpdatePermissions'
    });

    // Ïðîñìîòð è èçìåíåíèå ïðîôèëÿ äðóãîãî ïîëüçîâàòåëÿ
    Entities.UserShowModel = Entities.Model.extend({
        url: function () {
            return '/api/User/GetDetails?ofUsername=' + this.get('Username');
        },
        submitUrl: '/api/User/UpdateProfileDetails',
        parse: function (data, xhr) {
            if (!_.isObject(data)) return;
            return {
                CompanyCategory: data.CompanyCategory,
                CompanyId: data.CompanyId,
                CompanyName: data.CompanyName,
                Country: data.CountryCode,
                Email: data.Email,
                FirstName:_.unescape(data.FirstName),
                LastName: _.unescape(data.LastName),
                Organization: _.unescape(data.Organization),
                Permissions: data.Permissions,
                Role: data.Role,

                OfUsername: this.attributes.Username
            };
        },
        initialize: function () {
            var validationGlobPath = 'profile/errors/';
            this.validation = this.getValidationRules(this.submitUrl, validationGlobPath);
            this.on('validated:invalid', App.Analytics.manageUserPersonalDataValidationError);
            this.on('sync', this.onSync);
        },
        onSync: function (model) {
            //Сохраняем первоначальное состояние модели для дальнейшего использования в Analytics.manageUserPersonalDataSuccessEvent
            this.analyticsSourceModel = model.toJSON();
        },
        save: function(attributes, options) {
            options = _.defaults((options || {}), { url: this.submitUrl });
            return Entities.Model.prototype.save.call(this, attributes, options);
        },
        getPermissionModel: function () {
            var obj = _.extend(this.attributes.Permissions, {
                OfUsername: this.attributes.Username
            });
            return new Entities.UserPermissionsModel(obj);
        }
    });

    // Ïðîñìîòð è èçìåíåíèå ñâîåãî ïðîôèëÿ
    Entities.ProfileModel = Entities.Model.extend({
        url: '/api/Account/UserInfo',
        submitUrl: '/api/Account/UpdateMyProfile',
        parse: function (data, xhr) {
            if (!_.isObject(data)) return;
            return {
                AcceptedDate: data.AcceptedDate,
                AcceptedVersion: data.AcceptedVersion,
                
                CurrentVersionDate: data.CurrentVersionDate,
                CurrentVersion: data.CurrentVersion,

                CompanyId: data.CompanyId,
                CompanyLogo: data.CompanyLogo,
                CompanyName: data.CompanyName,

                Country: data.CountryCode,

                Email: data.Email,
                FirstName: _.unescape(data.FirstName),
                LastName: _.unescape(data.LastName),
                Login: data.Login,
                Organization: _.unescape(data.Organization),
                Role: data.Role,

                Filial: data.Organization
            };
        },
        initialize: function () {
            var validationGlobPath = 'profile/errors/';
            this.validation = this.getValidationRules(this.submitUrl, validationGlobPath);
            this.on('validated:invalid', App.Analytics.profileValidationError);
            this.on('sync', this.onSync);
        },
        onSync: function (model) {
            //Сохраняем первоначальное состояние модели для дальнейшего использования в Analytics.profileEditSuccessEvent
            this.analyticsSourceModel = model.toJSON();
        },
        save: function (attributes, options) {
            options = _.defaults((options || {}), { url: this.submitUrl });
            return Entities.Model.prototype.save.call(this, attributes, options);
        }
    });




    Entities.UserUserInfoResetPasswordModel = Entities.Model.extend({
        url: '/api/user/ResetPassword'
    });

    Entities.UserCreateInitiateModel = Entities.Model.extend({
        url: '/api/User/AddProfileInitiate'
    });

    Entities.UserDeleteModel = Entities.Model.extend({
        url: '/api/User/DeleteProfile'
    });

    Entities.UserCollection = Entities.PageableCollection.extend({
        url: '/api/Company/GetUserList',
        initialize: function () {
            Entities.PageableCollection.prototype.initialize.call(this);
            this.on('collection:setpage', App.Analytics.usersPageEvent);
        }
    });

    Entities.UserFilters = Entities.Model.extend({
        url: '/api/Company/GetUserFilters'
    });

    Entities.UserFilterModel = Entities.Model.extend({
        defaults: {
            'countryFilter': '',
            'organizationFilter': ''
        }
    });

    var API = {
        getUserShowModel: function (options) {
            var model = new Entities.UserShowModel();
            model.set('Username', options.Username);
            model.fetch();
            return model;
        },
        getProfileModel: function (options) {
            var model = new Entities.ProfileModel();
            model.fetch();
            return model;
        },

        getUserEntities: function (options) {
            var collection = new Entities.UserCollection();
            collection.fetch(options);
            return collection;
        },
        getUserFilters: function (options) {
            var filters = new Entities.UserFilters();
            filters.fetch();
            return filters;
        },
        getUserFilterEntity: function (options) {
            var filterObj;
            if (options) {
                filterObj = {
                    country: options.countryFilter,
                    organization: options.organizationFilter,
                    sort: options.sort
                };
            } else {
                filterObj = {};
            }
            return new Entities.UserFilterModel(filterObj);
        },
        getUserUserInfoResetPasswordModelInstance: function (options) {
            return new Entities.UserUserInfoResetPasswordModel({ OfUsername: options.Username });
        },
        getUserDeleteModelInstance: function (options) {
            return new Entities.UserDeleteModel({ OfUsername: options.Username });
        },
        getUserCreateInitiateModel: function () {
            var model = new Entities.UserCreateInitiateModel();
            model.fetch();
            return model;
        }
    };

    App.reqres.setHandler('user:entities', function (options) {
        return API.getUserEntities(options);
    });


    App.reqres.setHandler('user:show:entity', function (options) {
        return API.getUserShowModel(options);
    });
    App.reqres.setHandler('profile:entity', function (options) {
        return API.getProfileModel(options);
    });


    App.reqres.setHandler('user:create:initiate', function () {
        return API.getUserCreateInitiateModel();
    });

    App.reqres.setHandler('user:filter:entity', function (options) {
        return API.getUserFilterEntity(options);
    });

    App.reqres.setHandler('user:filters:entities', function (options) {
        return API.getUserFilters(options);
    });

    App.reqres.setHandler("userUserInfo:reset:password:model:instance", function (options) {
        return API.getUserUserInfoResetPasswordModelInstance(options);
    });

    App.reqres.setHandler("user:remove:model:instance", function (options) {
        return API.getUserDeleteModelInstance(options);
    });
});
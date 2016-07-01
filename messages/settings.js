App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.SupportedLanguageCollection = Entities.Collection.extend({
        initialize: function () {
            this.add(App.supportedLanguages);
        }
    });

    Entities.LanguageModel = Entities.Model.extend({
        url: '/api/Account/UpdateLanguage',
        save: function () {
            if (App.request('auth:isAuthorized')) {
                Entities.Model.prototype.save.apply(this, arguments);
            }
        }
    });

    Entities.SettingsModel = Entities.Model.extend({
        initialize: function () {
            this.listenTo(this, 'change:language', this.onLanguageChange);
            App.vent.on('change:language', this.onGlobalLanguageChange, this);
        },
        saveLang: function() {
            if (this.get('language')) {
                sessionStorage['language'] = JSON.stringify(this.get('language'));
            }
        },

        findLang: function (langCode) {
            return _.findWhere(App.supportedLanguages, { value: langCode })
                || { value: 'en', text: 'English' };
        },

        changeLang: function (newLang) {
            var langObj = this.findLang(newLang);
            this.set({ 'language': langObj }, { silent: false });
            this.saveLang();
        },
        onGlobalLanguageChange: function (language) {
            if (sessionStorage['language'] && sessionStorage['language'] != language) {
                sessionStorage['new_language'] = language;
            }
        },
        onLanguageChange: function () {
            if (App.request('auth:isAuthorized')) {
                var authModel = App.request('auth:entity');
                var lang = this.get('language').value,
                    langName = _.find(App.availableLanguages, function (i) {
                        return i.indexOf(lang) != -1;
                    }),
                    languageModel = new App.Entities.LanguageModel({ language: (langName || App.availableLanguages[0]).trim() });

                languageModel.save(null, {
                    success: _.bind(function (model, response) {

                        var newLang = model.get('language').split('_')[0];
                        this.changeLang(newLang);

                        var langObj = this.findLang(newLang);

                        App.AuthInfo.set({ language: newLang });
                        authModel.set({ language: newLang });

                        StorageQueue.put('save-store');
                        StorageQueue.put('lang-changed');

                        App.execute('page:reload');

                    }, this),
                    error: _.bind(function (model, resp) {

                        this.trigger('language:save:error', resp);
                        this.set({ 'language': '' }, { silent: true });
                    }, this)
                });
            } else {
                this.saveLang();
                App.execute('page:reload');
            }
        }
    });

    var API = {
        getLocalLanguage: function () {
            var sessionLang = sessionStorage['language'];
            if (sessionLang) {
                var sessionLangObj = JSON.parse(sessionStorage['language']);

                return sessionLangObj;
            }

            var navigatorLang = navigator.language || navigator.userLanguage;
            if (navigatorLang) {

                var code = navigatorLang.split('-')[0];
                var obj = _.findWhere(App.supportedLanguages, { value: code });
                if (obj) {
                    return obj;
                }
            }

            return { value: 'en', text: 'English' };
        },
        getSettingsEntity: function (options) {
            if (!App.settings) {
                var model = new Entities.SettingsModel();

                var lang = this.getLocalLanguage();
                model.set({ 'language': lang }, { silent: true });

                App.settings = model;
            }

            return App.settings;
        },
        getLanguageCollection: function () {
            return new Entities.SupportedLanguageCollection();
        },
        setSuppportedLanguages: function (data) {
            App.supportedLanguages = data;
        }
    };

    App.reqres.setHandler("settings:entity", function (options) {
        return API.getSettingsEntity(options);
    });

    App.reqres.setHandler("settings:language:entities", function (options) {
        return API.getLanguageCollection(options);
    });

    App.reqres.setHandler("settings:set:supportedLanguages", function (data) {
        return API.setSuppportedLanguages(data);
    });
});

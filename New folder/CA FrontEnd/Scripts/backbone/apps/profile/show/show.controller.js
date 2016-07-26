App.module("ProfileApp.Show", function (Show, App, Backbone, Marionette, $, _) {
    'use strict';

    Show.Controller = App.UserComponent.Controller.extend({
        globalizePath: 'profile/errors/',
        initialize: function () {
            this.userInfo = App.request('profile:entity');
            this.countryCollection = App.request('country:entities');
            this.filialsCollection = App.request('organizations:entities');

            this.layoutView = this.getLayoutView();
            
            this.listenTo(this.layoutView, 'show', this.showRegions);
            this.listenTo(this.layoutView, 'before:show', this.beforeShow);

            this.show(this.layoutView, {
                loading: {
                    entities: [
                        this.userInfo,
                        this.countryCollection,
                        this.filialsCollection
                    ],
                    errorHandler: _.bind(this.loadingErrorHandler, this)
                }
            });

            this.listenTo(this.layoutView, 'delete:profile', this.onDeleteProfile);
            this.listenTo(this.layoutView, 'delete:company', this.onDeleteCompany);
            this.listenTo(this.layoutView, 'profile:save', this.onProfileSave);
            this.listenTo(this.layoutView, 'reset:password', this.onResetPassword);
            this.listenTo(this.layoutView, 'file:agreement', this.onFileAgreement);
        },

        loadingErrorHandler: function (region, resp) {
            var loc = App.ErrorLocalizer.getModalText('profile/show/errors', resp);

            App.Analytics.profileOpenError(resp);

            var errorView = new App.ErrorApp.Show.MainRegionError({
                regionTitle: this.glob('profile/title-profile'),
                title: loc.title,
                text: loc.text
            });
            App.mainRegion.show(errorView);
        },

        beforeShow: function () {
            this.applyState(function (state) {
                if (state.Email == this.userInfo.get('Email'))
                    this.userInfo.set(state);
            });
        },

        showRegions: function () {
            var countryModel = this.countryCollection.findWhere({ ISOCode: this.userInfo.get('Country') });
            if (!countryModel) {
                App.error('Country not found in list');
            }
            this.initialCountry = countryModel && countryModel.get('ISOCode');

            if (this.userInfo.get('AcceptedVersion') == this.userInfo.get('CurrentVersion')) {
                var date = this.userInfo.get('AcceptedDate'),
                    localeDate = App.toLocalDate(date);

                var dateStr = Globalize.formatDate(localeDate, { date: "short" });

                this.layoutView.showFreshAgreement(dateStr);
            }

            this.listenTo(this.userInfo, 'change', this.onChange);


            var isMain = App.AuthInfo.isMain();

            this.layoutView.switchRemoveCompArea(isMain);
            
            if (isMain) this.showLogoRegion();
        },

        showLogoRegion: function () {
            //TODO LOGO Gusarov Вынести функционал по лого в отдельный контроллер

            this.logoModel = new App.Entities.LogoAddModel();

            this.logoView = new App.UserComponent.CompanyLogoView({
                model: this.logoModel,
                userInfoModel: this.userInfo
            });
            this.layoutView.logoRegion.show(this.logoView);
            this.layoutView.showCompanyLogo();

            this.loadLogo();

            this.listenTo(this.logoView, 'logo:send', this.onSendCompanyLogo);
            this.listenTo(this.logoView, 'delete:click', this.onDeleteCompanyLogo);
            this.listenTo(this.logoView, 'logo:replace', this.onReplaceCompanyLogo);
            this.listenTo(this.logoView, 'logo:select', this.onSelectCompanyLogo);
            this.listenTo(this.logoView, 'logo:fileAgreement', this.onLogoAgreementCall);
        },

        onSelectCompanyLogo: function () {
            App.Analytics.companyLogoEvent('Choose file');
        },

        // Первоначальное получение лого
        loadLogo: function () {
            var logoView = this.logoView;

            logoView.switchLogoLoading(true);

            var logoLinkModel = new App.Entities.LogoLinkModel();
            logoLinkModel.fetch({
                success: function (model, resp) {
                    logoView.switchLogoLoading(false);

                    // Если есть кастомное лого, то отображаем кнопку, которая 
                    //  вызывает модалку с подтверждением и только потом заменяет старое лого
                    logoView.showConfirmButton(!resp.IsDefault);
                    logoView.toggleLogoImage(resp.Base64String);

                },
                error: function (model, resp) {
                    logoView.toggleLogoImage();
                }
            });
        },

        // Удаление лого
        onDeleteCompanyLogo: function (logoView) {
            logoView.switchLoading(true);
            logoView.switchErrorMsg();

            App.Analytics.companyLogoEvent('Delete | Try');

            var deleteLogoModel = new App.Entities.LogoRemoveModel();
            deleteLogoModel.save(null, {
                success: _.bind(function (model, resp) {
                    var successText = this.glob('profile/companyLogo/success-deleted');
                    logoView.switchLoading(false, successText);
                    logoView.showConfirmButton(false);

                    App.Analytics.companyLogoEvent('Delete | Success');

                    logoView.toggleLogoImage();
                    App.vent.trigger('company:logo:change', App.logo.defaultUrl);
                }, this),
                error: function (model, resp) {
                    logoView.switchLoading(false);
                    logoView.showConfirmButton(true);

                    App.Analytics.companyLogoDeleteError(resp);

                    var msg = App.ErrorLocalizer.getErrorText('profile/companyLogo/errors', resp);
                    logoView.showErrorMsg(msg.text);
                }
            });
        },

        // Если не принято соглашение о загрузке файлов
        onLogoAgreementCall: function () {
            this.fileAgreementModel = new Backbone.Model();
            var userInfo = this.userInfo;
            App.Analytics.companyLogoEvent('Open file agreement');
            App.request('fileAgreements:view', {
                model: this.fileAgreementModel,
                region: App.modalRegion,
                analyticsCategory: 'Profile',
                analyticsRequestType: 'Company logo',
                success: function () {
                    var currentVer = userInfo.get('CurrentVersion');
                    userInfo.set({ AcceptedVersion: currentVer });
                }
            });
        },

        // Если лого уже есть, отображаем модалку с подтверждением замены
        onReplaceCompanyLogo: function () {
            App.Analytics.companyLogoEvent('Change | Open');
            App.request('logo:replace:view', {
                title: this.glob('profile/companyLogo/uploadConfirm/title'),
                text: this.glob('profile/companyLogo/uploadConfirm/text'),
                acceptButtonText: this.glob('profile/companyLogo/uploadConfirm/button'),
                parent: this.logoView
            });
        },

        // Отправка нового лого на сервер
        onSendCompanyLogo: function (logoView) {
            if (!this.logoModel.isValid(true)) return;

            logoView.switchLoading(true);
            logoView.switchErrorMsg();

            this.logoModel.save(null, {
                success: _.bind(function (model, resp) {
                    logoView.switchLoading(false, true);

                    App.Analytics.companyLogoEvent(logoView.isReplaceLogo ? 'Change | Success' : 'Add | Success');

                    logoView.showConfirmButton(!resp.IsDefault);
                    
                    App.vent.trigger('company:logo:change', resp.Base64String || App.logo.defaultUrl);

                    logoView.toggleLogoImage(resp.Base64String);
                }, this),
                error: _.bind(function (model, resp) {
                    logoView.switchLoading(false);

                    App.Analytics.companyLogoAddError(logoView.isReplaceLogo ? 'Change' : 'Add', resp);

                    if (resp.isValidationError) return;

                    var msg = App.ErrorLocalizer.getErrorText('profile/companyLogo/errors', resp);
                    logoView.switchErrorMsg(msg.text);
                }, this)
            });
        },


        onFileAgreement: function () {
            App.Analytics.profileEditEvent('Open file agreement');
            App.request('fileAgreements:view', {
                model: this.userInfo,
                region: App.modalRegion,
                analyticsCategory: 'Profile',
                analyticsRequestType: 'Edit profile',
                success: _.bind(function () {
                    var dateStr = Globalize.formatDate(new Date, { date: "short" });
                    this.layoutView.showFreshAgreement(dateStr);
                }, this)
            });
        },

        onProfileSave: function () {
            if (!this.userInfo.isValid(true)) return;

            this.layoutView.switchSaveProfileLoading(true);
            this.layoutView.switchErrorMsg(false);

            var filialName = this.userInfo.get('Organization');

            this.userInfo.save(null, {
                success: _.bind(function (model) {
                    this.layoutView.switchSaveProfileLoading(false, true);

                    if (filialName) {
                        var filials = this.filialsCollection;
                        if (!filials.findWhere({ Name: filialName })) {
                            filials.add({ Name: filialName, Id: filialName });
                            filials.trigger('reset');
                        }
                    }

                    App.Analytics.profileEditSuccessEvent(model);

                    store.remove(this.getStoreId());
                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchSaveProfileLoading(false);
                    var handled = this.commonErrorHandler(resp);

                    App.Analytics.profileEditError(resp);

                    if (!handled) {
                        var msg = this.glob('profile/personalinfo/saveError');
                        this.layoutView.switchErrorMsg(msg);
                    }
                }, this)
            });
        },

        onResetPassword: function () {
            App.Analytics.profileEditEvent('Reset password | Step 1 | Try');
            var resetPasswordModel = App.request('userInfo:reset:password:model:instance');

            resetPasswordModel.save(null, {
                success: _.bind(function () {
                    App.Analytics.profileEditEvent('Reset password | Step 1 | Success');
                    this.layoutView.switchPwdLoading(false, true);
                }, this),
                error: _.bind(function (model, resp) {
                    App.Analytics.profileResetPasswordError(resp);
                    this.layoutView.switchPwdLoading(false);
                    var handled = this.commonErrorHandler(resp);
                    if (!handled) this.layoutView.switchPwdErrorMsg(true);
                }, this)
            });
        },

        onDeleteProfile: function () {
            this.layoutView.switchDelProfErrorMsg(false);

            App.Analytics.profileEditEvent('Delete user | Step 1');

            App.request('confirm:view', {
                title: this.glob('profile/delete/confirm/title'),
                text: this.glob('profile/delete/confirm/text', { email: this.userInfo.get('Email') }),
                acceptButtonText: this.glob('profile/delete/confirm/button'),
                success: _.bind(function () {
                    App.Analytics.profileEditEvent('Delete user | Step 2');
                    this.layoutView.switchDelProfLoading(true);
                    var deleteProfile = App.request('profile:remove:model:instance');

                    deleteProfile.save(null, {
                        success: _.bind(function (model, resp) {

                            this.layoutView.switchDelProfLoading(false, true);

                        }, this),
                        error: _.bind(function (model, resp) {
                            var ret = this.getResponseMsg(resp),
                                msg = this.glob('profile/delete/errors/' + ret);

                            App.Analytics.profileDeleteError(resp);

                            this.layoutView.switchDelProfLoading(false);
                            this.layoutView.switchDelProfErrorMsg(msg);
                        }, this)
                    });
                }, this)
            });
        },

        onDeleteCompany: function () {
            this.layoutView.switchDelCompErrorMsg(false);

            App.Analytics.companyDeleteEvent('Step 1');

            App.request('confirm:view', {
                title: this.glob('profile/deleteCompany/confirm/title'),
                text: this.glob('profile/deleteCompany/confirm/description'),
                acceptButtonText: this.glob('profile/deleteCompany/confirm/continue'),
                success: _.bind(function () {
                    App.Analytics.companyDeleteEvent('Step 2');
                    this.layoutView.switchDelCompLoading(true);
                    var deleteCompany = App.request('company:remove:model:instance');

                    deleteCompany.save(null, {
                        success: _.bind(function (model, resp) {
                            var msg = this.getResponseMsg(resp),
                                str = this.glob('profile/deleteCompany/errors/' + msg);

                            this.layoutView.switchDelCompLoading(false, str);

                        }, this),
                        error: _.bind(function (model, resp) {
                            var msg = this.getResponseMsg(resp),
                                handled = this.commonErrorHandler(resp);

                            App.Analytics.companyDeleteError(resp);

                            if (msg == 'CompanyNotFound' && !handled) {
                                // Company already deleted and logout
                                var title = this.glob('account/deleteCompany/errors/CompanyNotFound/title'),
                                    text = this.glob('account/deleteCompany/errors/CompanyNotFound/message');

                                this.showModalError(title, text, { region: App.modalRegion });
                                App.execute('auth:logout');
                                return;
                            }

                            if (!handled) {
                                var str = this.glob('profile/deleteCompany/errors/' + msg);

                                this.layoutView.switchDelCompLoading(false);
                                this.layoutView.switchDelCompErrorMsg(str);
                            }
                        }, this)
                    });

                }, this)
            });
        },

        onChange: function () {
            var user = this.userInfo.toJSON(),
                storeUser = {
                    Email: user.Email,
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    Organization: user.Organization,
                    Country: user.Country
                };

            store.set(this.getStoreId(), storeUser);
        },

        getStoreId: function () {
            return 'user-show';
        },

        getLayoutView: function () {
            var title = this.glob('profile/title-profile');

            return new App.UserComponent.LayoutView({
                model: this.userInfo,
                countryCollection: this.countryCollection,
                filialsCollection: this.filialsCollection,
                features: {
                    fileUploadAgreement: true,
                    userPermissions: false,
                    deleteCompany: true,
                    companyLogo: true,
                    title: title
                }
            });
        }
    });
});
App.module("UserApp.Show", function (Show, App, Backbone, Marionette, $, _) {
    Show.Controller = App.UserComponent.Controller.extend({
        globalizePath: 'user/errors/',

        initialize: function() {
            this.userInfo = App.request('user:show:entity', { Username: this.options.username });
            this.countryCollection = App.request('country:entities');
            this.filialsCollection = App.request('organizations:entities');

            this.authModel = App.request('auth:entity');

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
            this.listenTo(this.layoutView, 'profile:save', this.onProfileSave);
            this.listenTo(this.layoutView, 'reset:password', this.onResetPassword);
        },

        loadingErrorHandler: function (region, resp) {
            var loc = App.ErrorLocalizer.getModalText('user/show/errors', resp);

            App.Analytics.manageUserOpenError(resp);

            var errorView = new App.ErrorApp.Show.MainRegionError({
                regionTitle: this.glob('profile/title-user'),
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

            this.permissionsModel = this.userInfo.getPermissionModel();
            this.permissionsView = new App.UserComponent.RightsView({
                model: this.permissionsModel,
                authModel: this.authModel
            });
            this.layoutView.userRightsRegion.show(this.permissionsView);

            this.listenTo(this.permissionsView, 'permissions:save', this.onPermissionsSave);
            this.listenTo(this.userInfo, 'change', this.onChange);
            this.listenTo(this.permissionsModel, 'change', this.onChange);
        },

        onPermissionsSave: function () {
            this.permissionsModel.save(null, {
                success: _.bind(function () {
                    App.Analytics.manageUserEvent('Permissions | Success');
                    this.permissionsView.switchLoading(false, true);
                }, this),
                error: _.bind(function (model, resp) {
                    this.permissionsView.switchLoading(false);

                    var handled = this.commonErrorHandler(resp);

                    if (!handled) {
                        this.permissionsView.switchError(true);
                    }
                }, this)
            });
        },

        onProfileSave: function () {
            if (!this.userInfo.isValid(true)) return;

            var filialName = this.userInfo.get('Organization');

            this.layoutView.switchSaveProfileLoading(true);
            this.layoutView.switchErrorMsg(false);

            this.userInfo.save(null, {
                success: _.bind(function (model) {
                    if (filialName) {
                        var filials = this.filialsCollection;
                        if (!filials.findWhere({ Name: filialName })) {
                            filials.add({ Name: filialName, Id: filialName });
                            filials.trigger('reset');
                        }
                    }

                    App.Analytics.manageUserPersonalDataSuccessEvent(model);

                    store.remove(this.getStoreId());
                    this.layoutView.switchSaveProfileLoading(false, true);

                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchSaveProfileLoading(false);

                    App.Analytics.manageUserPersonalDataError(resp);

                    if (resp.isValidationError) return;

                    var handled = this.commonErrorHandler(resp);

                    if (!handled) {
                        var msg = Globalize.formatMessage('profile/personalinfo/saveError');
                        this.layoutView.switchErrorMsg(msg);
                    }
                }, this)
            });
        },

        onResetPassword: function () {
            App.Analytics.manageUserEvent('Reset password | Step 1 | Try');
            var resetPasswordModel = App.request('userUserInfo:reset:password:model:instance', { Username: this.options.username });

            resetPasswordModel.save(null, {
                success: _.bind(function () {
                    var msg = this.glob('profile/resetPasswordSuccessUser');
                    this.layoutView.switchPwdLoading(false, msg);
                    App.Analytics.manageUserEvent('Reset password | Step 1 | Success');
                }, this),
                error: _.bind(function (model, resp) {
                    var code = this.getResponseMsg(resp);
                    
                    App.Analytics.manageUserResetPasswordError(resp);

                    if (code == "UnknownError") {
                        this.layoutView.switchPwdErrorMsg(true);
                        return;
                    }

                    var email = this.userInfo.get('Email');
                    var loc = App.ErrorLocalizer.getModalText('profile/resetPassword/errors', resp, { email: email });

                    this.showModalError(loc.title, loc.text, { region: App.modalRegion });

                    App.execute('user:list');
                }, this)
            });
        },

        onDeleteProfile: function () {
            App.Analytics.manageUserEvent('Delete user| Step 1');
            App.request('confirm:view', {
                title: this.glob('user/delete/confirm/title'),
                text: this.glob('user/delete/confirm/text', { email: this.userInfo.get('Email') }),
                acceptButtonText: this.glob('user/delete/confirm/button'),
                success: _.bind(function () {
                    App.Analytics.manageUserEvent('Delete user| Step 2');
                    this.layoutView.switchDelProfLoading(true);
                    this.layoutView.switchDelProfErrorMsg(false);

                    var deleteProfile = App.request('user:remove:model:instance', { Username: this.options.username });

                    deleteProfile.save(null, {
                        success: _.bind(function (model, resp) {
                            this.layoutView.switchDelProfLoading(false, true);

                            var title = this.glob('user/delete/success');
                            this.showModalSuccess(title);
                            App.execute('user:list');

                        }, this),
                        error: _.bind(function (model, resp) {
                            this.layoutView.switchDelProfLoading(false);

                            App.Analytics.manageUserDeleteError(resp);

                            // TODO Martynov: Предусмотреть UnexpectedException
                            var code = this.getResponseMsg(resp);
                            if (code == "UnknownError") {
                                this.layoutView.switchDelProfErrorMsg(this.glob('user/delete/errors/' + 'UnknownError/title'));
                                return;
                            }

                            var email = this.userInfo.get('Email');
                            var loc = App.ErrorLocalizer.getModalText('user/delete/errors', resp, { email: email });

                            this.showModalError(loc.title, loc.text, { region: App.modalRegion });

                            App.execute('user:list');

                        }, this)
                    });
                }, this)
            });
        },

        onChange: function() {
            var permission = this.permissionsModel.toJSON(),
                user = this.userInfo.toJSON(),
                storeUser = {
                    Email: user.Email,
                    Permissions: permission,
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    Organization: user.Organization,
                    Country: user.Country
                };

            store.set(this.getStoreId(), storeUser);
        },

        getStoreId: function() {
            return 'user-show';
        },

        getLayoutView: function () {
            var title = this.glob('profile/title-user');

            return new App.UserComponent.LayoutView({
                model: this.userInfo,
                countryCollection: this.countryCollection,
                filialsCollection: this.filialsCollection,
                features: {
                    fileUploadAgreement: false,
                    userPermissions: true,
                    deleteCompany: false,
                    title: title
                }
            });
        }
    });
});
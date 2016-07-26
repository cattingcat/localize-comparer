App.module("UserComponent", function (UserComponent, App, Backbone, Marionette, $, _) {

    UserComponent.LayoutView = App.Views.LayoutView.extend({
        template: "userShow/layout",
        className: "section",
        regions: {
            deleteRegion: '.delete-region',
            userRightsRegion: '.user-rights',
            logoRegion: '.company-logo'
        },
        initialize: function (options) {
            Backbone.Validation.bind(this, {
                valid: function (view, attr) {
                    Backbone.Validation.callbacks.valid.apply(this, arguments);
                    view.switchErrorMsg(false);
                },
                invalid: function (view, attr, error) {
                    Backbone.Validation.callbacks.invalid.apply(this, arguments);
                    view.switchErrorMsg(error);
                }
            });
            this.bindings = {
                '.profile-email': 'Email',
                '.profile-company': 'CompanyName',
                '.profile-company-id': {
                    observe: 'CompanyId',
                    onGet: function (val) {
                        return Globalize.formatMessage('profile/personalinfo/company-id', { companyId: val });
                    }
                },
                '.profile-first-name': 'FirstName',
                '.profile-last-name': 'LastName',
                '.profile-country': {
                    observe: 'Country',
                    collection: options.countryCollection,
                    textField: 'Name',
                    valueField: 'ISOCode'
                },
                '.profile-filial': {
                    observe: 'Organization',
                    collection: options.filialsCollection,
                    textField: 'Name',
                    valueField: 'Name',
                    placeholder: Globalize.formatMessage('profile/personalinfo/filialDefault')
                },
                '.profile-notifications': 'Notifications'
            };
        },

        ui: {
            'delCompanyBtn': '.delete-company-btn',
            'saveProfileBtn': '.profile-save-btn',
            'resetPasswordBtn': '.reset-password-btn'
        },
        triggers: {
            'click .profile-file-agreement-btn': 'file:agreement',
            'click .profile-file-agreement-accepted-link': 'file:agreement'
        },
        events: {
            'change .delete-company': 'onDeleteCompanyChange',

            'click @ui.saveProfileBtn': 'onSaveProfile',
            'click @ui.resetPasswordBtn': 'onResetPassword',

            'click @ui.delCompanyBtn': 'onDeleteCompany'
        },

        switchRemoveCompArea: function(state) {
            var area = this.$('.remove-company-area');
            area.toggleClass('off', !state);
        },

        showFreshAgreement: function (date) {
            this.$('.profile-file-agreement-last').addClass('off');
            this.$('.profile-file-agreement-accepted').removeClass('off');
            this.$('.profile-file-agreement-accepted-date').text(date);
            this.$('.buttonbar').removeClass('mrt2').addClass('mrt');
        },

        onDeleteCompanyChange: function (ev) {
            var errorEl = this.$('.delete-company-error');
            errorEl.addClass('off');
            var loader = this.$('.delete-company-wait');
            if (!loader.hasClass('off')) {
                ev.preventDefault();
                return;
            }

            var checked = ev.target.checked;
            var btn = this.ui.delCompanyBtn;
            var label = this.$('[for="c-agree-03"]');

            label.toggleClass('checked', checked);

            this._toggleBtn(btn, checked);
        },
        _toggleBtn: function (btn, state) {
            btn.data('trigger', state);

            btn.toggleClass('bg-gray', !state)
                .toggleClass('bg-red', state);
        },

        onSaveProfile: function (ev) {
            ev.preventDefault();
            var isTriggered = !this.ui.saveProfileBtn.hasClass('disabled');
            if (isTriggered) {
                this.trigger('profile:save');
            }
        },
        switchErrorMsg: function (error) {
            var errorEl = this.$('.profile-save-error');
            var okEl = this.$('.profile-save-ok');

            if (error) {
                errorEl.html(error).removeClass('off');
                okEl.addClass('off');
            } else {
                errorEl.addClass('off');
            }
        },
        switchSaveProfileLoading: function(state, successed) {
            var btn = this.$('.profile-save-btn');
            var loader = this.$('.profile-save-wait');
            var okMsg = this.$('.profile-save-ok');

            okMsg.addClass('off');

            if (state) {
                btn.addClass('disabled').addClass('bg-gray').removeClass('bg-green');
                loader.removeClass('off');
                okMsg.addClass('off');
            } else {
                loader.addClass('off');
                btn.removeClass('disabled').removeClass('bg-gray').addClass('bg-green');

                if (successed) {
                    okMsg.removeClass('off');
                }
            }
        },

        onResetPassword: function (ev) {
            ev.preventDefault();
            var isTriggered = !this.ui.resetPasswordBtn.hasClass('disabled');
            if (isTriggered) {
                this.switchPwdLoading(true);
                this.switchPwdErrorMsg(false);

                this.trigger('reset:password');
            }
        },
        switchPwdErrorMsg: function (error) {
            var errorEl = this.$('.reset-password-error');
            var okEl = this.$('.reset-password-ok');

            if (error) {
                if (_.isString(error)) {
                    errorEl.html(error);
                }
                errorEl.removeClass('off');
                okEl.addClass('off');
            } else {
                errorEl.addClass('off');
            }
        },
        switchPwdLoading: function (state, successedText) {
            var btn = this.$('.reset-password-btn');
            var loader = this.$('.reset-password-wait');
            var okMsg = this.$('.reset-password-ok');

            if (state) {
                btn.addClass('disabled').addClass('bg-gray').removeClass('bg-green');
                loader.removeClass('off');
                okMsg.addClass('off');
            } else {
                btn.removeClass('disabled').removeClass('bg-gray').addClass('bg-green');
                loader.addClass('off');

                if (_.isString(successedText)) {
                    okMsg.text(successedText);
                }

                if (successedText) {
                    okMsg.removeClass('off');
                }
            }
        },

        switchDelProfErrorMsg: function (error) {
            return this.deleteView.switchDelProfErrorMsg(error);
        },
        switchDelProfLoading: function (state, successed) {
            return this.deleteView.switchDelProfLoading(state, successed);
        },

        onDeleteCompany: function (ev) {
            ev.preventDefault();
            var isTrigger = this.ui.delCompanyBtn.data('trigger');
            if (isTrigger) {
                this.trigger('delete:company');
            }
        },
        switchDelCompErrorMsg: function (error) {
            var errorEl = this.$('.delete-company-error');
            var okEl = this.$('.delete-company-ok');

            if (error) {
                okEl.addClass('off');
                errorEl.html(error).removeClass('off');
            } else {
                errorEl.addClass('off');
            }
        },
        switchDelCompLoading: function (state, successedMsg) {
            var btn = this.ui.delCompanyBtn;
            var loader = this.$('.delete-company-wait');
            var okMsg = this.$('.delete-company-ok');
            this._toggleBtn(btn, !state);

            if (state) {
                loader.removeClass('off');
                okMsg.addClass('off');
            } else {
                loader.addClass('off');

                if (successedMsg) {

                    if (_.isString(successedMsg)) {
                        okMsg.html(successedMsg);
                    }

                    okMsg.removeClass('off');
                }
            }
        },

        showCompanyLogo: function () {
            this.$('.company-logo').removeClass('off');
        },

        onRender: function () {
            var fileUploadAgreement = this.options.features.fileUploadAgreement,
                userPermissions = this.options.features.userPermissions,
                deleteCompany = this.options.features.deleteCompany,
                uploadLogo = this.options.features.companyLogo,
                title = this.options.features.title;

            var selfDelete = (this.model.get('Login') == App.authModel.get('username'));
            this.deleteView = new UserComponent.DeleteView({ self: selfDelete });
            this.listenTo(this.deleteView, 'delete:profile', function () {
                this.trigger('delete:profile');
            });
            this.deleteRegion.show(this.deleteView);

            if (fileUploadAgreement) {
                this.$('.file-agreement-status').removeClass('off');
            }

            if (userPermissions) {
                this.$('.user-rights').removeClass('off');
            }

            if (title) {
                this.$('.layout-title').text(title);
            }

            if (this.model.get('CompanyId') == "Unknown company") {
                this.$('.filial').addClass('off');
            }

            if (!deleteCompany) {
                this.$('.remove-company-area').addClass('off');
            }
            
            this.stickit();
        }
    });


    UserComponent.RightsView = App.Views.LayoutView.extend({
        template: "userShow/user-rights",
        initialize: function () {
            this.bindings = {
                '.ViewAllRequests': 'ViewAllRequests',
                '.EditAllRequests': 'EditAllRequests',
                '.ManageContacts': 'ManageContacts',
                '.RemoveLicenses': 'RemoveLicenses'
            };
        },
        behaviors: {
            Checkboxes: {
                fields: {
                    'ViewAllRequests': {
                        'EditAllRequests': {
                            'ManageContacts': [],
                            'RemoveLicenses': []
                        }
                    }
                }
            }
        },
        ui: {
            'saveBtn': '.permissions-save-btn'
        },
        events: {
            'click @ui.saveBtn': 'onSaveBtnClick'
        },

        onSaveBtnClick: function (ev) {
            var isTriggered = !this.ui.saveBtn.hasClass('disabled');
            if (isTriggered) {
                this.switchLoading(true);
                this.switchError(false);

                this.trigger('permissions:save');
            }
        },

        switchLoading: function (state, successed) {
            var loader = this.$('.permissions-save-wait');
            var okMsg = this.$('.permissions-save-ok');
            this.switchButton(!state);

            if (state) {
                loader.removeClass('off');
                okMsg.addClass('off');
            } else {
                loader.addClass('off');

                if (successed) {
                    okMsg.removeClass('off');
                }
            }
        },

        switchError: function (error) {
            var okEl = this.$('.permissions-save-ok');
            var errEl = this.$('.permissions-save-error');

            if (error) {
                if (_.isString(error)) {
                    errEl.text(error);
                }
                errEl.removeClass('off');
                okEl.addClass('off');
            } else {
                errEl.addClass('off');
            }
        },

        switchButton: function (show) {
            var btn = this.ui.saveBtn;
            if (show) {
                btn.removeClass('bg-gray').addClass('bg-green').removeClass('disabled');
            } else {
                btn.removeClass('bg-green').addClass('bg-gray').addClass('disabled');
            }
        },

        onRender: function () {
            this.stickit();
            var role = this.options.authModel.get('role');

            if (role.indexOf('TA ') > -1) {
                this.$('.RemoveLicenses').parent().addClass('off');
                this.$('.AddLicenses').parent().addClass('off');

                this.model.set({
                    AddLicenses: false,
                    RemoveLicenses: false
                }, { silent: true });
            }
        }
    });

    UserComponent.DeleteView = App.Views.LayoutView.extend({
        getTemplate: function () {
            if (this.options.self)
                return 'userShow/profile-delete';

            return 'userShow/user-delete';
        },
        ui: {
            'delProfileBtn': '.delete-profile-btn'
        },
        events: {
            'change .delete-profile': 'onDeleteProfileChange',
            'click @ui.delProfileBtn': 'onDeleteProfile'
        },

        onDeleteProfileChange: function (ev) {
            var errorEl = this.$('.delete-profile-error');
            errorEl.addClass('off');

            var loader = this.$('.delete-profile-wait');
            if (!loader.hasClass('off')) {
                ev.preventDefault();
                return;
            }

            var checked = ev.target.checked;
            var btn = this.ui.delProfileBtn;
            var label = this.$('[for="c-agree-02"]');

            label.toggleClass('checked', checked);

            this._toggleBtn(btn, checked);
        },
        _toggleBtn: function (btn, state) {
            btn.data('trigger', state);

            btn.toggleClass('bg-gray', !state)
                .toggleClass('bg-red', state);
        },

        onDeleteProfile: function (ev) {
            ev.preventDefault();
            var isTrigger = this.ui.delProfileBtn.data('trigger');
            if (isTrigger) {
                this.trigger('delete:profile');
            }
        },

        switchDelProfErrorMsg: function (error) {
            var errorEl = this.$('.delete-profile-error');
            var okEl = this.$('.delete-profile-ok');

            if (error) {
                okEl.addClass('off');
                errorEl.html(error).removeClass('off');
            } else {
                errorEl.addClass('off');
            }
        },
        switchDelProfLoading: function (state, successed) {
            var btn = this.ui.delProfileBtn;
            var loader = this.$('.delete-profile-wait');
            var okMsg = this.$('.delete-profile-ok');
            this._toggleBtn(btn, !state);

            if (state) {
                loader.removeClass('off');
                okMsg.addClass('off');
            } else {
                loader.addClass('off');

                if (successed) {
                    okMsg.removeClass('off');
                }
            }
        }
    });
});
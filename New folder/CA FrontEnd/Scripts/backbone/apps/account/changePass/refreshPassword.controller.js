App.module("AccountApp.RefreshPass", function (RefreshPass, App, Backbone, Marionette, $, _) {
    'use strict';

    RefreshPass.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.model = new App.Entities.RefreshPasswordModel({
                Username: options.username
            });

            this.layoutView = this.getLayoutView();
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.layoutView });

            this.listenTo(this.layoutView, 'submit:pass', this.onSubmit);
            this.listenTo(this.layoutView, 'show', this.onShowRegions);
            this.listenTo(this.modalWrapper, 'modal:hide', this.onModalHide);

            this.show(this.modalWrapper, { loading: false });
        },

        // Обработка ошибок при проверке токена и при сабмите пароля
        onError: function (model, resp) {
            if (this.layoutView) {
                this.layoutView.switchLoading(false);
            }

            if (resp.isValidationError) return;

            var loc = App.ErrorLocalizer.getModalText(
                [this.options.globPath + 'errors', 'account/changePass/errors'], resp, this.model.get('TokenLink'));

            this.showModalError(loc.title, loc.text);
            this.onModalHide();
        },


        // Сабмит формы с валидными паролями
        onSubmit: function () {
            if (!this.model.isValid(true)) return;

            this.layoutView.switchLoading(true);

            this.model.save(null, {
                success: _.bind(function () {
                    this.successChangePassword = true;
                    var path = this.options.globPath + 'success/';
                    var successOpts = {
                        title: this.glob(path + 'title'),
                        text: this.glob(path + 'text'),
                        button: this.glob(path + 'button')
                    };

                    var view = new App.AccountApp.ChangePass.SuccessView(successOpts);
                    this.modalWrapper.setContent(view);

                    this.listenTo(view, 'success:click', _.bind(this.loginOnSuccess, this));
                }, this),
                error: _.bind(this.onError, this),
                complete: function () {
                    // Очистка сессий в соседних вкладках
                    App.request('auth:entity').clear();
                    App.AuthInfo.logout();
                }
            });
        },

        // На странице логина вводим логин и пароль
        onModalHide: function () {
            // Очистка сессий в соседних вкладках
            App.request('auth:entity').clear();
            App.AuthInfo.logout();

            if (!this.successChangePassword) return;

            App.navigate('/account/login');
            App.execute('account:login:focus', this.model.get('Username'), this.model.get('Password'));
        },

        onShowRegions: function () { },

        // В случае если пароль изменен успешно - пытаемся войти в CA
        loginOnSuccess: function () {
            // Если на форме есть каптча, то не пытаемся войти, т.к. не выйдет.
            if (App.request('loginView:needCaptcha')) {
                return this.modalWrapper.hide();
            }

            App.execute('loginView:switchloading', true);
            App.execute('auth:login', {
                data: {
                    username: this.model.get('Username'),
                    password: this.model.get('Password')
                },
                success: _.bind(function () {
                    _.defer(function () { App.execute('hub:start'); });
                    App.execute('request:list');
                }, this),
                error: _.bind(function (resp) {
                    App.execute('loginView:switchloading', false);
                    App.execute('loginView:refreshCaptcha', resp);
                }, this),
                complate: _.bind(function (resp) {
                    this.modalWrapper.hide();
                }, this)
            });
        },

        getLayoutView: function () {
            return new App.AccountApp.ChangePass.LayoutView({
                model: this.model,

                title: this.glob('account/refreshPassword/title'),
                description: this.glob('account/refreshPassword/description')
            });
        }
    });
});
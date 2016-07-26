App.module("AccountApp.ChangePass", function (ChangePass, App, Backbone, Marionette, $, _) {
    'use strict';

    ChangePass.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            var tokenLink = new App.Entities.LinkModel({
                url: options.checkUrl,

                Timestamp: options.timestamp || '',
                Token: options.token || '',
                Username: (options.username || '').toLowerCase()
            });

            this.model = new App.Entities.PasswordModel({
                url: options.submitUrl,
                TokenLink: tokenLink.toJSON()
            });

            this.analyticsCategory = options.analyticsCategory;
            this.model.analyticsCategory = options.analyticsCategory;

            if ((App.request('auth:role') == 'Anonymous')) {
                // Очистка сессий в соседних вкладках
                App.request('auth:entity').clear();
                App.AuthInfo.logout();
            }

            tokenLink.checkLink({
                success: _.bind(this.onTokenCorrect, this),
                error: _.bind(function (model, resp) {
                    App.Analytics.changePasswordOpenError(this.analyticsCategory, resp);
                    this.onError(model, resp);
                }, this),
                requestLogout: _.bind(this.onLogoutNeeded, this)
            });

            this.loadingView = this.getLoadingView();
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.loadingView });
            this.listenTo(this.modalWrapper, 'modal:hide', this.onModalHide);
            this.show(this.modalWrapper, { loading: false });
        },

        // Если проверка токена завершилась успехом, продолжаем процесс сброса пароля
        onTokenCorrect: function () {
            this.layoutView = this.getLayoutView();

            this.listenTo(this.layoutView, 'submit:pass', this.onSubmit);
            this.listenTo(this.layoutView, 'show', this.onShowRegions);

            this.modalWrapper.setContent(this.layoutView);

            App.Analytics.changePasswordStep2Event(this.analyticsCategory, 'Open', true);
        },

        // Обработка ошибок при проверке токена и при сабмите пароля
        onError: function (model, resp) {
            if(this.layoutView) {
                this.layoutView.switchLoading(false);
            }
            
            if (resp.isValidationError) return;

            var loc = App.ErrorLocalizer.getModalText(
                [this.options.globPath + 'errors', 'account/changePass/errors'], resp, this.model.get('TokenLink'));

            this.showModalError(loc.title, loc.text);
            this.onModalHide();
        },

        // Если с сервера вернулась ошибка HasActiveSessions
        //  выводим сообщение с предложением сделать логаут и повторяем попытку сьросить пароль
        onLogoutNeeded: function () {
            var repeatFunc = _.bind(function () {
                return new ChangePass.Controller(this);
            }, this.options);

            var view = new App.ErrorApp.Show.ConfirmLogout({
                globPath: this.options.globPath,
                isAnotherUser: (App.authModel.get('username') != this.model.get('TokenLink').Username),
                confirm: function () {
                    App.execute('auth:logout', {
                        complete: repeatFunc
                    });
                }
            });

            this.modalWrapper.setContent(view);

            App.Analytics.changePasswordStep2Error(this.analyticsCategory, null, "Has Active Sessions");
        },

        // Сабмит формы с валидными паролями
        onSubmit: function () {
            App.Analytics.changePasswordStep2Event(this.analyticsCategory, 'Try', true);

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

                    var view = new ChangePass.SuccessView(successOpts);
                    this.modalWrapper.setContent(view);
                    App.Analytics.viewResetPasswordSuccess(this.analyticsCategory);

                    // Очистка сессий в соседних вкладках
                    App.request('auth:entity').clear();
                    App.AuthInfo.logout();

                    this.listenTo(view, 'success:click', _.bind(this.loginOnSuccess, this));
                }, this),
                error: _.bind(function (model, resp) {
                    App.Analytics.changePasswordStep2Error(this.analyticsCategory, resp);
                    this.onError(model, resp);
                }, this)
            });
        },

        // На странице логина вводим логин и пароль
        onModalHide: function () {
            if (this.successChangePassword) {
                App.navigate('/account/login');
                var link = this.model.get('TokenLink');

                // Заполняем форму
                App.execute('account:login:focus', link.Username, this.model.get('Password'));
            }
        },

        onShowRegions: function () { },

        // В случае если пароль изменен успешно - пытаемся войти в CA
        loginOnSuccess: function () {
            // Если на форме есть каптча, то не пытаемся войти, т.к. не выйдет.
            if (App.request('loginView:needCaptcha')) {
                App.Analytics.changePasswordStep2Event(this.analyticsCategory, 'Success Need Captcha', false);
                return this.modalWrapper.hide();
            }

            var link = this.model.get('TokenLink');

            App.execute('loginView:switchloading', true);
            App.execute('auth:login', {
                data: {
                    username: link.Username,
                    password: this.model.get('Password')
                },
                success: _.bind(function () {
                    _.defer(function () { App.execute('hub:start'); });

                    App.Analytics.changePasswordStep2Event(this.analyticsCategory, 'Success', false);

                    App.execute('request:list');
                }, this),
                error: _.bind(function (resp) {
                    App.execute('loginView:switchloading', false);
                    App.execute('loginView:refreshCaptcha', resp);

                    App.Analytics.changePasswordStep2LoginError(this.analyticsCategory, resp);
                }, this),
                complete: _.bind(function (resp) {
                    this.modalWrapper.hide();
                }, this)
            });
        },

        getLayoutView: function () {
            return new ChangePass.LayoutView({ model: this.model });
        },

        getLoadingView: function () {
            return App.request('loading:view', {
                spinner: { color: '#fff' }
            });
        }
    });
});
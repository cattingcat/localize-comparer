App.module("AccountApp.Login", function (Login, App, Backbone, Marionette, $, _) {
    Login.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.model = App.request('account:login:model:instance');

            this.layoutView = this.getLayoutView();
            this.captchaView = this.getCaptchaView();

            this.listenTo(this.layoutView, 'show', this.showRegions);
            this.listenTo(this.layoutView, 'account:create', this.onCreate);
            this.listenTo(this.layoutView, 'account:forgot', this.onForgot);
            this.listenTo(this.layoutView, 'account:login', this.onLogin);
            this.listenTo(this.captchaView, 'validate', this.captchaValidation);
            this.listenTo(this.captchaView, 'fetching', this.captchaFetching);

            this.show(this.layoutView, { loading: false });
        },

        onCreate: function () {
            App.execute('account:create', App.modalRegion);
            App.Analytics.registrationStep1Event('Open');
        },

        onForgot: function () {
            App.execute('account:forgot', App.modalRegion);
            App.Analytics.passwordRecoveryStep1Event('Open', true);
        },

        onLogin: function () {
            App.Analytics.signInEvent('Try', null, true);

            var captcha = this.captchaView.model,
                isValidCaptcha = captcha.isValid(true);

            this.model.set('hash', captcha.get('Hash'));
            this.model.set('captcha', captcha.get('captcha'));

            if (!isValidCaptcha) {
                App.Analytics.signInError(null, 'Captcha Required');
            }

            if (!this.model.isValid(true) || !isValidCaptcha) return;

            if (!this.model.get('username')) {
                var loc = App.ErrorLocalizer.getErrorText('loginErrors', { responseJSON: { Code: 'WrongPassword' } });
                this.layoutView.addToErrorSummary('authError', loc.text);

                App.Analytics.signInError(null, 'Wrong Password');
                return;
            }

            this.layoutView.switchLoading(true);
            this.layoutView.removeFromErrorSummary('authError');

            App.execute('auth:login', {
                data: this.model.toJSON(),
                success: function () {
                    _.defer(function () { App.execute('hub:start'); });

                    App.Analytics.signInEvent('Success', null, false);

                    App.execute('request:list');
                },
                error: _.bind(function (resp) {
                    this.captchaView.refreshCaptcha(resp);
                    this.layoutView.switchLoading(false);
                    this.layoutView.showCaptchaRegion();

                    App.Analytics.signInError(resp);

                    if (resp.passExpired === 'True') {
                        App.Analytics.signInError(null, 'Password Expired');
                        App.execute('account:refreshPassword', {
                            login: this.model.get('username')
                        });
                        return;
                    }

                    var code = this.getResponseMsg(resp);
                    if (code == 'PasswordExpired') {
                        var data = resp.responseJSON.Data;
                        App.execute('account:resetPassword', this.model.get('username'), data.Timestamp, data.Token);
                        return;
                    }

                    var loc = App.ErrorLocalizer.getErrorText('loginErrors', resp);
                    this.layoutView.addToErrorSummary('authError', loc.text);
                }, this)
            });
        },

        showRegions: function () {
            this.layoutView.captchaRegion.show(this.captchaView);

            var loadingView = this.getLoadingView();
            this.layoutView.loginLoadingRegion.show(loadingView);

            // Устанавливаем обработчик для компонента сброса пароля-активации
            App.commands.setHandler('account:login:focus', _.bind(function (login, password) {
                this.model.set('username', login);
                this.layoutView.fillForm(login, password);
            }, this));

            // Получает текущее состояние формы логина, нужна ли каптча для входа
            App.reqres.setHandler('loginView:needCaptcha', _.bind(function () {
                var captchaNecessary = this.captchaView.model.get('IsNecessary');
                return captchaNecessary;
            }, this));

            // Устанавливаем обработчик для управления отображением состояния загрузки
            App.commands.setHandler('loginView:switchloading', _.bind(function (state) {
                this.layoutView.switchLoading(state);
            }, this));

            App.commands.setHandler('loginView:refreshCaptcha', _.bind(function (resp) {
                this.captchaView.refreshCaptcha(resp);
                this.layoutView.showCaptchaRegion();
            }, this));
        },

        captchaValidation: function (msg, attr) {
            this.layoutView.addToErrorSummary(attr, msg);
        },

        captchaFetching: function (options) {
            this.layoutView.switchSignInBtn(options.fetched);
        },

        getLayoutView: function () {
            return new Login.LayoutView({ model: this.model });
        },

        getCaptchaView: function () {
            return App.request('captcha:sts:view', { captchaType: 'Login' });
        },

        getErrorView: function (options) {
            return new Login.ErrorView(options);
        },

        getLoadingView: function () {
            return App.request('loading:view', {
                spinner: { color: '#fff' }
            });
        }

    });
});
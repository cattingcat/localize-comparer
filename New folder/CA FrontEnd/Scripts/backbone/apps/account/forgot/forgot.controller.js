App.module("AccountApp.Forgot", function (Forgot, App, Backbone, Marionette, $, _) {
    Forgot.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.model = App.request('account:forgot:model');

            this.layoutView = this.getLayoutView();
            
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.layoutView });

            this.listenTo(this.modalWrapper, 'modal:hide', this.onModalHide);
            this.listenTo(this.layoutView, 'continue:click', this.onContinueClick);
            this.listenTo(this.layoutView, 'show', this.onShowRegions);

            this.show(this.modalWrapper, { loading: false });
        },

        onModalHide: function () {
            App.navigate('/account/login');
        },

        onShowRegions: function () {
            this.captchaView = this.getCaptchaView();
            this.listenTo(this.captchaView.model, 'toggle:captcha', this.toggleCaptcha);
            this.listenTo(this.captchaView, 'validate', this.captchaValidation);
            this.listenTo(this.captchaView, 'fetching', this.captchaFetching);

            this.layoutView.captchaRegion.show(this.captchaView);

            this.loadingView = this.getLoadingView();
            this.layoutView.buttonLoadingRegion.show(this.loadingView);
        },

        toggleCaptcha: function(state) {
            this.layoutView.switchCaptcha(state);
        },

        captchaValidation: function (msg, attr) {
            this.layoutView.showErrorMessage(attr, msg);
        },

        captchaFetching: function (options) {
            this.layoutView.switchSubmitBtn(options.fetched);
        },

        onContinueClick: function () {
            App.Analytics.passwordRecoveryStep1Event('Try', true);

            var c = this.captchaView.model;
            this.model.set({ Hash: c.get('Hash'), Captcha: c.get('captcha') }, { silent: true });

            var isValidModel = this.model.isValid(true),
                isValidCaptcha = this.captchaView.model.isValid(true);

            if (!isValidModel || !isValidCaptcha) return;

            this.layoutView.switchLoading(true);
            this.model.save(null, {
                success: _.bind(function () {
                    var successView = this.getSuccessView();
                    this.modalWrapper.setContent(successView);

                    App.Analytics.passwordRecoveryStep1Event('Success', false);
                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);
                    this.captchaView.refreshCaptcha(resp);

                    App.Analytics.passwordRecoveryStep1Error(resp);

                    if (resp.isValidationError) return;
                    var email = model.get('Email');

                    var loc = App.ErrorLocalizer.getModalText('account/forgot/errors', resp, { email: email });

                    this.showModalError(loc.title, loc.text);
                }, this)
            });
        },

        getSuccessView: function () {
            return new Forgot.SuccessView({ model: this.model });
        },

        getErrorView: function (model) {
            return new Forgot.ErrorView({ model: model });
        },

        getLayoutView: function () {
            return new Forgot.LayoutView({ model: this.model });
        },
        
        getLoadingView: function () {
            return App.request('loading:view', {
                spinner: {
                    color: '#fff'
                }
            });
        },

        getCaptchaView: function () {
            return App.request('captcha:sts:view', { captchaType: 'ForgotPassword' });
        }
    });
});
App.module("AccountApp.Create", function (Create, App, Backbone, Marionette, $, _) {
    Create.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.model = App.request('account:create:model', {
                Language: App.request('settings:entity').get('language').value,
                AgreeToPassAnnualSurvey: true
            });

            this.countries = App.request('country:entities');
            this.captchaView = this.getCaptchaView();

            this.layoutView = this.getLayoutView();
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.layoutView });

            this.listenTo(this.modalWrapper, 'modal:hide', this.onModalHide);

            this.listenTo(this.layoutView, 'account:create', this.onAccountCreateClick);
            this.listenTo(this.layoutView, 'show', this.onShowRegions);

            this.listenTo(this.captchaView.model, 'toggle:captcha', this.toggleCaptcha);
            this.listenTo(this.captchaView, 'fetching', this.captchaFetching);
            this.listenTo(this.captchaView, 'validate', this.captchaValidation);

            this.show(this.modalWrapper, {
                loading: {
                    entities: [
                        this.countries,
                        this.captchaView.model
                    ],
                    modal: true,
                    errorHandler: _.bind(this.errorHandler, this)
                }
            });
        },

        errorHandler: function (region, resp) {
            var errModel = new Backbone.Model({
                errorTitle: Globalize.formatMessage('errors/500/title'),
                errorDescription: Globalize.formatMessage('errors/500/text')
            });

            var errView = this.getErrorView(errModel);
            this.modalWrapper = App.request('modal:wrapper', { contentView: errView });
            this.listenTo(this.modalWrapper, 'modal:hide', this.onModalHide);
            region.show(this.modalWrapper);

            return true;
        },

        onModalHide: function () {
            App.navigate('/account/login');
        },

        onShowRegions: function () {
            var selectedCountry = this.countries.selected;
            if (selectedCountry) this.model.set('Country', selectedCountry);
            
            this.layoutView.captchaRegion.show(this.captchaView);
            this.captchaView.switchLoading(false);
        },

        toggleCaptcha: function(state) {
            this.layoutView.switchCaptcha(state);
        },

        captchaValidation: function (msg, attr) {
            if (msg) {
                this.layoutView.showErrorMessage('Captcha', _.first(this.model.validation.Captcha).msg);
            } else {
                this.layoutView.hideErrorMessage('Captcha');
            }
        },

        onAccountCreateClick: function (flag) {
            App.Analytics.registrationStep1Event('Try');

            var c = this.captchaView.model.toJSON();
            this.model.set({ Hash: c.Hash, Captcha: c.captcha }, { silent: true });

            var isValidCaptcha = this.captchaView.model.isValid(true);
            if (!this.model.isValid(true) || !isValidCaptcha) return;

            this.layoutView.switchLoading(true);
            this.model.save(null, {
                success: _.bind(function () {
                    var successView = this.getSuccessView();
                    this.modalWrapper.setContent(successView);

                    if (this.model.has('KeyFile')) {
                        App.Analytics.registrationStep1Event('Success', 'Key file');
                    } else {
                        App.Analytics.registrationStep1Event('Success', 'Activation code');
                    }

                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);
                    this.captchaView.refreshCaptcha(resp);

                    App.Analytics.registrationStep1Error(resp);

                    if (resp.isValidationError) return;

                    var loc = App.ErrorLocalizer.getModalText('account/create/errors', resp);
                    this.showModalError(loc.title, loc.text);
                }, this)
            });
        },

        captchaFetching: function (options) {
            this.layoutView.switchBtn(options.fetched);
        },

        getLayoutView: function () {
            return new Create.LayoutView({ model: this.model, countries: this.countries });
        },

        getErrorView: function (model) {
            return new Create.ErrorView({ model: model });
        },

        getSuccessView: function () {
            return new Create.SuccessView({
                title: this.glob('account/create/success/title'),
                text: this.glob('account/create/success/text', { email: this.model.get('Email') })
            });
        },

        getCaptchaView: function () {
            return App.request('captcha:sts:view', { captchaType: 'Register' });
        }
    });
});
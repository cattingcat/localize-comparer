App.module("AccountApp.Forgot", function (Forgot, App, Backbone, Marionette, $, _) {

    Forgot.LayoutView = App.Views.LayoutView.extend({
        template: 'account/forgot/layout',
        regions:{
            captchaRegion: '.captcha-region',
            buttonLoadingRegion: '.button-loading-region'
        },
        ui: {
            'continueBtn': '.btn-account-forgot-continue'
        },
        events: {
            /* использует mousedown а не click т.к. валидация завязана на потерю инпутом фокуса
                а после события blur - click не вызывается */
            'mousedown @ui.continueBtn': 'onContinueClick'
        },

        initialize: function () {
            Backbone.Validation.bind(this, {
                valid: function (view, attr) {
                    Backbone.Validation.callbacks.valid.apply(this, arguments);
                    view.hideErrorMessage(attr);
                },
                invalid: function (view, attr, error) {
                    Backbone.Validation.callbacks.invalid.apply(this, arguments);
                    view.showErrorMessage(attr, error);
                }
            });

            this.bindings = {
                '.account-email': {
                    observe: 'Email',
                    toLower: true
                }
            };

            this.listenTo(App.vent, 'enter:press', this.onContinueClick);
        },

        onContinueClick: function () {
            var loading = this.$('.button-loading-region');
            var isNotLoading = loading.hasClass('off');
            if (isNotLoading){
                this.trigger('continue:click');
            }
        },

        hideErrorMessage: function (attr) {
            var item = this.$('[data-attribute="' + attr.toLowerCase() + '"]');
            item.addClass('off');
        },
        showErrorMessage: function (attr, error) {
            var item = this.$('[data-attribute="' + attr.toLowerCase() + '"]');
            item.html(error);
            item.removeClass('off');
        },

        onRender: function () {
            this.stickit();
        },

        switchLoading: function (isLoading) {
            var btn = this.ui.continueBtn,
                loading = this.$('.button-loading-region');

            if (isLoading) {
                var width = btn.outerWidth();
                loading.removeClass('off').css('left', width / 2);
                btn.addClass('transparent-color');
            } else {
                loading.addClass('off');
                btn.removeClass('transparent-color');
            }
        },

        switchCaptcha: function (state) {
            var region = this.$('.captcha-region'),
                err = this.$('.captcha-error');
            region.toggleClass('off', !state);
            err.toggleClass('off', !state);
        },

        switchSubmitBtn: function (state) {
            var btn = this.ui.continueBtn;
            btn.attr('disabled', !state).toggleClass('bg-gray', !state);
        }
    });

    Forgot.ErrorView = App.Views.ItemView.extend({
        template: 'account/forgot/error'
    });

    Forgot.SuccessView = App.Views.ItemView.extend({
        template: 'account/forgot/success',
        onRender: function () {
            var email = this.model.get('Email');
            var title = Globalize.formatMessage('account/forgot/success/title', { email: email }),
                desc = Globalize.formatMessage('account/forgot/success/description', { email: email });
            this.$('.title').html(title);
            this.$('.description').html(desc);
            App.Analytics.viewAccountForgotSuccess();
        }
    });
});
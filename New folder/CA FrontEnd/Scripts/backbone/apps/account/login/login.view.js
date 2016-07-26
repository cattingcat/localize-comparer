App.module("AccountApp.Login", function (Login, App, Backbone, Marionette, $, _) {

    Login.LayoutView = App.Views.LayoutView.extend({
        template: "account/login/layout",
        className: "page-login",
        regions: {
            'captchaRegion': '.area-login .captcha-region',
            'loginLoadingRegion': '.area-login .login-loading-region'
        },
        bindings: {
            '.area-login .account-email': _.extend({}, BackboneHelpers.trimObject, {
                observe: 'username',
                validateOnFocusOut: false,
                toLower: true
            }),
            '.area-login .account-password': {
                observe: 'password',
                validateOnFocusOut: false
            }
        },
        ui: {
            signInBtn: '.area-login .btn-account-login',
            btnLoader: '.area-login .login-loading-region',
            form: '#loginForm',
            summaryEl: '.area-login .error-summary'
        },
        triggers: {
            'click .area-login .account-create': 'account:create',
            'click .area-login .account-forgot': 'account:forgot'
        },
        events: {
            'mousedown @ui.signInBtn': 'onLoginClick'
        },
        initialize: function () {
            Backbone.Validation.bind(this, {
                valid: function (view, attr) {
                    Backbone.Validation.callbacks.valid.apply(this, arguments);
                    view.removeFromErrorSummary(attr);
                },
                invalid: function (view, attr, error) {
                    Backbone.Validation.callbacks.invalid.apply(this, arguments);
                    view.addToErrorSummary(attr, error);
                }
            });

            this.listenTo(App.vent, 'enter:press', this.onLoginClick);
        },

        onLoginClick: function () {
            var loader = this.ui.btnLoader,
                isNotLoading = loader.hasClass('off');

            if (isNotLoading && !App.modalRegion.hasView()) {
                this.trigger('account:login');
            }
        },

        addToErrorSummary: function (attr, error) {
            var summaryEl = this.ui.summaryEl;
            var item = summaryEl.find('[data-attribute="' + attr + '"]');

            if (!item || !item.length) {
                item = $('<div class="clr-red small pd-small" data-attribute="' + attr + '"></div>');
                summaryEl.append(item);
            }

            item.html(error);
            item.show();
        },

        fillForm: function (email, password) {
            var pass = this.$('.area-login .account-password');
            pass.val(password).removeClass('off');
            pass.trigger('change');
            this.$('.area-login .psw').addClass('off');
        },

        removeFromErrorSummary: function (attr) {
            var item = this.ui.summaryEl.find('[data-attribute="' + attr + '"]');
            item.hide();
        },

        onRender: function () {
            this.stickit();
            this.$('.area-login .info-txt i').hover(
	            function () { $(this).find('span').removeClass('off'); },
	            function () { $(this).find('span').addClass('off'); }
            );
            this.ui.form.submit(function (event) { event.preventDefault(); });
        },

        switchLoading: function (isLoading) {
            var btn = this.ui.signInBtn,
                loader = this.ui.btnLoader;

            loader.toggleClass('off', !isLoading);
            btn.toggleClass('transparent-color', isLoading);
        },

        switchSignInBtn: function (state) {
            var btn = this.ui.signInBtn;
            btn.attr('disabled', !state).toggleClass('bg-gray', !state);
        },

        showCaptchaRegion: function () {
            this.$('.captcha-region').removeClass('off');
        }
    });

    Login.ErrorView = App.Views.ItemView.extend({
        template: 'account/login/error',
        initialize: function (options) {
            var o = options || options.model;
            if (!o.has('errorOkBtn')) {
                o.set('errorOkBtn', Globalize.formatMessage('account/login/close'));
            }
        },
        serializeData: function () {
            var model = this.options || this.options.model;
            return model.toJSON();
        }
    });

});
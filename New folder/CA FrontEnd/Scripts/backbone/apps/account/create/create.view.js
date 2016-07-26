App.module("AccountApp.Create", function (Create, App, Backbone, Marionette, $, _) {
    
    Create.KeyInfoView = App.Views.LayoutView.extend({
        template: 'account/create/key-info',
        serializeData: function () {
            return {
                name: this.model.name,
                size: this.model.size,
                nameLen: App.fileNameEllipsisClientRegistration
            };
        }
    });

    Create.LayoutView = App.Views.LayoutView.extend({
        template: 'account/create/layout',
        regions: {
            captchaRegion: '.captcha-region',
            buttonLoadingRegion: '.button-loading-region',
            keyInfoRegion: '.key-info-region'
        },
        ui: {
            createBtn: '.btn-account-create',
            keyFileInput: '.input-key-file',
            keyFileInputCancel: '.fileupload-cancel',
            keyFileBtn: '.account-key-file a',
            actCodeInput: '.account-activation-code'
        },
        events: {
            'click @ui.createBtn': 'onAccountCreate',
            'click @ui.keyFileInputCancel': 'onKeyFileInputCancel',
            'change @ui.keyFileInput': 'onKeyFileInputChanged'
        },
        modelEvents: {
            'change:KeyFile': 'onChangeLicense',
            'change:ActivationCode': 'onChangeLicense',
            'change:AcceptPrivacyStatement': 'onAccept'
        },
     
        initialize: function (options) {
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
                '.account-first-name': 'FirstName',
                '.account-last-name': 'LastName',
                '.account-company': 'Company',
                '.account-country': {
                    observe: 'Country',
                    collection: options.countries,
                    textField: 'Name',
                    valueField: 'ISOCode'
                },
                '.account-email': {
                    observe: 'Email',
                    toLower: true
                },
                '.account-activation-code': 'ActivationCode',
                '.account-accept-privacy-statement': 'AcceptPrivacyStatement',
                '.account-conduct-survey': 'AgreeToPassAnnualSurvey'
            };

            this.listenTo(App.vent, 'enter:press', this.onAccountCreate);
        },

        // Изменение файла-ключа или кода активации лицензии
        onChangeLicense: function (model, value) {
            var hasKeyFile = model.has('KeyFile'),
                hasCode = !!model.get('ActivationCode');
            
            if (hasKeyFile) {
                // Отображение информации о прикрепленном файле-ключе
                var keyInfoView = new Create.KeyInfoView({ model: model.get('KeyFile') });
                this.keyInfoRegion.show(keyInfoView);
            } else {
                this.keyInfoRegion.empty();
                this.hideErrorMessage('KeyFile');
            }

            this.ui.actCodeInput.prop('disabled', hasKeyFile);
            this.ui.keyFileBtn.toggleClass('disabled-upload', hasCode || hasKeyFile);
            this.ui.keyFileInput.prop('disabled', hasCode);
        },

        // Добавление файла
        onKeyFileInputChanged: function () {
            var file = this.ui.keyFileInput[0].files[0];

            var err = this.model.preValidate('KeyFile', file);
            if (err) return this.showErrorMessage('KeyFile', err);

            this.hideErrorMessage('KeyFile');
            this.model.set({ KeyFile: file });
            this.model.validate(['ActivationCode']);
        },
        // Удаление добавленного файла
        onKeyFileInputCancel: function () {
            this.ui.keyFileInput.closest("form").get(0).reset();
            this.model.unset('KeyFile');
        },

        onAccountCreate: function () {
            var loader = this.$('.button-loading-region'),
                btnDisabled = this.ui.createBtn.attr('disabled');

            // trigger event only if button enabled and view not in loading state
            if (loader.hasClass('off') && !btnDisabled) {
                this.trigger('account:create');
            }
        },

        onAccept: function () {
            var enable = this.model.get('AcceptPrivacyStatement');
            var btn = this.ui.createBtn;
            this.privacyAccepted = enable;

            btn.attr('disabled', !enable)
                .toggleClass('bg-green', enable)
                .toggleClass('bg-gray', !enable);
        },

        hideErrorMessage: function (attr) {
            var item = this.$('[data-attribute="' + attr + '"]');
            item.addClass('off');
        },
        showErrorMessage: function (attr, error) {
            var item = this.$('[data-attribute="' + attr + '"]');
            item.html(error);
            item.removeClass('off');
        },
        switchBtn: function (enable) {
            var btn = this.ui.createBtn;
            if (this.privacyAccepted) {
                btn.attr('disabled', !enable)
                    .toggleClass('bg-green', enable)
                    .toggleClass('bg-gray', !enable);
            }
        },

        stopPropagation: function (e) {
            e.stopPropagation();
        },
        onRender: function () {
            this.stickit();

            var codeInput = this.$('.account-activation-code');

            codeInput.mask("*****-*****-*****-*****", { autoclear: false });
            this.$('.activation-cf .info-txt i').hover(
                function () { $(this).find('span').removeClass('off'); },
                function () { $(this).find('span').addClass('off'); }
            );
            this.$('.account-accept-privacy-statement-label a').on('click', this.stopPropagation);

            codeInput.on('keydown', function (e) {
                // key-codes for IOL0 and 0 from NumLock
                if ([73, 79, 76, 48, 96].indexOf(e.keyCode) != -1)
                    e.preventDefault(); 
            });

            var spinnerView = App.request('loading:view', { spinner: { color: '#fff' } });
            this.buttonLoadingRegion.show(spinnerView);
        },
        switchLoading: function (isLoading) {
            var loader = this.$('.button-loading-region'),
                btn = this.ui.createBtn;

            if (isLoading) {
                var width = btn.outerWidth();
                loader.removeClass('off').css('left', width / 2);
                btn.addClass('transparent-color');
            } else {
                loader.addClass('off');
                btn.removeClass('transparent-color');
            }
        },
        switchCaptcha: function (state) {
            var region = this.$('.captcha-region'),
                err = this.$('.captcha-error');
            region.toggleClass('off', !state);
            err.toggleClass('off', false);
        }
    });

    Create.ErrorView = App.Views.LayoutView.extend({
        template: 'account/create/error'
    });

    Create.SuccessView = App.Views.LayoutView.extend({
        template: 'account/create/success',
        onRender: function () {
            this.$('.success-msg').html(this.options.text);
            App.Analytics.viewAccountCreateSuccess();
        }
    });
});
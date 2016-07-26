App.module("UserComponent", function (UserComponent, App, Backbone, Marionette, $, _) {
    'use strict';

    var glob = _.bind(Globalize.formatMessage, Globalize);

    UserComponent.LogoReplaceConfirmView = App.Views.LayoutView.extend({
        template: 'userShow/logo-upload-confirm',
        ui: {
            logoInputFile: '.input-logo-file'
        },
        events: {
            'click @ui.logoInputFile': 'onLogoInputFileClick'
        },
        initialize: function (options) {
            this.parent = options.parent;
            delete this.options.parent;
        },
        onLogoInputFileClick: function () {
            // Переносим инпут для файла в родительскую view
            this.parent.replaceFileInput(this.ui.logoInputFile);
            this.trigger('modal:close');
            this.destroy();
        },
        serializeData: function () {
            return this.options;
        }
    });

    UserComponent.CompanyLogoView = App.Views.LayoutView.extend({
        template: 'userShow/logo-upload',
        ui: {
            logoPlaceholder: '.logo-def',
            logoCustom: '.logo-custom',
            logoImg: '.logo-custom img',
            removeBtn: '.logo-del',
            spinner: '.spinner',
            success: '.success',
            fileInput: '.input-logo-file',
            errorMessage: '.error-message',
            uploadBtn: '.upload-button',
            logoSpinner:'.spinner-logo',
            replaceButton: '.upload-button-confirm'
        },
        events: {
            'click @ui.removeBtn': 'onRemoveClick',
            'click @ui.replaceButton': 'onReplaceButtonClick',
            'click @ui.uploadBtn': 'onUploadButtonClick',
            'change @ui.fileInput': 'onFileChange'
        },

        initialize: function (options) {
            Backbone.Validation.bind(this, {
                valid: function (view, attr) {
                    Backbone.Validation.callbacks.valid.apply(this, arguments);
                    view.switchErrorMsg();
                },
                invalid: function (view, attr, error) {
                    Backbone.Validation.callbacks.invalid.apply(this, arguments);
                    view.switchErrorMsg(error);
                }
            });
        },

        // Подмена инпута для лого на другой
        replaceFileInput: function (inputEl) {
            var destination = this.$(".input-logo-file-form");
            destination.empty();
            inputEl.prependTo(destination);
            this.ui.fileInput = inputEl;
            this.trigger('logo:select');
        },

        // Клик на кнопку замены лого на новое
        onReplaceButtonClick: function () {
            if (this.ui.replaceButton.hasClass('disabled'))
                return;
            this.switchErrorMsg();

            if (!this.checkAgreement()) {
                this.trigger('logo:fileAgreement');
            } else {
                this.trigger("logo:replace");
            }
        },

        // Клик по кнопке загрузки файла, если старого лого нет
        onUploadButtonClick: function (ev) {
            this.trigger('logo:select');
            this.switchErrorMsg();
            if (!this.checkAgreement()) {
                this.trigger('logo:fileAgreement');
                ev.stopPropagation();
                ev.preventDefault();
            }
        },

        // Проверка соглашения по загрузке файлов
        checkAgreement: function () {
            var userInfo = this.options.userInfoModel.toJSON(),
                accepted = userInfo.AcceptedVersion,
                current = userInfo.CurrentVersion;

            return accepted === current;
        },

        // Удаление лого
        onRemoveClick: function () {
            var isLoaded = this.ui.uploadBtn.hasClass("bg-gray");
            if (isLoaded) return;

            App.request('confirm:view', {
                title: glob('profile/companyLogo/deleteConfirm/title'),
                text: glob('profile/companyLogo/deleteConfirm/text'),
                acceptButtonText: glob('profile/companyLogo/deleteConfirm/button'),
                success: _.bind(function () {
                    this.imageFileInputReset();
                    this.trigger("delete:click", this);
                }, this)
            });
        },

        // Аттач файла и отправка
        onFileChange: function (e) {
            var file = e.target.files[0];
            this.model.set({ logoImage: file });
            this.imageFileInputReset();

            this.trigger('logo:send', this);
        },

        // Очистка инпута для файла-лого
        imageFileInputReset: function () {
            this.ui.fileInput.closest("form").get(0).reset();
        },

        // Переключатель спиннера в случае если 
        switchLoading: function (state, successed, isDefault) {
            if (state) {
                this._showLoading();
            } else {
                this._hideLoading();
                if (successed) {
                    if (_.isString(successed)) {
                        this.ui.success.html(successed);
                    } else {
                        var text = glob('profile/companyLogo/success');
                        this.ui.success.html(text);
                    }
                    this.ui.success.removeClass("off");
                }
            }
        },

        // Показываем либо кнопку для замены лого, либо для загрузки нового
        showConfirmButton: function(visible) {
            if (visible) {
                this.ui.replaceButton.removeClass("off");
                this.ui.uploadBtn.addClass("off");
                this.isReplaceLogo = true;
            } else {
                this.ui.replaceButton.addClass("off");
                this.ui.uploadBtn.removeClass("off");
                this.isReplaceLogo = false;
            }
        },

        // отображаем или прячем спиннер при получении старого лого
        switchLogoLoading: function (state) {
            this.ui.logoSpinner.toggleClass("off", !state);
            if(!state) this._hideLoading();
        },

        // Отображает новое лого или плейсхолдер
        toggleLogoImage: function (src) {
            this.ui.logoPlaceholder.toggleClass("off", !!src);
            this.ui.logoCustom.toggleClass('off', !src);

            if(src)
                this.ui.logoImg.attr("src", src);
        },


        switchErrorMsg: function (error) {
            this.ui.errorMessage.toggleClass('off', !error).html(error);
            this.ui.success.addClass("off");
        },

        _showLoading: function () {
            this.ui.removeBtn.addClass("off");
            this.ui.spinner.removeClass("off");
            this.ui.success.addClass("off");
            this.ui.uploadBtn.addClass('disabled').addClass('bg-gray').removeClass('bg-green');
            this.ui.replaceButton.addClass('disabled').addClass('bg-gray').removeClass('bg-green');
            this.ui.uploadBtn.find("form").hide();
        },

        _hideLoading: function () {
            this.ui.removeBtn.removeClass("off");
            this.ui.spinner.addClass("off");
            this.ui.uploadBtn.removeClass('disabled').removeClass('bg-gray').addClass('bg-green');
            this.ui.replaceButton.removeClass('disabled').removeClass('bg-gray').addClass('bg-green');
            this.ui.uploadBtn.find("form").show();
        }
    });


    App.reqres.setHandler("logo:replace:view", function (options) {
        var replaceView = new App.UserComponent.LogoReplaceConfirmView(options);

        var modalWrapper = App.request('modal:wrapper', { contentView: replaceView });
        App.modalRegion.show(modalWrapper);

        return replaceView;
    });
});
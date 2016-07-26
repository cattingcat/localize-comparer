App.module("AccountApp.ChangePass", function (ChangePass, App, Backbone, Marionette, $, _) {
    'user strict';

    ChangePass.LayoutView = App.Views.LayoutView.extend({
        template: 'account/changePass/layout',
        regions: {
            loadingRegion: '.loading-region'
        },
        bindings: {
            '.account-email': {
                observe: 'TokenLink',
                onGet: function (val) {
                    return  (val && val.Username) || this.model.get('Username');
                }
            },
            '.account-password': 'Password',
            '.account-confirm-password': 'ConfirmPassword'
        },
        ui: {
            changeBtn: '.btn-submit',
            closeBtn: '.wp-close'
        },
        events: {
            /* использует mousedown а не click т.к. валидация завязана на потерю инпутом фокуса
               а после события blur - click не вызывается */
            'mousedown @ui.changeBtn': 'onChangeClick'
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
            this.listenTo(App.vent, 'enter:press', this.onChangeClick);
        },

        onChangeClick: function () {
            var isNotLoading = this.$('.loading-region').hasClass('off');
            if (isNotLoading) {
                this.trigger('submit:pass');
            }
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
        onRender: function () {
            this.stickit();
            var loadingView = App.request('loading:view', {
                spinner: { color: '#fff' }
            });

            if (this.options.title) {
                this.$('.title').html(this.options.title);
            }

            if (this.options.description) {
                this.$('.description').html(this.options.description);
            }

            this.loadingRegion.show(loadingView);
        },
        switchLoading: function (isLoading) {
            var loading = this.$('.loading-region'),
                btn = this.ui.changeBtn;
            if (isLoading) {
                var width = btn.outerWidth();
                loading.removeClass('off').css('left', width / 2);
                btn.addClass('transparent-color');
            } else {
                loading.addClass('off');
                btn.removeClass('transparent-color');
            }
        }
    });


    ChangePass.SuccessView = App.Views.LayoutView.extend({
        template: 'account/changePass/success',
        regions: {
            loadingRegion: '.button-loading-region'
        },
        ui: {
            closeBtn: '.wp-close'
        },
        events: {
            'click input': 'onLogin'
        },
        serializeData: function () {
            return this.options;
        },
        onLogin: function () {
            var loading = this.$('.button-loading-region'),
                btn = this.ui.closeBtn;

            if (!btn.hasClass('transparent-color')) {
                loading.removeClass('off');
                btn.addClass('transparent-color');

                this.trigger('success:click');
            }
        },
        onRender: function () {
            var loadingView = App.request('loading:view', {
                spinner: { color: '#fff' }
            });
            this.loadingRegion.show(loadingView);
        }
    });
});
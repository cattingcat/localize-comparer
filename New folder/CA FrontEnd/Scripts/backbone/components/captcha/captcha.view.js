App.module("Components.Captcha", function (Captcha, App, Backbone, Marionette, $, _) {
    Captcha.LayoutView = App.Views.LayoutView.extend({
        template: 'captcha/layout',
        initialize: function() {
            Backbone.Validation.bind(this, {
                valid: function (view, attr) {
                    Backbone.Validation.callbacks.valid.apply(this, arguments);
                    view.trigger('validate', false, attr);
                },
                invalid: function (view, attr, error) {
                    Backbone.Validation.callbacks.invalid.apply(this, arguments);
                    view.trigger('validate', error, attr);
                }
            });
        },
        ui: {
            'captcha': '.captcha'
        },
        triggers: {
            'click img.captcha-img': 'refresh'
        },
        bindings: {
            '.captcha': 'captcha'
        },

        onRender: function () {
            if (this.model.get('image')) {
                this.refreshImage();
            }
            this.stickit();
        },
        
        refreshImage: function () {
            var necessary = this.model.get('IsNecessary'),
                captchaView = this.$('.captcha-view');

            this.$el.attr('captcha', necessary).prop('captcha', necessary);
            this.model.isNecessary = necessary;

            captchaView.toggleClass('off', !necessary);

            if (necessary) {
                var src = 'data:image/png;base64,' + this.model.get('Image');
                this.$('img.captcha-img').attr('src', src);

                this.model.trigger('toggle:captcha', true);
            } else {
                this.model.trigger('toggle:captcha', false);
            }
        },

        refreshCaptcha: function (resp) {
            var respJson = resp && resp.responseJSON;

            var hasCaptchaError = false;
            if (respJson && (respJson.Code || '').indexOf('Captcha') == 0) {
                hasCaptchaError = true;
            } else {
                var resp = respJson || {},
                modelState = resp.modelState || resp.ModelState;
                if (modelState) {
                    _.each(modelState, function(val, key) {
                        var fieldName = _.last(key.split('.'));
                        if (fieldName == 'Captcha') {
                            hasCaptchaError = true;
                        }
                    });
                }
            }
           
            this.ui.captcha.toggleClass('inp-err', hasCaptchaError);

            this.trigger('refresh', hasCaptchaError);
        },

        switchLoading: function(state) {
            var loading = this.$('.loading-region'),
                view = this.$('.captcha-view');

            loading.toggleClass('off', !state);

            if (state) {
                this.trigger('fetching', { fetched: false });
                view.addClass('off');
            } else {
                this.refreshImage();
                this.trigger('fetching', { fetched: true });
            }
        }

    });
});
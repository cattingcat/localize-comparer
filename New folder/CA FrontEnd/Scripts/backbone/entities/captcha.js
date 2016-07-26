App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.CaptchaModel = Entities.Model.extend({
        auth: false,
        initialize: function (attributes, options) {
            options = options || {};
            this.randId = Entities.generateGuid();
            this.captchaType = options.captchaType || 'Default';
            this.isNecessary = true;
            this.validation = {
                captcha: function (value, attr, opts, model) {
                    if (!this.isNecessary) return;
                    var error = Backbone.Validation.validators.required(value, attr, opts, this);
                    var ctx = this.validationContext || {};
                    if (ctx && (ctx.input || ctx.blur)) return;

                    if (error)
                        return Globalize.formatMessage('captcha/errors/CaptchaIsRequired');
                }
            };
        },
        generateNewCaptcha: function (options) {
            this.randId = Entities.generateGuid();
            this.fetch(options);
        }
    });
});
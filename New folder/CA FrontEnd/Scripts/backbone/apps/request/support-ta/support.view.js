App.module("RequestApp.SupportTA", function (SupportTA, App, Backbone, Marionette, $, _) {
    SupportTA.LayoutView = App.Views.LayoutView.extend({
        template: "request/support-ta/layout-ta",
        regions: {
            buttonsRegion: '.buttonbar-region'
        },
        events: {
            'click .about-product': 'toggleProductDescription',
            'click .product-description .btn-close': 'toggleProductDescription'
        },
        behaviors: {
            Comboboxes: {
                fields: {
                    'ProductId': {
                        'OSVersion': [],
                        'ProductVersion': [],
                        'TypeId': []
                    }
                }
            }
        },
        initialize: function (options) {
            Backbone.Validation.bind(this);
            this.bindings = {
                '.request-product': {
                    observe: 'ProductId',
                    collection: options.products,
                    textField: 'Name',
                    valueField: 'Id'
                },
                '.request-os-version': {
                    observe: 'OSVersion',
                    collection: options.OsVersions,
                    textField: 'Name',
                    valueField: 'Name',
                    placeholder: Globalize.formatMessage('request/support/osversion-placeholder')
                },
                '.request-product-version': {
                    observe: 'ProductVersion',
                    collection: options.productVersions,
                    textField: 'Version',
                    valueField: 'Version',
                    placeholder: Globalize.formatMessage('request/support-ta/product-ver-placeholder')
                },
                '.request-type': {
                    observe: 'TypeId',
                    collection: options.types,
                    textField: 'TypeName',
                    valueField: 'Id'
                },
                '.request-files': {
                    observe: 'AttachedFiles',
                    url: '/api/Request/UploadFile/TaSupport',
                    maxNumberOfFiles: 3,
                    userInfoModel: options.userInfo,
                    requestInfo: options.requestInfo,
                    analyticsRequestType: App.Analytics.getRequestType(this.model)
                },
                '.request-answers-email': 'NotifyEmails',
                '.request-theme': 'Summary',
                '.request-description': 'Description'
            };

            App.vent.on('esc:press', _.bind(function () {
                this.$('.product-description').addClass('off');
            }, this));

            this.buttonbar = new App.RequestPartial.LayoutView({ model: this.model });
            this.buttonbar.setup(this);
            this.listenTo(this.buttonbar, 'send:click', function () { this.trigger('request:send'); });
            this.listenTo(this.buttonbar, 'abort:click', function () { this.trigger('request:abort'); });
        },

        // Метод для обобщенной обработки ошибок валидации
        validationError: function (attr, error, options) {
            if (error && this.checkValidation(attr)) {
                this.switchError(error, attr);
            } else {
                this.switchError(false, attr);
            }
        },

        checkValidation: function (attr) {
            var pairs = _.pairs(this.bindings),
                index = _.findIndex(pairs, function (keyVal) {
                    return keyVal[1].observe == attr;
                }),
                pair = pairs[index];

            if (pair) {
                var selector = pair[0];
                return !this.$(selector).hasClass('disabled-box');
            } else {
                return true;
            }
        },

        onRender: function () {
            this.buttonsRegion.show(this.buttonbar);
            this.stickit();
        },

        toggleProductDescription: function (ev) {
            ev.preventDefault();
            var productDescriptionEl = this.$('.product-description');
            if (productDescriptionEl.hasClass('off')) {
                this.trigger('product:abort:click');
            }
            productDescriptionEl.toggleClass('off');
        }
    });
});
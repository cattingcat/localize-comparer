App.module("RequestApp.Support", function (Support, App, Backbone, Marionette, $, _) {

    Support.LicenseMessage = App.Views.LayoutView.extend({
        template: 'request/support/license-msg',
        tagName: 'div',
        className: 'p-alert ie-section',
        serializeData: function () {
            return {
                message: this.options.message
            };
        }
    });

    Support.LayoutView = App.Views.LayoutView.extend({
        template: "request/support/layout",
        regions: {
            buttonsRegion: '.buttonbar-region'
        },
        events: {
            'click .about-product': 'toggleProductDescription',
            'click .product-description .btn-close': 'toggleProductDescription',
        },
        behaviors: {
            Comboboxes: {
                fields: {
                    'ProductType': {
                        'ProductId': {
                            'OSVersion': [],
                            'ProductVersion': [],
                            'Type': {
                                'TypeId': []
                            }
                        }
                    }
                }
            }
        },
        initialize: function (options) {
            Backbone.Validation.bind(this);
            this.bindings = {
                '.request-product-type': {
                    observe: 'ProductType',
                    collection: options.productTypes,
                    textField: 'Name'
                },
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
                    valueField: 'Version'
                },
                '.request-type': {
                    observe: 'Type',
                    collection: options.types,
                    textField: 'Name'
                },
                '.request-subtype': {
                    observe: 'TypeId',
                    collection: options.subtypes,
                    textField: 'Name',
                    valueField: 'Id'
                },
                '.request-theme': 'Summary',
                '.request-description': 'Description',
                '.request-files': {
                    observe: 'AttachedFiles',
                    url: '/api/Request/UploadFile/TechSupport',
                    maxNumberOfFiles: 3,
                    userInfoModel: options.userInfo,
                    requestInfo: options.requestInfo,
                    analyticsRequestType: App.Analytics.getRequestType(this.model)
                }
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

        checkValidation: function(attr) {
            var pairs = _.pairs(this.bindings),
                index = _.findIndex(pairs, function(keyVal) {
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
        toggleProductDescription: function (ev) {
            ev.preventDefault();
            var productDescriptionEl = this.$('.product-description');
            if (productDescriptionEl.hasClass('off')) {
                this.trigger('product:abort:click');
            }
            productDescriptionEl.toggleClass('off');
        },
        onRender: function () {
            this.buttonsRegion.show(this.buttonbar);
            this.stickit();
        }
    });
});
App.module("RequestApp.Virlab", function (Virlab, App, Backbone, Marionette, $, _) {
    'use strict';

    Virlab.LayoutView = App.Views.LayoutView.extend({
        template: "request/virlab/layout",
        className: "section",
        regions: {
            buttonsRegion: '.buttonbar-region'
        },
        initialize: function () {
            Backbone.Validation.bind(this);
            this.bindings = {
                '.request-type': {
                    observe: 'TypeId',
                    collection: this.options.requestTypes,
                    textField: 'TypeName',
                    valueField: 'Id'
                },
                '.request-email': 'NotifyEmails',
                '.request-description': 'Description',
                '.request-files': {
                    observe: 'AttachedFiles',
                    url: '/api/Request/UploadFile/Amr',
                    maxNumberOfFiles: 3,
                    maxFileSize: App.limits.amrMaxFileSize,
                    userInfoModel: this.options.userInfoModel,
                    requestInfo: this.options.requestInfo,
                    analyticsRequestType: App.Analytics.getRequestType(this.model)
                }
            };

            /* TODO Martynov: старые строки глобализации, возможно стоит унифицировать и выкинуть
               ('request/virlab/confirm-title')
               ('request/virlab/confirm-text')
               ('request/virlab/confirm-button') */
            this.buttonbar = new App.RequestPartial.LayoutView({ model: this.model });
            this.buttonbar.setup(this);
            this.listenTo(this.buttonbar, 'send:click', function () { this.trigger('request:send'); });
            this.listenTo(this.buttonbar, 'abort:click', function () { this.trigger('request:abort'); });
        },

        // Метод для обобщенной обработки ошибок валидации
        validationError: function (attr, error, options) {
            this.switchError(error, attr);
        },

        onRender: function () {
            this.buttonsRegion.show(this.buttonbar);
            this.stickit();

            if (this.options.srdId === App.requests['virlab-msa']) {
                var titleText = Globalize.formatMessage('request/virlab-msa/title');
                this.$('.title-area h2').text(titleText);
            }
        }
    });
});
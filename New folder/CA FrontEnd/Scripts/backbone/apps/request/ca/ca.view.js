App.module("RequestApp.CA", function (CA, App, Backbone, Marionette, $, _) {
    'use strict';

    CA.LayoutView = App.Views.LayoutView.extend({
        template: "request/ca/layout",
        className: "section",
        regions: {
            buttonsRegion: '.buttonbar-region'
        },

        initialize: function () {
            Backbone.Validation.bind(this);
            this.bindings = {
                '.request-theme': 'Summary',
                '.request-description': 'Description',
                '.request-files': {
                    observe: 'AttachedFiles',
                    url: '/api/Request/UploadFile/CA',
                    maxNumberOfFiles: 3,
                    userInfoModel: this.options.userInfo,
                    requestInfo: this.options.requestInfo,
                    analyticsRequestType: App.Analytics.getRequestType(this.model)
                }
            };

            this.buttonbar = new App.RequestPartial.LayoutView({ model: this.model });
            this.buttonbar.setup(this);
            this.listenTo(this.buttonbar, 'send:click', function () { this.trigger('request:send'); });
            this.listenTo(this.buttonbar, 'abort:click', function () { this.trigger('request:abort'); });
        },

        // Метод для обобщенной обработки ошибок валидации
        validationError: function (attr, error, options) {
            this.switchError(error);
        },

        onRender: function () {
            this.buttonsRegion.show(this.buttonbar);
            this.stickit();
        }
    });

});
App.module("RequestApp.Feedback", function (Feedback, App, Backbone, Marionette, $, _) {
    'use strict';

    Feedback.LayoutView = App.Views.LayoutView.extend({
        template: "request/feedback/layout",
        className: "section",
        regions: {
            buttonsRegion: '.buttonbar-region'
        },
        behaviors: {
            Broadcasts: {}
        },

        initialize: function (options) {
            Backbone.Validation.bind(this);
            this.bindings = {
                '.request-theme': {
                    observe: 'TypeId',
                    collection: options.themeList,
                    textField: 'TypeName',
                    valueField: 'Id'
                },
                '.request-description': 'Details',
                '.request-number': {
                    observe: 'FeedbackRequest',
                    collection: options.requestList,
                    placeholder: Globalize.formatMessage('request/feedback/request-placeholder'),
                    wholeModel: true,
                    textField: function (attrs) {
                        return attrs.IncidentNumber + ' - ' + attrs.Summary;
                    }
                }
            };

            this.buttonbar = new App.RequestPartial.LayoutView();
            this.buttonbar.setup(this);
            this.listenTo(this.buttonbar, 'send:click', function () { this.trigger('request:send', this); });
            this.listenTo(this.buttonbar, 'abort:click', function () { this.trigger('request:abort', this); });
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
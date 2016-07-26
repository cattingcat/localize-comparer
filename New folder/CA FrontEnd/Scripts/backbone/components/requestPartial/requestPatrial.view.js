App.module("RequestPartial", function (RequestPartial, App, Backbone, Marionette, $, _) {
    'use strict';

    RequestPartial.Success = App.Views.LayoutView.extend({
        template: 'requestPartial/success',
        initialize: function(options) {
            if (!options.requestId)
                App.error('options.requestId required');
        },
        serializeData: function () {
            return { requestId: this.options.requestId };
        }
    });

    RequestPartial.LayoutView = App.Views.LayoutView.extend({
        template: "requestPartial/layout",
        ui: {
            sendBtn: '.btn-request-send',
            abortBtn: '.btn-request-abort',

            loaderEl: '.process-send-request',
            errorEl: '.error-send-request'
        },
        events: {
            'mousedown @ui.sendBtn': 'onSendClick',
            'mousedown @ui.abortBtn': 'onAbortClick'
        },

        onSendClick: function () {
            if (this.isLoading()) return;

            this.trigger('send:click', this);
        },

        onAbortClick: function () {
            if (this.isLoading()) return;

            App.request('confirm:view', {
                title: this.messages.abortTitle,
                text: this.messages.abortMessage,
                acceptButtonText: this.messages.abortButton,
                success: _.bind(function () {
                    App.Analytics.newRequestEvent(this.model, 'Cancel');
                    this.trigger('abort:click', this);
                }, this)
            });
        },

        isLoading: function () {
            return !this.ui.loaderEl.hasClass('off');
        },

        switchLoading: function (isLoading) {
            var send = this.ui.sendBtn,
                abort = this.ui.abortBtn,
                loader = this.ui.loaderEl;

            loader.toggleClass('off', !isLoading);

            send.attr('disabled', isLoading)
                .toggleClass('disabled bg-gray', isLoading)
                .toggleClass('bg-green', !isLoading);

            abort.attr('disabled', isLoading)
                .toggleClass('disabled bg-gray', isLoading)
                .toggleClass('bg-dark', !isLoading);
        },

        switchError: function (error, attr) {
            var errEl = $('<div data-attr="' + attr + '"> ' + error + ' </div>');

            var existEl = this.ui.errorEl.find('[data-attr="' + attr + '"]');
            if (!existEl.length) {
                this.ui.errorEl.append(errEl);
                existEl = errEl;
            }

            // Прячем все остальные сообщения
            if (error) {
                this.ui.errorEl.find('[data-attr]').addClass('off');
            }

            existEl.html(error).toggleClass('off', !error);

            var numberOfErrs = this.ui.errorEl.find('[data-attr]').not('.off').length;

            this.ui.errorEl.toggleClass('off', !numberOfErrs);

            //this.ui.errorEl.html(error).toggleClass('off', !error);
        },

        showSuccess: function (path, resp) {
            resp = resp || {};
            var options = { path: path, requestId: resp.IncidentNumber };
            if (resp.AttachedFileError) {
                options = {
                    path: 'request/errors/attach-files-error',
                    requestId: resp.IncidentNumber,
                    attachedFileErrors: resp.AttachedFileErrors.join(", ")
                };
            }

            if (resp.InstanceId) {
                options.InstanceId = resp.InstanceId;
            }

            var view = App.RequestApp.getSuccessView(options);
            this.listenTo(view, 'modal:hide', function () { App.execute('request:list'); });
            this.listenTo(view, 'request:link:click', _.bind(function () {
                 App.Analytics.newRequestPopUpClick(this.model);
            }, this));
            App.modalRegion.show(view);

            App.Analytics.pageViewRequestSubmitSuccess(this.model);
        },

        setup: function (context) {
            context.switchLoading = _.bind(this.switchLoading, this);
            context.switchError = _.bind(this.switchError, this);
            context.showSuccess = _.bind(this.showSuccess, this);
        },

        initialize: function () {
            this.messages = {
                abortTitle: Globalize.formatMessage('request/ca/confirm-title'),
                abortMessage: Globalize.formatMessage('request/ca/confirm-text'),
                abortButton: Globalize.formatMessage('request/ca/confirm-button')
            };
        },

        onRender: function () { }
    });
});
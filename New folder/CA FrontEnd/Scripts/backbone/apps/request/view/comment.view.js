App.module("RequestApp.View", function (View, App, Backbone, Marionette, $, _) {
    View.CommentBox = App.Views.LayoutView.extend({
        template: "request/view/comment-box",
        ui: {
            sendBtn: '.btn-request-send'
        },
        events: {
            'click @ui.sendBtn': 'sendBtnClick'
        },
        initialize: function (options) {
            Backbone.Validation.bind(this, {
                valid: function (view, attr) {
                    Backbone.Validation.callbacks.valid.apply(this, arguments);
                    view.switchErrorMessage(false);
                },
                invalid: function (view, attr, error) {
                    Backbone.Validation.callbacks.invalid.apply(this, arguments);
                    view.switchErrorMessage(error);
                }
            });
            this.bindings = {
                '.request-text': 'Text',
                '.request-files': {
                    observe: 'AttachedFiles',
                    url: '/api/Request/UploadFile/Comment',
                    maxNumberOfFiles: 3,
                    userInfoModel: options.userInfo,
                    requestInfo: options.requestInfo,
                    analyticsRequestType: App.Analytics.getRequestType(this.model)
                }
            };
        },
        sendBtnClick: function (ev) {
            ev.preventDefault();
            var isLoading = this.ui.sendBtn.hasClass('disabled');
            if (!isLoading)
                this.trigger('comment:send');
        },
        switchMsgLoading: function (isLoading) {
            var spinner = this.$('.process-send-comment');
            this.commonSwitch(isLoading, this.ui.sendBtn, spinner);
        },
        commonSwitch: function (state, button, spinner) {
            spinner = spinner || this.ui.spinner;
            spinner.toggleClass('off', !state);
            button.toggleClass('disabled', state)
                .toggleClass('bg-gray', state)
                .toggleClass('bg-green', !state);
        },
        switchErrorMessage: function (err) {
            var errEl = this.$('.err');
            if (err) {
                errEl.text(err).removeClass('off');
            } else {
                errEl.addClass('off');
            }
        },
        onRender: function () {
            this.stickit();
        }
    });
});
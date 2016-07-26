App.module("RequestApp.View", function (View, App, Backbone, Marionette, $, _) {
    View.LayoutView = App.Views.LayoutView.extend({
        template: "request/view/layout",
        className: "section",
        ui: {
            closeBtn: '.btn-request-close',
            openBtn: '.open-request',
            spinner: '.process-request'
        },
        regions: {
            worklogRegion: '.messages-region',
            lastMessageRegion: '.last-message-region',
            commentBoxRegion: '.comment-box-region'
        },
        events: {
            'click .toggle-messages': 'switchMessages',

            'click .show-answer-form': 'switchAnswerForm',
            'click .hide-answer-form': 'switchAnswerForm',

            'click @ui.openBtn': 'openReqClick',
            'click @ui.closeBtn': 'closeBtnClick',

            'click .file-name': 'downloadRequestFileClick'
        },

        initialize: function (options) {
            this.bindings = {
                '.request-title': 'Summary',
                '.request-number': 'IncidentNumber',
                '.request-status': {
                    observe: 'UserfriendlyStatus',
                    onGet: function (val) {
                        return Globalize.formatMessage('request/statuses/' + val);
                    }
                }
            };
        },

        serializeData: function () {
            var retVal = App.Views.ItemView.prototype.serializeData.apply(this);

            var status = retVal.UserfriendlyStatus,
                color = Helpers.getColorByStatus(status),
                /* для всех статусов, кроме Closed/Cancelled есть возможность добавлять комментарии*/
                isAvailableComments = !this.isRequestClosed();

            retVal.statusColorClass = color + '-stat';
            retVal.isAvailableComments = isAvailableComments;
            return retVal;
        },

        isRequestClosed: function (optionalStatus) {
            var status = optionalStatus || this.model.get('UserfriendlyStatus');
            return status.indexOf('Closed') != -1
                || status.indexOf('Cancelled') != -1;
        },

        closeBtnClick: function (ev) {
            ev.preventDefault();
            var isLoading = this.ui.closeBtn.hasClass('disabled');
            if (isLoading) return;

            App.request('confirm:view', {
                title: Globalize.formatMessage('request/view/confirm-title'),
                text: Globalize.formatMessage('request/view/confirm-text'),
                acceptButtonText: Globalize.formatMessage('request/view/confirm-button'),
                success: _.bind(function () {
                    this.switchCloseLoading(true);
                    this.trigger('close:request', this);
                }, this)
            });
        },

        openReqClick: function () {
            if (!this.ui.spinner.hasClass('off')) return;
            this.switchNewReqLoading(true);
            this.trigger('open:request');
        },

        showAttachFileErrorModal: function (resp) {
            var options = {
                path: 'request/errors/comment-attach-files-error',
                requestId: resp.IncidentNumber,
                attachedFileErrors: resp.AttachedFileErrors.join(", ")
            };
            var view = App.RequestApp.getSuccessView(options);
            App.modalRegion.show(view);
            return view;
        },

        switchCloseLoading: function (isLoading) {
            this.commonSwitch(isLoading, this.ui.closeBtn);
        },
        switchCloseError: function (err) {
            this.$('.close-req-err').toggleClass('off', !err).html(err);
        },

        switchNewReqLoading: function (isLoading) {
            this.commonSwitch(isLoading, this.ui.openBtn);
        },

        commonSwitch: function (state, button, spinner) {
            spinner = spinner || this.ui.spinner;
            spinner.toggleClass('off', !state);
            button.toggleClass('disabled', state)
                .toggleClass('bg-gray', state)
                .toggleClass('bg-green', !state);
        },

        switchMessages: function() {
            // Show all messages, or show last message
            var last = this.$('.last-message-region'),
                all = this.$('.messages-region'),
                btnMore = this.$('.show-more'),
                btnHide = this.$('.hide-all'),
                isLastShown = last.hasClass('off');

            if (isLastShown) {
                last.removeClass('off');
                all.addClass('off');
                btnMore.removeClass('off');
                btnHide.addClass('off');
            } else {
                last.addClass('off');
                all.removeClass('off');
                btnHide.removeClass('off');
                btnMore.addClass('off');
            }

            this.trigger('swith', { messages: !isLastShown });
        },

        switchAnswerForm: function (ev) {
            if (ev) ev.preventDefault();
            var showBtn = this.$('.show-answer-form');

            var isLoading = showBtn.hasClass('disabled');
            if (isLoading) return;

            var addArea = this.$('.add-area'),
                hideBtn = addArea.find('.hide-answer-form');
            this.trigger('swith', { answer: addArea.hasClass('off') });

            addArea.toggleClass('off');

            var maxWidth = _.max([hideBtn.width(), showBtn.width()]);
            showBtn.width(maxWidth);
            hideBtn.width(maxWidth);
        },

        checkPermission: function(){
            var isRequester = this.options.authModel.get('username') == this.model.get('CustomerLogin');
            // bacause it is minimal permissions for request viewing
            var isMain = (this.options.authModel.get('role').indexOf('CA User Show Requests') == -1);
            return (isRequester || isMain || this.isRequestClosed());
        },

        onRender: function () {
            this.stickit();

            var toggleBtn = this.$('.toggle-messages');

            if (!this.model.get('IsWorklogSuccess')) {
                var workLog =  this.model.get('Worklog');
                var worklogProblemView = new View.WorkLogProblem({ errorInfo: workLog && workLog.ErrorInfo });
                this.lastMessageRegion.show(worklogProblemView);
                toggleBtn.addClass('off');
            } else {
                var coll = this.model.get('Worklog');
                var authModel = App.request('auth:entity');
                if (coll.length != 0) {
                    coll.reset(coll.sortBy('SubmitDate'));

                    var worklogView = new View.Worklog({
                        collection: coll,
                        authModel: authModel
                    });
                    this.worklogRegion.show(worklogView);

                    var lastComment = new View.WorkItem({
                        model: coll.last(),
                        authModel: authModel
                    });
                    this.lastMessageRegion.show(lastComment);
                }


                if (this.model.get('Worklog').length < 2) {
                    toggleBtn.addClass('off');
                }
            }

            var btnsRegion = this.$('.modify-buttons');
            if (!this.model.get('IncidentNumber')) {
                btnsRegion.find('.btn').addClass('bg-gray disabled').removeClass('bg-green');
            }

            if (!this.checkPermission()) {
                btnsRegion.addClass('off');
            }
        },

        downloadRequestFileClick: function (e) {
            this.downloadFileClick(e);
            App.Analytics.requestEvent(this.model, 'Download file');
        },
    });
});
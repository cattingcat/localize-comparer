App.module("RequestApp.View", function (View, App, Backbone, Marionette, $, _) {
    View.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.model = App.request('request:entity', options.id);
            this.userInfoModel = App.request('userInfo:entity');

            this.commentModel = App.request('request:comment:instance');

            this.authModel = App.request('auth:entity');
            this.requestInfo = App.request('request:info:entity');          // Модель с информацияей о запросе

            this.layoutView = this.getLayoutView();
            this.commentView = this.getCommentBoxView();

            this.listenTo(this.commentView, 'comment:send', this.commentSend);
            this.listenTo(this.layoutView, 'show', this.showRegions);
            this.listenTo(this.layoutView, 'swith', this.toggleUIElements);
            this.listenTo(this.layoutView, 'close:request', this.closeRequest);
            this.listenTo(this.layoutView, 'open:request', this.openNewRequest);

            this.show(this.layoutView, {
                loading: {
                    entities: [this.model, this.userInfoModel],
                    errorHandler: _.bind(this.loadingErrorHandler, this)
                }
            });
        },

        loadingErrorHandler: function (region, resp) {
            var loc = App.ErrorLocalizer.getModalText('request/view/loadingErrors', resp);

            App.Analytics.requestOpenError(resp);

            var errorView = new App.ErrorApp.Show.MainRegionError({
                regionTitle: this.glob('request/list/tabs/requests'),
                title: loc.title,
                text: loc.text
            });
            App.mainRegion.show(errorView);

            return true;
        },

        showRegions: function () {
            this.commentModel.set({
                IncidentNumber: this.model.get('IncidentNumber')
            }, { silent: true });

            this.requestInfo.set({
                hash: this.model.get('RequestInfo').Hash,
                uploadId: this.model.get('RequestInfo').UploadId
            });

            this.layoutView.commentBoxRegion.show(this.commentView);

            this.applyState(function (state) {
                this.commentModel.set({ Text: state.Text });
                if (state.messages) this.layoutView.switchMessages();
                if (state.answer) this.layoutView.switchAnswerForm();
            });

            this.listenTo(this.commentModel, 'change', this.onChange);
        },

        commentSend: function () {
            App.Analytics.newRequestEvent(this.commentModel, 'Try');

            if (!this.commentModel.isValid(true)) return;

            this.commentView.switchMsgLoading(true);
            this.commentView.switchErrorMessage(false);

            var requestId = this.model.get('InstanceId');

            this.commentModel.save(null, {
                success: _.bind(function (model, resp) {
                    this.commentView.switchMsgLoading(false);
                    store.remove(this.getStoreId());

                    App.Analytics.newRequestEvent(model, 'Success', this.initiate);

                    if (resp.AttachedFileError) {
                        var modalView = this.layoutView.showAttachFileErrorModal(resp);
                        modalView.on('modal:hide', _.bind(function () {
                            App.execute('request:view', requestId);
                        }, this));
                    } else {
                        App.execute('request:view', requestId);
                    }

                }, this),
                error: _.bind(function (model, resp) {
                    this.commentView.switchMsgLoading(false);

                    App.Analytics.newRequestError(model, resp);

                    if (resp.isValidationError) return;

                    var err = App.ErrorLocalizer.getErrorText('request/view/errors', resp);
                    this.commentView.switchErrorMessage(err.text);
                }, this)
            });
        },

        toggleUIElements: function (o) {
            this.saveState(o);

            if (o.messages === true || o.messages === false) {
                App.Analytics.requestEvent(this.model, o.messages ? 'Show messages | Click' : 'Hide messages | Click');
            }
            if (o.answer) {
                App.Analytics.requestEvent(this.model, 'Answer | Open');
            }
        },

        closeRequest: function (view) {
            var closeRequestModel = App.request('close:request:model', {
                IncidentNumber: this.model.get('IncidentNumber')
            });
            view.switchCloseError(false);
            closeRequestModel.save(null, {
                success: function (model, resp) {
                    App.Analytics.requestEvent(this.model, 'Close request');
                    App.execute('request:list');
                },
                error: function (model, resp) {
                    view.switchCloseLoading(false);
                    var err = App.ErrorLocalizer.getErrorText(['request/view/closeErrors', 'request/view/errors'], resp);
                    view.switchCloseError(err.text);
                    App.Analytics.requestCloseError(resp);
                }
            });
        },

        openNewRequest: function () {
            App.request('requestTypeList:entities', {
                success: _.bind(function (list) {
                    this.layoutView.switchNewReqLoading(false);

                    // if we have only one available request type
                    if (list.length === 1) {
                        var url;
                        _.each(App.requests, function (value, key) {
                            if (value == list.at(0).get('SRDInstanceId')) url = key;
                        });
                        if (url) {
                            App.execute('request:create:' + url);
                        } else {
                            App.execute('error:forbidden');
                        }
                    } else {
                        App.execute('request:create', list);
                    }
                }, this),
                error: _.bind(function (resp) {
                    App.Analytics.requestTypeListError(resp);
                    this.layoutView.switchNewReqLoading(true);
                    App.execute('request:create');
                }, this)
            });
        },

        getStoreId: function () {
            return 'request_view_' + this.model.get('InstanceId')
                + '_' + this.userInfoModel.get('Email');
        },

        onChange: function (model, ev) {
            this.saveState({ Text: model.get('Text') });
        },

        getLayoutView: function () {
            return new View.LayoutView({
                model: this.model,
                authModel: this.authModel
            });
        },

        getCommentBoxView: function () {
            return new View.CommentBox({
                model: this.commentModel,
                userInfo: this.userInfoModel,
                requestInfo: this.requestInfo
            });
        }
    });
});
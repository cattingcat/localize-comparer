App.module("RequestApp.CA", function (CA, App, Backbone, Marionette, $, _) {
    CA.Controller = App.RequestApp.RequestControllerBase.extend({
        initialize: function () {
            App.execute('show:broadcast');

            this.model = App.request('request:ca:model:instance');
            this.userInfoModel = App.request('userInfo:entity');

            this.requestInfo = App.request('request:info:entity');          // Модель с информацияей о запросе
            this.initiate = App.request('request:ca:initiate');

            this.layoutView = this.getLayoutView();
            this.listenTo(this.layoutView, 'request:send', this.onRequestSend);
            this.listenTo(this.layoutView, 'request:abort', this.onRequestAbort);
            this.listenTo(this.layoutView, 'show', this.onShow);

            this.show(this.layoutView, {
                loading: {
                    entities: [this.initiate, this.userInfoModel],
                    errorHandler: _.bind(function (region, resp) {
                        App.Analytics.requestFormError(resp);
                        this.getErrorHandler(this.glob('request/ca/title'), 'request/ca/loadingErrors');
                    }, this)
                }
            });
        },

        onShow: function () {
            var modelStore = store.get(this.getStoreId());
            if (modelStore) {
                this.model.set({
                    Summary: modelStore.Summary,
                    Description: modelStore.Description
                });
            }

            this.requestInfo.set({
                hash: this.initiate.get('RequestInfo').Hash,
                uploadId: this.initiate.get('RequestInfo').UploadId
            });

            this.listenTo(this.model, 'change', this.onChange);
        },

        onRequestSend: function () {
            App.Analytics.newRequestEvent(this.model, 'Try');

            if (!this.model.isValid(true)) return;

            this.layoutView.switchLoading(true);
            this.layoutView.switchError(false);

            this.model.save(null, {
                success: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);
                    this.layoutView.showSuccess('request/ca/success', resp);
                    store.remove(this.getStoreId());

                    App.Analytics.newRequestEvent(model, 'Success', this.initiate);
                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);

                    App.Analytics.newRequestError(model, resp);

                    if (resp.isValidationError) return;

                    var ret = this.getResponseMsg(resp),
                        msg = this.glob('request/ca/errors/' + ret);

                    this.layoutView.switchError(msg);

                }, this)
            });
        },

        onRequestAbort: function () {
            store.remove(this.getStoreId());
            App.execute('request:list');
        },

        onChange: function () {
            var modelStore = this.model.toJSON();
            var storeModel = {
                Summary: modelStore.Summary,
                Description: modelStore.Description
            };

            store.set(this.getStoreId(), storeModel);
        },

        getLayoutView: function () {
            return new CA.LayoutView({
                model: this.model,
                userInfo: this.userInfoModel,
                requestInfo: this.requestInfo
            });
        },
        
        getStoreId: function () {
            return 'request_ca_' + this.userInfoModel.get('Email');
        }
    });
});
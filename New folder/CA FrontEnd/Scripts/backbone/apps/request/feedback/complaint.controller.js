App.module("RequestApp.Feedback", function (Feedback, App, Backbone, Marionette, $, _) {
    Feedback.Controller = App.RequestApp.RequestControllerBase.extend({
        initialize: function () {
            this.model = App.request('request:feedback:model');
            this.initiate = App.request('request:feedback:initiate');

            // Коллекции для списков типов запросов и реквестов
            this.ThemeList = new App.Entities.Collection();
            this.RequestList = new App.Entities.Collection();

            this.layoutView = new Feedback.LayoutView({
                model: this.model,
                themeList: this.ThemeList,
                requestList: this.RequestList
            });

            this.listenTo(this.layoutView, 'request:send', this.onRequestSend);
            this.listenTo(this.layoutView, 'request:abort', this.onRequestAbort);
            this.listenTo(this.layoutView, 'show', this.onShow);

            this.show(this.layoutView, {
                loading: {
                    entities: [this.initiate],
                    errorHandler: _.bind(this.getErrorHandler(this.glob('request/feedback/title'), 'request/feedback/loadingErrors'), this)
                }
            });
        },

        onShow: function () {
            this.RequestList.reset(this.initiate.get('FeedbackRequests'));
            this.ThemeList.reset(this.initiate.get('RequestTypes'));

            // Восстанавливаем состояние формы и LocalStorage
            var modelStore = store.get(this.getStoreId());
            if (modelStore) {
                this.model.set({
                    TypeId: modelStore.TypeId,
                    Details: modelStore.Details,
                    FeedbackRequest: this.RequestList.findWhere({ InstanceId: modelStore.RequestId })
                });
            }

            this.listenTo(this.model, 'change', this.onChange);
        },

        onRequestSend: function (view) {
            if (!this.model.isValid(true)) return;

            view.switchLoading(true);
            view.switchError(false);

            this.model.save(null, {
                success: _.bind(function (model, resp) {
                    view.showSuccess('request/feedback/success', resp);
                    store.remove(this.getStoreId());

                }, this),
                error: function (model, resp) {
                    if (resp.isValidationError) return;

                    var msg = App.ErrorLocalizer.getErrorText('request/feedback/errors', resp);
                    view.switchError(msg.text);
                },
                complete: function () {
                    view.switchLoading(false);
                }
            });
        },

        onRequestAbort: function (view) {
            store.remove(this.getStoreId());
            App.execute('request:list');
        },

        // При изменении модели сохраняем ее
        onChange: function (model, event) {
            var modelStore = model.toJSON(),
                reqId = modelStore.FeedbackRequest && modelStore.FeedbackRequest.get('InstanceId');

            var storeModel = {
                TypeId: modelStore.TypeId,
                Details: modelStore.Details,
                RequestId: reqId
            };

            store.set(this.getStoreId(), storeModel);
        },

        getStoreId: function () {
            return 'request_feedback';
        }
    });
});
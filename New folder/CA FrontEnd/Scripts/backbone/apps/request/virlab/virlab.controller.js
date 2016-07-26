App.module("RequestApp.Virlab", function (Virlab, App, Backbone, Marionette, $, _) {
    Virlab.Controller = App.RequestApp.RequestControllerBase.extend({
        initialize: function (options) {
            App.execute('show:broadcast');

            this.lang = App.request('settings:entity').get('language').value;

            // pass SRD Instance ID to model request
            this.model = App.request('request:virlab:instance', options);

            this.initiate = App.request('virlab:initiate');
            this.userInfo = App.request('userInfo:entity');
            this.requestInfo = App.request('request:info:entity');          // Модель с информацияей о запросе

            this.requestTypes = new App.Entities.Collection();

            this.layoutView = this.getLayoutView();
            this.listenTo(this.layoutView, 'show', this.onShow);
            this.listenTo(this.layoutView, 'request:send', this.onRequestSend);
            this.listenTo(this.layoutView, 'request:abort', this.onRequestAbort);
            this.listenTo(this.model, 'change:AttachedFiles', this.onChangeAttachedFiles);


            var titlePath = 'request/virlab/title',
                loadingErrPath = 'request/virlab/loadingErrors';
            if (this.options.srdId == App.requests['virlab-msa']) {
                titlePath = 'request/virlab-msa/title';
                loadingErrPath = 'request/virlab-msa/loadingErrors';
            }

            this.show(this.layoutView, {
                loading: {
                    entities: [this.initiate, this.userInfo],
                    errorHandler: _.bind(function (region, resp) {
                        App.Analytics.requestFormError(resp);
                        this.getErrorHandler(this.glob(titlePath), loadingErrPath);
                    }, this)
                }
            });
        },

        onShow: function () {
            this.requestTypes.reset(this.initiate.get('RequestTypes'));

            this.requestInfo.set({
                hash: this.initiate.get('RequestInfo').Hash,
                uploadId: this.initiate.get('RequestInfo').UploadId
            });

            var modelStore = store.get(this.getStoreId());
            if (modelStore) {
                this.model.set({
                    NotifyEmails: modelStore.NotifyEmails,
                    Description: modelStore.Description
                });

                var langStore = modelStore['lang_' + this.lang];
                if (langStore) {
                    var reqType = this.requestTypes.findWhere({ Id: langStore.TypeId });
                    if (reqType) this.model.set({ TypeId: langStore.TypeId });
                }
            }

            this.listenTo(this.model, 'change', this.onChange);
        },

        onChangeAttachedFiles: function () {
            var files = this.model.get('AttachedFiles');
            if (files && !_.isArray(files)) this.model.set('AttachedFiles', [files], { silent: true });
        },

        onRequestSend: function () {
            App.Analytics.newRequestEvent(this.model, 'Try', this.initiate);

            if (!this.model.isValid(true)) return;

            this.layoutView.switchLoading(true);
            this.layoutView.switchError(false);

            this.normalizeModel();

            this.model.save(null, {
                success: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);

                    var successPath = (this.options.srdId == App.requests['virlab-msa']) ?
                        'request/virlab-msa/success' : 'request/virlab/success';

                    this.layoutView.showSuccess(successPath, resp);
                    store.remove(this.getStoreId());

                    App.Analytics.newRequestEvent(model, 'Success');
                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);

                    App.Analytics.newRequestError(model, resp);

                    if (resp.isValidationError) return;

                    var ret = this.getResponseMsg(resp),
                        msg = this.glob('request/virlab/errors/' + ret);

                    this.layoutView.switchError(msg);
                }, this)
            });
        },

        onRequestAbort: function () {
            store.remove(this.getStoreId());
            App.execute('request:list');
        },

        normalizeModel: function () {
            var model = this.model.toJSON();

            this.model.set({
                CCEmail: (model.CCEmail || '').replace(/\s/g, '')
            }, { silent: true });

            return model;
        },

        onChange: function () {
            var model = this.normalizeModel();

            var storeModel = {
                NotifyEmails: model.NotifyEmails,
                Description: model.Description
            };

            storeModel['lang_' + this.lang] = {
                TypeId: model.TypeId
            };

            store.set(this.getStoreId(), storeModel);
        },

        getLayoutView: function () {
            return new Virlab.LayoutView({
                model: this.model,
                userInfoModel: this.userInfo,
                requestTypes: this.requestTypes,
                srdId: this.options.srdId,
                requestInfo: this.requestInfo
            });
        },

        getStoreId: function () {
            return 'request_' + this.options.srdId + this.userInfo.get('Email');
        }
    });
});
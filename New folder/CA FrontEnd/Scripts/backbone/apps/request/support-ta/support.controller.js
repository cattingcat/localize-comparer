App.module("RequestApp.SupportTA", function (SupportTA, App, Backbone, Marionette, $, _) {
    SupportTA.Controller = App.RequestApp.RequestControllerBase.extend({
        initialize: function (options) {
            var srdOpts = { Id: options.srdId };
            var settingsModel = App.request('settings:entity');

            this.lang = settingsModel.get('language').value;
            this.userInfo = App.request('userInfo:entity');
            this.authModel = App.request('auth:entity');

            this.initiate = App.request('request:initiate', srdOpts);  // Модель со списками продуктов-реквестов
            this.model = App.request('request:model:instance', srdOpts);    // Модель для сабмита на сервер
            this.requestInfo = App.request('request:info:entity');          // Модель с информацияей о запросе

            this.products =         new App.Entities.Collection();   // Продыкры доступные для данной "области защиты"
            this.productVersions =  new App.Entities.Collection();   // Версии выбранного "продукта" 
            this.OsVersions =       new App.Entities.Collection();   // Версии ОС на котрых поддерживает выбранный "продукт"
            this.types =            new App.Entities.Collection();   // Типы запросов, доступные для данного "продукта" и прикрепленных лицензий

            this.layoutView = this.getLayoutView();
            this.listenTo(this.layoutView, 'request:send', this.onRequestSend);
            this.listenTo(this.layoutView, 'request:abort', this.onRequestAbort);
            this.listenTo(this.layoutView, 'before:destroy', this.onViewDestroy);
            this.listenTo(this.layoutView, 'show', this.onShow);
            this.listenTo(this.layoutView, 'product:abort:click', this.onProductAboutClick);

            this.listenTo(this.model, 'change:ProductId', this.onProductIdChange);

            this.show(this.layoutView, {
                loading: {
                    entities: [this.initiate, this.userInfo],
                    errorHandler: _.bind(function (region, resp) {
                        App.Analytics.requestFormError(resp);
                        this.getErrorHandler(this.glob('request/support-ta/title'), 'request/support-ta/loadingErrors');
                    }, this)
                }
            });
        },

        loadFromStore: function () {
            var modelStore = store.get(this.getStoreId());
            if (!modelStore) return {};

            var obj = {
                Summary: modelStore.Summary,
                Description: modelStore.Description,
                NotifyEmails: modelStore.NotifyEmails
            };
            this.model.set(obj);

            var storage = modelStore['lang_' + this.lang];
            if (!storage) return;

            var product = this.products.findWhere({ Id: storage.ProductId });

            if (product) {
                this.model.set('ProductId', storage.ProductId);

                this.model.set('OSVersion', storage.OSVersion);
                this.model.set('ProductVersion', storage.ProductVersion);
            }

            var type = this.types.findWhere({ 'Id': storage.TypeId });
            if (type) {
                this.model.set('TypeId', storage.TypeId);
            }
        },

        onShow: function () {
            var products = this.initiate.get('Products');
            this.products.reset(products);

            var types = this.initiate.get('RequestTypes');
            this.types.reset(types);
            
            this.requestInfo.set({
                hash: this.initiate.get('RequestInfo').Hash,
                uploadId: this.initiate.get('RequestInfo').UploadId
            });

            this.loadFromStore();
            this.listenTo(this.model, 'change', this.onChange);
        },

        onBeforeDestroy: function(){
            App.lecenseErr.reset();
        },

        onRequestSend: function () {
            App.Analytics.newRequestEvent(this.model, 'Try');

            if (!this.model.isValid(true)) return;

            this.layoutView.switchLoading(true);
            this.layoutView.switchError(false);

            this.model.save(null, {
                success: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);
                    store.remove(this.getStoreId());
                    this.layoutView.showSuccess('request/support-ta/success', resp);

                    App.Analytics.newRequestEvent(model, 'Success', this.initiate);
                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);

                    App.Analytics.newRequestError(model, resp);

                    if (resp.isValidationError) return;

                    var ret = this.getResponseMsg(resp),
                        msg = this.glob('request/support/errors/' + ret);

                    this.layoutView.switchError(msg);
                }, this)
            });
        },

        onRequestAbort: function () {
            store.remove(this.getStoreId());
            App.execute('request:list');
        },

        onChange: function () {
            var model = this.model.toJSON();
            var storeModel = {
                Summary: model.Summary,
                Description: model.Description,
                NotifyEmails: model.NotifyEmails
            };
            storeModel['lang_' + this.lang] = {
                ProductId: model.ProductId,
                OSVersion: model.OSVersion,
                ProductVersion: model.ProductVersion,
                TypeId: model.TypeId
            };

            store.set(this.getStoreId(), storeModel);
        },

        onProductAboutClick: function () {
            App.Analytics.newRequestEvent(this.model, 'How-to | Product version');
        },

        // при смене продукта, нужно подставить в коллекции соответствующие версии ОС и версии продукта
        onProductIdChange: function (model, productId) {
            if (productId) {
                var product = this.products.findWhere({ Id: productId });

                var os = product.get('Os');
                os = _.map(os, function (i) { return { Name: i }; });

                var versions = product.get('Versions');
                versions = _.map(versions, function (i) { return { Version: i }; });

                this.productVersions.reset(versions);
                this.OsVersions.reset(os);
            } else {
                model.unset('ProductId');
                this.layoutView.validationError('ProductId', false);
                this.productVersions.reset([]);
                this.OsVersions.reset([]);
            }
            model.unset('OSVersion');
            model.unset('ProductVersion');
            model.unset('TypeId');
            this.layoutView.validationError('OSVersion', false);
            this.layoutView.validationError('ProductVersion', false);
            this.layoutView.validationError('TypeId', false);
        },

        getLayoutView: function () {
            var options = {
                // Модель для сабмита
                model: this.model,

                // Коллекции необходимые для заполнения полей модели
                products: this.products,
                productVersions: this.productVersions,
                OsVersions: this.OsVersions,
                types: this.types,

                // Для File upload-а
                userInfo: this.userInfo,
                requestInfo: this.requestInfo
            };

            return new SupportTA.LayoutView(options);
        },

        getStoreId: function () {
            return 'request_' + this.options.srdId + this.userInfo.get('Email');
        }
    });
});
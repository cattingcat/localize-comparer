App.module("RequestApp.SupportMSA", function (SupportMSA, App, Backbone, Marionette, $, _) {
    SupportMSA.Controller = App.RequestApp.RequestControllerBase.extend({
        initialize: function (options) {
            App.execute('show:broadcast');

            var srdOpts = { Id: options.srdId };
            var settingsModel = App.request('settings:entity');

            this.lang = settingsModel.get('language').value;
            this.userInfo = App.request('userInfo:entity');
            this.authModel = App.request('auth:entity');

            this.initiate = App.request('request:initiate', srdOpts);       // Модель со списками продуктов-реквестов
            this.model = App.request('request:model:instance', srdOpts);    // Модель для сабмита на сервер
            this.requestInfo = App.request('request:info:entity');          // Модель с информацияей о запросе

            this.productTypes =     new App.Entities.Collection();   // Security area - область защиты
            this.products =         new App.Entities.Collection();   // Продыкры доступные для данной "области защиты"
            this.productVersions =  new App.Entities.Collection();   // Версии выбранного "продукта" 
            this.OsVersions =       new App.Entities.Collection();   // Версии ОС на котрых поддерживает выбранный "продукт"
            this.types =            new App.Entities.Collection();   // Типы запросов, доступные для данного "продукта" и прикрепленных лицензий
            this.subtypes =         new App.Entities.Collection();   // Конкретизация типов запроса

            this.layoutView = this.getLayoutView();
            this.listenTo(this.layoutView, 'request:send', this.onRequestSend);
            this.listenTo(this.layoutView, 'request:abort', this.onRequestAbort);
            this.listenTo(this.layoutView, 'show', this.onShow);
            this.listenTo(this.layoutView, 'product:abort:click', this.onProductAboutClick);

            this.listenTo(this.model, 'change:ProductType', this.onProductTypeChange);
            this.listenTo(this.model, 'change:ProductId', this.onProductIdChange);
            this.listenTo(this.model, 'change:Type', this.onTypeChange);

            this.show(this.layoutView, {
                loading: {
                    entities: [this.userInfo, this.initiate],
                    errorHandler: _.bind(function (region, resp) {
                        App.Analytics.requestFormError(resp);
                        this.getErrorHandler(this.glob('request/support-msa/title'), 'request/support-msa/loadingErrors');
                    }, this)
                }
            });
        },

        loadFromStore: function () {
            var modelStore = store.get(this.getStoreId());
            if (!modelStore) return null;

            var obj = {
                Summary: modelStore.Summary,
                Description: modelStore.Description
            };

            this.model.set(obj);

            var storage = modelStore['lang_' + this.lang];
            if (!storage) return;

            var productType = this.productTypes.findWhere({ Name: storage.ProductType });

            this.model.set({ ProductType: productType });

            if (productType) {
                var product = this.products.findWhere({ Id: storage.ProductId });
                if (product) {
                    this.model.set({ ProductId: storage.ProductId });

                    var productVersion = this.productVersions.findWhere({ Version: storage.ProductVersion });
                    if (productVersion) {
                        this.model.set({ ProductVersion: storage.ProductVersion });
                    }

                    var OSVersion = storage.OSVersion;
                    this.model.set({ OSVersion: OSVersion });
                }
            }

            var type = this.types.findWhere({ Name: storage.Type });

            if (type) {
                this.model.set({ Type: type });
                var subtype = this.subtypes.findWhere({ Id: storage.TypeId });
                if (subtype) {
                    this.model.set({ TypeId: storage.TypeId });
                }
            }
        },

        onShow: function () {
            var products = this.initiate.get('Products'),
                uniqTypes = _.uniq(products, function (i) { return i.TypeName; }),
                productTypes = _.map(uniqTypes, function (i) { return { Name: i.TypeName }; });

            var allTypes = this.initiate.get('RequestTypes'),
                baseTypes = _.uniq(allTypes, function (i) { return i.Name; });

            this.requestInfo.set({
                hash: this.initiate.get('RequestInfo').Hash,
                uploadId: this.initiate.get('RequestInfo').UploadId
            });

            this.initiate.set({ AllTypes: baseTypes, ProductTypes: productTypes }, { silent: true });

            this.productTypes.reset(productTypes);
            this.types.reset(baseTypes);

            this.loadFromStore();

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
                    store.remove(this.getStoreId());
                    this.layoutView.showSuccess('request/support-msa/success', resp);

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

        // При изменении модели, сохраняем новые значения в Local storage
        onChange: function () {
            var modelStore = this.model.toJSON();
            var storeModel = {
                Summary: modelStore.Summary,
                Description: modelStore.Description
            };
            storeModel['lang_' + this.lang] = {
                ProductType: (modelStore.ProductType && modelStore.ProductType.get) ? modelStore.ProductType.get('Name') : null,
                ProductId: modelStore.ProductId,
                OSVersion: modelStore.OSVersion,
                ProductVersion: modelStore.ProductVersion,
                Type: (modelStore.Type && modelStore.Type.get) ? modelStore.Type.get('Name') : null,
                TypeId: modelStore.TypeId
            };

            store.set(this.getStoreId(), storeModel);
        },

        onProductAboutClick: function() {
            App.Analytics.newRequestEvent(this.model, 'How-to | Product version');
        },

        // При изменении категории продукта, получаем список продуктов выбранного типа
        onProductTypeChange: function (model, productType) {
            if (productType) {
                var allProducts = this.initiate.get('Products'),
                    products = _.filter(allProducts, function (i) {
                        return i.TypeName == productType.get('Name');
                    });

                this.products.reset(products);
            } else {
                this.products.reset([]);
            }

            model.unset('ProductId');
            this.layoutView.validationError('ProductId', false);
        },

        // При изменении продукта, получаем доступные для него типы запросов,
        //  версии самого продукта и ОС
        onProductIdChange: function (model, productId) {
            if (productId) {
                var product = this.products.findWhere({ Id: productId });

                // Categorization tier 2 :  Consumer/Corporate
                var catTier = product.get('CatTier2');

                // Выбираем только те подтипы запросов, которые предназначены для продуктов с 
                //  определенной категоризацией "catTier": Consumer или Corporate
                var subtypes = this.initiate.get('RequestTypes'),
                    productSubtypes = _.filter(subtypes, function (i) { return i.ServiceName == catTier; });

                // Сохраняем отфильтрованые подтипы на будущее
                this.initiate.set({ ProductSubtypes: productSubtypes }, { silent: true });

                var os = product.get('Os'),
                    versions = product.get('Versions'),
                    types = _.uniq(productSubtypes, function (i) { return i.Name; });

                os = _.map(os, function (i) { return { Name: i }; });
                versions = _.map(versions, function (i) { return { Version: i }; });

                this.OsVersions.reset(os);
                this.productVersions.reset(versions);
                this.types.reset(types);
            } else {
                model.unset('ProductId');
                this.layoutView.validationError('ProductId', false);
                this.OsVersions.reset([]);
                this.productVersions.reset([]);
                this.types.reset([]);
            }

            model.unset('OSVersion');
            model.unset('ProductVersion');
            model.unset('Type');
            this.layoutView.validationError('OSVersion', false);
            this.layoutView.validationError('ProductVersion', false);
            this.layoutView.validationError('Type', false);
        },

        // При изменении типа запроса, получаем возможные для этого типа подтипы
        onTypeChange: function (model, type) {
            if (type) {
                // Получаем подтипы, сохраненные при фильтрации по категоризации (onProductChange)
                var subtypes = this.initiate.get('ProductSubtypes'),
                    typeName = type.get('Name');

                subtypes = _.filter(subtypes, function (i) { return i.Name == typeName; });

                var currentSubtypes = _.map(subtypes, function (i) {
                    return { Name: i.SubtypeName, Id: i.Id };
                });

                this.subtypes.reset(currentSubtypes);
            } else {
                this.subtypes.reset([]);
            }

            this.model.unset('TypeId');
            this.layoutView.validationError('TypeId', false);
        },

        getLayoutView: function () {
            return new SupportMSA.LayoutView(this);
        },

        getStoreId: function () {
            return 'request_' + this.options.srdId + this.userInfo.get('Email');
        }
    });
});
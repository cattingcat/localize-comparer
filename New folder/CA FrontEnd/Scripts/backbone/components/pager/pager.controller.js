App.module("Components.Pager", function (Pager, App, Backbone, Marionette, $, _) {
    Pager.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            // pageable collection info;
            this.collection = options.collection;

            // collection of pages numbers;
            this.pageCollection = new App.Entities.Collection();
            this.setupPageCollection();

            this.layout = this.getLayoutView(options);
            this.listenTo(this.layout, 'childview:page:click', this.onPageClick);
            this.listenTo(this.collection, 'reset', this.onCollectionReset);
        },

        onPageClick: function (view, options) {
            // clicked page no
            var newPage = options.model.get('page');

            // refresh collection of entities;
            this.collection.getPage(newPage);

            // reset old currentPage
            this.pageCollection
                .findWhere({ isCurrent: true })
                .set({ isCurrent: false });

            // setup new currentPage
            options.model.set('isCurrent', true);

            // refresh view
            this.layout.render();
        },

        setupPageCollection: function () {
            var state = this.collection.state;

            this.pageCollection.reset([], { silent: true });
            for (var i = 1; i <= state.totalPages; i++) {
                this.pageCollection.add({
                    page: i,
                    isCurrent: (i == state.currentPage)
                }, { silent: true });
            }
        },

        onCollectionReset: function () {
            this.setupPageCollection();

            if (!this.layout || this.layout.isDestroyed) {
                this.layout = this.getLayoutView(this.options);
                this.listenTo(this.layout, 'childview:page:click', this.onPageClick);
            }

            this.layout.render();
        },

        getLayoutView: function (options) {
            return new Pager.Layout({ collection: this.pageCollection });
        }
    });

    App.reqres.setHandler("pager:view", function (options) {
        var controller = new Pager.Controller(options);
        return controller.layout;
    });
});